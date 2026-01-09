import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { MediaUploader } from '@/components/upload/MediaUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCases } from '@/hooks/useCases';
import { useMediaFiles } from '@/hooks/useMediaFiles';
import { useStartAnalysis } from '@/hooks/useAnalysis';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Plus, Loader2, UserCheck, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cases, createCase } = useCases();
  const { uploadMedia } = useMediaFiles();
  const { startAnalysis } = useStartAnalysis();
  const { logActivity } = useActivityLogs();
  
  const [selectedCase, setSelectedCase] = useState<string>('');
  const [newCaseName, setNewCaseName] = useState('');
  const [newCaseDescription, setNewCaseDescription] = useState('');
  const [createNew, setCreateNew] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reference image for comparison
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  
  const [analysisOptions, setAnalysisOptions] = useState({
    visual: true,
    audio: true,
    metadata: true,
    contextual: false,
    useReference: false,
  });

  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleReferenceUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Reference must be an image');
        return;
      }
      setReferenceImage(file);
      setReferencePreview(URL.createObjectURL(file));
      setAnalysisOptions(prev => ({ ...prev, useReference: true }));
    }
  }, []);

  const removeReference = useCallback(() => {
    setReferenceImage(null);
    if (referencePreview) {
      URL.revokeObjectURL(referencePreview);
    }
    setReferencePreview(null);
    setAnalysisOptions(prev => ({ ...prev, useReference: false }));
  }, [referencePreview]);

  const handleSubmit = async () => {
    if (!selectedCase && !createNew) {
      toast.error('Please select or create a case');
      return;
    }

    if (createNew && !newCaseName.trim()) {
      toast.error('Please enter a case name');
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    setIsSubmitting(true);

    try {
      let caseId = selectedCase;

      // Create new case if needed
      if (createNew) {
        const newCase = await createCase.mutateAsync({
          title: newCaseName,
          description: newCaseDescription,
          priority: 'medium',
        });
        caseId = newCase.id;

        await logActivity.mutateAsync({
          action: 'create_case',
          title: 'New case created',
          description: newCaseName,
          caseId: caseId,
          icon: 'FileSearch',
          iconColor: 'text-primary',
        });

        toast.success(`Case "${newCaseName}" created`);
      }

      // Upload reference image first if provided
      let referenceImagePath: string | undefined;
      if (referenceImage && analysisOptions.useReference && user) {
        const refFileName = `${Date.now()}-ref-${referenceImage.name}`;
        const refPath = `${user.id}/${caseId}/${refFileName}`;
        
        const { error: refError } = await supabase.storage
          .from('media-files')
          .upload(refPath, referenceImage);
        
        if (refError) {
          console.error('Failed to upload reference image:', refError);
          toast.error('Failed to upload reference image');
        } else {
          referenceImagePath = refPath;
          toast.success('Reference image uploaded');
        }
      }

      // Upload files
      for (const file of uploadedFiles) {
        const media = await uploadMedia.mutateAsync({ file, caseId });

        await logActivity.mutateAsync({
          action: 'upload_media',
          title: 'Media uploaded',
          description: file.name,
          caseId,
          mediaId: media.id,
          icon: 'Upload',
          iconColor: 'text-primary',
        });

        // Start analysis with reference image if provided
        toast.info(`Starting analysis for ${file.name}...`);
        await startAnalysis.mutateAsync({ 
          mediaId: media.id,
          referenceImagePath, // Pass reference for comparison
        });

        await logActivity.mutateAsync({
          action: 'analysis_complete',
          title: 'Analysis complete',
          description: file.name,
          caseId,
          mediaId: media.id,
          icon: 'CheckCircle',
          iconColor: 'text-trust',
        });
      }

      toast.success('All files uploaded and analyzed!');
      navigate(`/cases/${caseId}`);
    } catch (error) {
      toast.error('Error: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Upload Media" 
        subtitle="Submit files for forensic analysis"
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Case Selection */}
        <div className="forensic-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Select or Create Case</h3>
          
          <div className="space-y-4">
            {!createNew ? (
              <>
                <div className="space-y-2">
                  <Label>Existing Case</Label>
                  <Select value={selectedCase} onValueChange={setSelectedCase}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a case..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cases.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.case_number} - {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setCreateNew(true);
                    setSelectedCase('');
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Case
                </Button>
              </>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label>Case Name</Label>
                  <Input
                    placeholder="e.g., Political Speech Verification"
                    value={newCaseName}
                    onChange={(e) => setNewCaseName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the investigation purpose and context..."
                    value={newCaseDescription}
                    onChange={(e) => setNewCaseDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCreateNew(false)}
                >
                  ← Back to case selection
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Reference Image Upload */}
        <div className="forensic-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Reference Image (Real Person)</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Upload a known real image of the person for comparison. This significantly improves fake detection accuracy.
          </p>
          
          {!referenceImage ? (
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to upload reference image</span>
              <input 
                type="file" 
                accept="image/*"
                className="hidden"
                onChange={handleReferenceUpload}
              />
            </label>
          ) : (
            <div className="relative inline-block">
              <img 
                src={referencePreview || ''} 
                alt="Reference" 
                className="w-40 h-40 object-cover rounded-lg border border-border"
              />
              <button
                onClick={removeReference}
                className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 hover:bg-danger/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="text-xs text-trust mt-2 flex items-center gap-1">
                <UserCheck className="h-3 w-3" />
                Reference image set
              </p>
            </div>
          )}
        </div>

        {/* Media Upload */}
        <div className="forensic-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Upload Media to Analyze</h3>
          <MediaUploader onUpload={handleFilesUploaded} />
        </div>

        {/* Analysis Options */}
        <div className="forensic-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Analysis Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                checked={analysisOptions.visual}
                onChange={(e) => setAnalysisOptions(prev => ({ ...prev, visual: e.target.checked }))}
                className="mt-1 accent-primary" 
              />
              <div>
                <p className="font-medium text-foreground">Visual Forensics</p>
                <p className="text-xs text-muted-foreground">GAN detection, ELA, face analysis</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                checked={analysisOptions.audio}
                onChange={(e) => setAnalysisOptions(prev => ({ ...prev, audio: e.target.checked }))}
                className="mt-1 accent-primary" 
              />
              <div>
                <p className="font-medium text-foreground">Audio Forensics</p>
                <p className="text-xs text-muted-foreground">Voice clone detection, spectrogram analysis</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                checked={analysisOptions.metadata}
                onChange={(e) => setAnalysisOptions(prev => ({ ...prev, metadata: e.target.checked }))}
                className="mt-1 accent-primary" 
              />
              <div>
                <p className="font-medium text-foreground">Metadata Analysis</p>
                <p className="text-xs text-muted-foreground">EXIF, timestamps, device verification</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                checked={analysisOptions.contextual}
                onChange={(e) => setAnalysisOptions(prev => ({ ...prev, contextual: e.target.checked }))}
                className="mt-1 accent-primary" 
              />
              <div>
                <p className="font-medium text-foreground">Contextual Verification</p>
                <p className="text-xs text-muted-foreground">Reverse search, timeline, weather checks</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          variant="forensic" 
          size="xl" 
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting || uploadedFiles.length === 0}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Start Forensic Analysis
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
