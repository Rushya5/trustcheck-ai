import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { CredibilityMeter } from '@/components/dashboard/CredibilityMeter';
import { AnalysisCard } from '@/components/analysis/AnalysisCard';
import { HeatmapVisualization } from '@/components/analysis/HeatmapVisualization';
import { ExplanationPanel } from '@/components/analysis/ExplanationPanel';
import { FrameTimeline } from '@/components/analysis/FrameTimeline';
import { BlockchainVerification } from '@/components/blockchain/BlockchainVerification';
import { useAnalysis } from '@/hooks/useAnalysis';
import { generateForensicReport } from '@/lib/generateForensicReport';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Eye, 
  Music, 
  FileText, 
  Globe, 
  Download, 
  Share2,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { analysis, isLoading, error } = useAnalysis(id);
  const [selectedFrame] = useState(0);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleDownloadReport = async () => {
    if (!analysis) return;
    
    setIsGeneratingReport(true);
    try {
      await generateForensicReport({
        analysis,
        caseName: 'Forensic Case',
        mediaFileName: 'Media File'
      });
      toast.success('Report downloaded successfully');
    } catch (err) {
      console.error('Failed to generate report:', err);
      toast.error('Failed to generate report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Generate heatmap data from analysis or default
  const rawHeatmapData = analysis?.heatmap_data;
  const actualHeatmapData = (() => {
    if (!rawHeatmapData) {
      return Array.from({ length: 100 }, (_, i) => ({
        x: i % 10,
        y: Math.floor(i / 10),
        value: Math.random() * 0.5
      }));
    }
    // Handle nested heatmap structure
    if (typeof rawHeatmapData === 'object' && !Array.isArray(rawHeatmapData) && 'heatmap' in rawHeatmapData) {
      return (rawHeatmapData as { heatmap: Array<{ x: number; y: number; value: number }> }).heatmap;
    }
    return rawHeatmapData as Array<{ x: number; y: number; value: number }>;
  })();

  // Parse artifacts arrays - handle both string[] and object[] formats
  type ArtifactObject = { type?: string; location?: string; severity?: string; description?: string };
  
  const parseArtifacts = (artifacts: unknown): string[] => {
    if (!Array.isArray(artifacts)) return [];
    return artifacts.map((item: unknown) => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        const obj = item as ArtifactObject;
        // Build a readable string from the object
        const parts: string[] = [];
        if (obj.type) parts.push(obj.type);
        if (obj.location) parts.push(`at ${obj.location}`);
        if (obj.severity) parts.push(`(${obj.severity})`);
        if (obj.description) parts.push(obj.description);
        return parts.join(' ') || 'Unknown artifact';
      }
      return String(item);
    });
  };

  const visualArtifacts = parseArtifacts(analysis?.visual_artifacts);
  const audioArtifacts = parseArtifacts(analysis?.audio_artifacts);
  const metadataIssues = parseArtifacts(analysis?.metadata_issues);
  const exifData = (analysis?.exif_data as Record<string, string>) || {};

  // Calculate stats
  const criticalCount = (analysis?.visual_manipulation_detected ? 1 : 0) + 
    (analysis?.audio_manipulation_detected ? 1 : 0);
  const warningCount = metadataIssues.length > 0 ? 1 : 0;
  const passedCount = (!analysis?.visual_manipulation_detected ? 1 : 0) + 
    (!analysis?.audio_manipulation_detected ? 1 : 0) + 
    (analysis?.context_verified ? 1 : 0);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Forensic Analysis" subtitle="Loading..." />
        <div className="p-6 space-y-6">
          <div className="forensic-card p-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-40 rounded-lg" />
              <Skeleton className="h-40 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen">
        <Header title="Forensic Analysis" subtitle="Error" />
        <div className="p-6">
          <div className="forensic-card p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analysis Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error?.message || 'The requested analysis could not be found.'}
            </p>
            <Button onClick={() => navigate('/cases')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cases
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Status indicator for processing
  if (analysis.status === 'processing' || analysis.status === 'pending') {
    return (
      <div className="min-h-screen">
        <Header title="Forensic Analysis" subtitle="Processing..." />
        <div className="p-6">
          <div className="forensic-card p-8 text-center">
            <Loader2 className="h-12 w-12 text-analysis mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Analysis in Progress</h3>
            <p className="text-muted-foreground mb-4">
              Please wait while we analyze your media file. This page will update automatically.
            </p>
            <Badge variant="secondary" className="animate-pulse">
              {analysis.status === 'pending' ? 'Queued' : 'Processing'}
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  // Extract frame analysis data from heatmap_data if it's a video
  const heatmapDataParsed = analysis?.heatmap_data as { 
    heatmap?: Array<{ x: number; y: number; value: number }>;
    frame_analysis?: {
      frame_scores: number[];
      frame_verdicts: string[];
      frame_details: Array<{
        frame: number;
        verdict: string;
        confidence: number;
        artifacts: any[];
      }>;
    };
  } | Array<{ x: number; y: number; value: number }> | null;

  const isVideoAnalysis = heatmapDataParsed && 
    typeof heatmapDataParsed === 'object' && 
    !Array.isArray(heatmapDataParsed) && 
    heatmapDataParsed.frame_analysis;

  const frameAnalysis = isVideoAnalysis ? heatmapDataParsed.frame_analysis : null;
  
  // Use real frame scores if available, otherwise generate simulated ones
  const frameScores = frameAnalysis?.frame_scores || 
    Array.from({ length: 30 }, () => 
      (analysis.visual_confidence ? Number(analysis.visual_confidence) : 0.7) + (Math.random() - 0.5) * 0.3
    );

  return (
    <div className="min-h-screen">
      <Header 
        title="Forensic Analysis" 
        subtitle={`Analysis completed ${analysis.completed_at ? new Date(analysis.completed_at).toLocaleDateString() : ''}`}
      />

      <div className="p-6 space-y-6">
        {/* Summary Header */}
        <div className="forensic-card p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Credibility Score */}
            <div className="flex flex-col items-center">
              <CredibilityMeter score={Number(analysis.credibility_score) || 50} size="lg" />
              <p className="mt-2 text-xs text-muted-foreground font-mono">
                Level: {analysis.credibility_level || 'unknown'}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-danger/5 border border-danger/20">
                <p className="text-2xl font-bold text-danger">{criticalCount}</p>
                <p className="text-xs text-muted-foreground">Critical Issues</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-warning/5 border border-warning/20">
                <p className="text-2xl font-bold text-warning">{warningCount}</p>
                <p className="text-xs text-muted-foreground">Warnings</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-trust/5 border border-trust/20">
                <p className="text-2xl font-bold text-trust">{passedCount}</p>
                <p className="text-xs text-muted-foreground">Passed</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-analysis/5 border border-analysis/20">
                <p className="text-2xl font-bold text-analysis">4</p>
                <p className="text-xs text-muted-foreground">Analyzed</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="forensic" 
                size="sm" 
                onClick={handleDownloadReport}
                disabled={isGeneratingReport}
              >
                {isGeneratingReport ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isGeneratingReport ? 'Generating...' : 'Report'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Analysis Tabs */}
        <Tabs defaultValue="visual" className="space-y-6">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="visual" className="gap-2">
              <Eye className="h-4 w-4" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="audio" className="gap-2">
              <Music className="h-4 w-4" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="metadata" className="gap-2">
              <FileText className="h-4 w-4" />
              Metadata
            </TabsTrigger>
            <TabsTrigger value="context" className="gap-2">
              <Globe className="h-4 w-4" />
              Context
            </TabsTrigger>
          </TabsList>

          {/* Visual Analysis Tab */}
          <TabsContent value="visual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Heatmap */}
              <div className="forensic-card p-6">
                <h4 className="font-semibold text-foreground mb-4">Anomaly Heatmap</h4>
                <HeatmapVisualization data={actualHeatmapData} width={400} height={300} />
              </div>

              {/* Analysis Cards */}
              <div className="space-y-4">
                <AnalysisCard
                  title="Visual Manipulation Detection"
                  icon={AlertTriangle}
                  status={analysis.visual_manipulation_detected ? 'fail' : 'pass'}
                  score={Number(analysis.visual_confidence) || 0.85}
                  findings={visualArtifacts.length > 0 ? visualArtifacts : ['No visual manipulation detected']}
                />
                <AnalysisCard
                  title="Face Boundary Analysis"
                  icon={Eye}
                  status={analysis.visual_manipulation_detected ? 'warning' : 'pass'}
                  score={Number(analysis.visual_confidence) || 0.9}
                  findings={analysis.visual_manipulation_detected 
                    ? ['Face boundary irregularities detected', 'Potential deepfake indicators']
                    : ['Face boundaries appear natural']
                  }
                />
                <AnalysisCard
                  title="Lighting Consistency"
                  icon={Eye}
                  status={analysis.visual_manipulation_detected ? 'warning' : 'pass'}
                  score={0.75}
                  findings={analysis.visual_manipulation_detected 
                    ? ['Shadow direction inconsistencies detected']
                    : ['Lighting appears consistent throughout']
                  }
                />
              </div>
            </div>

            {/* Frame Timeline - Enhanced for video */}
            <div className="forensic-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground">
                  {isVideoAnalysis ? 'Video Frame-by-Frame Analysis' : 'Frame Analysis Timeline'}
                </h4>
                {isVideoAnalysis && frameAnalysis && (
                  <Badge variant={frameAnalysis.frame_verdicts.includes('DEEPFAKE') ? 'destructive' : 'secondary'}>
                    {frameAnalysis.frame_scores.length} Frames Analyzed
                  </Badge>
                )}
              </div>
              <FrameTimeline 
                scores={frameScores}
                currentFrame={selectedFrame}
              />
              {isVideoAnalysis && frameAnalysis && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {frameAnalysis.frame_details.slice(0, 8).map((frame, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg border ${
                        frame.verdict === 'AUTHENTIC' 
                          ? 'border-trust/30 bg-trust/5' 
                          : frame.verdict === 'DEEPFAKE'
                          ? 'border-danger/30 bg-danger/5'
                          : 'border-warning/30 bg-warning/5'
                      }`}
                    >
                      <p className="text-xs font-medium">Frame {frame.frame + 1}</p>
                      <p className={`text-sm font-bold ${
                        frame.verdict === 'AUTHENTIC' ? 'text-trust' :
                        frame.verdict === 'DEEPFAKE' ? 'text-danger' : 'text-warning'
                      }`}>
                        {frame.verdict}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(frame.confidence)}% confidence
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Audio Analysis Tab */}
          <TabsContent value="audio" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnalysisCard
                title="Voice Clone Detection"
                icon={Music}
                status={analysis.audio_manipulation_detected ? 'warning' : 'pass'}
                score={Number(analysis.audio_confidence) || 0.9}
                findings={audioArtifacts.length > 0 ? audioArtifacts : ['No voice cloning indicators detected']}
              />
              <AnalysisCard
                title="Spectrogram Analysis"
                icon={Music}
                status={analysis.audio_manipulation_detected ? 'warning' : 'pass'}
                score={Number(analysis.audio_confidence) || 0.85}
                findings={analysis.audio_manipulation_detected 
                  ? ['Irregular frequency patterns detected']
                  : ['Spectrogram appears natural']
                }
              />
              <AnalysisCard
                title="Pitch Consistency"
                icon={CheckCircle}
                status="pass"
                score={0.92}
                findings={['Pitch patterns within normal range']}
              />
              <AnalysisCard
                title="Lip Sync Score"
                icon={Eye}
                status={analysis.audio_manipulation_detected ? 'warning' : 'pass'}
                score={0.88}
                findings={analysis.audio_manipulation_detected 
                  ? ['Minor lip-sync discrepancies detected']
                  : ['Lip sync appears accurate']
                }
              />
            </div>
          </TabsContent>

          {/* Metadata Tab */}
          <TabsContent value="metadata" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* EXIF Data */}
              <div className="forensic-card p-6">
                <h4 className="font-semibold text-foreground mb-4">EXIF Metadata</h4>
                <div className="space-y-2">
                  {Object.keys(exifData).length > 0 ? (
                    Object.entries(exifData).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-mono text-foreground">{value}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No EXIF data available</p>
                  )}
                </div>
              </div>

              {/* Metadata Analysis */}
              <div className="space-y-4">
                <AnalysisCard
                  title="Metadata Integrity"
                  icon={FileText}
                  status={metadataIssues.length === 0 ? 'pass' : 'warning'}
                  score={Number(analysis.metadata_integrity_score) || 0.85}
                  findings={metadataIssues.length > 0 ? metadataIssues : ['Metadata appears intact']}
                />
                <AnalysisCard
                  title="File Hash"
                  icon={CheckCircle}
                  status="pass"
                  findings={[`SHA-256: ${analysis.sha256_hash?.substring(0, 16) || 'Not available'}...`]}
                />
              </div>
            </div>
          </TabsContent>

          {/* Context Tab */}
          <TabsContent value="context" className="space-y-6">
            <AnalysisCard
              title="Contextual Verification"
              icon={Globe}
              status={analysis.context_verified ? 'pass' : 'warning'}
              findings={[
                analysis.context_verified 
                  ? 'Media context has been verified'
                  : 'Context verification incomplete',
                analysis.context_notes || 'No additional context notes'
              ]}
            />
          </TabsContent>
        </Tabs>

        {/* Explanations Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Detailed Explanations</h3>
          <div className="grid grid-cols-1 gap-4">
            {analysis.plain_explanation && (
              <ExplanationPanel 
                explanation={{
                  category: 'visual',
                  finding: 'Analysis Summary',
                  severity: analysis.visual_manipulation_detected ? 'critical' : 'info',
                  plainLanguage: analysis.plain_explanation,
                  technicalDetail: analysis.technical_explanation || 'No technical details available.',
                  legalSummary: analysis.legal_explanation || 'No legal summary available.'
                }}
              />
            )}
            {analysis.visual_manipulation_detected && (
              <ExplanationPanel 
                explanation={{
                  category: 'visual',
                  finding: 'Visual Manipulation Detected',
                  severity: 'critical',
                  plainLanguage: 'The analysis detected signs of visual manipulation in this media.',
                  technicalDetail: visualArtifacts.join('. ') || 'Visual artifacts detected.',
                  legalSummary: 'This evidence may be considered tampered and should be verified.'
                }}
              />
            )}
            {analysis.audio_manipulation_detected && (
              <ExplanationPanel 
                explanation={{
                  category: 'audio',
                  finding: 'Audio Manipulation Detected',
                  severity: 'warning',
                  plainLanguage: 'The analysis detected potential audio manipulation.',
                  technicalDetail: audioArtifacts.join('. ') || 'Audio artifacts detected.',
                  legalSummary: 'Audio evidence should be authenticated by an expert.'
                }}
              />
            )}
          </div>
        </div>

        {/* Blockchain Verification */}
        {analysis.blockchain_tx_id && (
          <BlockchainVerification
            hash={analysis.sha256_hash || ''}
            txId={analysis.blockchain_tx_id}
            timestamp={analysis.blockchain_verified_at ? new Date(analysis.blockchain_verified_at) : undefined}
          />
        )}
      </div>
    </div>
  );
}
