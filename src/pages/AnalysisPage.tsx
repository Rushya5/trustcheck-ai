import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { CredibilityMeter } from '@/components/dashboard/CredibilityMeter';
import { AnalysisCard } from '@/components/analysis/AnalysisCard';
import { HeatmapVisualization } from '@/components/analysis/HeatmapVisualization';
import { ExplanationPanel } from '@/components/analysis/ExplanationPanel';
import { FrameTimeline } from '@/components/analysis/FrameTimeline';
import { BlockchainVerification } from '@/components/blockchain/BlockchainVerification';
import { mockAnalysis, generateMockHeatmapData, mockExplanations } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Music, 
  FileText, 
  Globe, 
  Download, 
  Share2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function AnalysisPage() {
  const [selectedFrame, setSelectedFrame] = useState(0);
  const heatmapData = generateMockHeatmapData();

  return (
    <div className="min-h-screen">
      <Header 
        title="Forensic Analysis" 
        subtitle="Case #001 - speech_video.mp4"
      />

      <div className="p-6 space-y-6">
        {/* Summary Header */}
        <div className="forensic-card p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Credibility Score */}
            <div className="flex flex-col items-center">
              <CredibilityMeter score={mockAnalysis.overallCredibility} size="lg" />
              <p className="mt-2 text-xs text-muted-foreground font-mono">
                Confidence: {(mockAnalysis.confidenceScore * 100).toFixed(1)}%
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-danger/5 border border-danger/20">
                <p className="text-2xl font-bold text-danger">3</p>
                <p className="text-xs text-muted-foreground">Critical Issues</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-warning/5 border border-warning/20">
                <p className="text-2xl font-bold text-warning">2</p>
                <p className="text-xs text-muted-foreground">Warnings</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-trust/5 border border-trust/20">
                <p className="text-2xl font-bold text-trust">1</p>
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
              <Button variant="forensic" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Report
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
                <HeatmapVisualization data={heatmapData} width={400} height={300} />
              </div>

              {/* Analysis Cards */}
              <div className="space-y-4">
                <AnalysisCard
                  title="GAN Artifact Detection"
                  icon={AlertTriangle}
                  status="fail"
                  score={mockAnalysis.visual?.ganArtifacts.confidence}
                  findings={[
                    'StyleGAN2 fingerprints detected in frequency domain',
                    'Characteristic pattern at 0.7-0.9 normalized frequency'
                  ]}
                />
                <AnalysisCard
                  title="Face Boundary Analysis"
                  icon={Eye}
                  status="fail"
                  score={mockAnalysis.visual?.faceAnomalies.confidence}
                  findings={mockAnalysis.visual?.faceAnomalies.issues || []}
                />
                <AnalysisCard
                  title="Lighting Consistency"
                  icon={Eye}
                  status="warning"
                  score={mockAnalysis.visual?.lightingConsistency}
                  findings={['Shadow direction inconsistencies detected']}
                />
              </div>
            </div>

            {/* Frame Timeline */}
            {mockAnalysis.visual?.frameScores && (
              <div className="forensic-card p-6">
                <FrameTimeline 
                  scores={mockAnalysis.visual.frameScores}
                  currentFrame={selectedFrame}
                  onFrameSelect={setSelectedFrame}
                />
              </div>
            )}
          </TabsContent>

          {/* Audio Analysis Tab */}
          <TabsContent value="audio" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnalysisCard
                title="Voice Clone Detection"
                icon={Music}
                status={mockAnalysis.audio?.voiceCloneDetected ? 'warning' : 'pass'}
                score={mockAnalysis.audio?.voiceCloneConfidence}
                findings={
                  mockAnalysis.audio?.voiceCloneDetected 
                    ? ['Potential voice synthesis detected', 'Unnatural formant transitions in 12% of phonemes']
                    : ['No voice cloning indicators detected']
                }
              />
              <AnalysisCard
                title="Spectrogram Analysis"
                icon={Music}
                status="warning"
                score={1 - (mockAnalysis.audio?.spectrogramAnomalies || 0)}
                findings={['Irregular frequency patterns detected']}
              />
              <AnalysisCard
                title="Pitch Consistency"
                icon={CheckCircle}
                status="pass"
                score={mockAnalysis.audio?.pitchConsistency}
                findings={['Pitch patterns within normal range']}
              />
              <AnalysisCard
                title="Lip Sync Score"
                icon={Eye}
                status="warning"
                score={mockAnalysis.audio?.lipSyncScore}
                findings={['Minor lip-sync discrepancies detected']}
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
                  {Object.entries(mockAnalysis.metadata.exifData).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-mono text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata Analysis */}
              <div className="space-y-4">
                <AnalysisCard
                  title="Timestamp Validation"
                  icon={FileText}
                  status={mockAnalysis.metadata.timestampValid ? 'pass' : 'fail'}
                  findings={
                    mockAnalysis.metadata.timestampValid 
                      ? ['Timestamps are consistent']
                      : ['Creation and modification dates conflict']
                  }
                />
                <AnalysisCard
                  title="Editing Traces"
                  icon={AlertTriangle}
                  status={mockAnalysis.metadata.editingTraces.length > 0 ? 'warning' : 'pass'}
                  findings={mockAnalysis.metadata.editingTraces}
                />
              </div>
            </div>
          </TabsContent>

          {/* Context Tab */}
          <TabsContent value="context" className="space-y-6">
            <AnalysisCard
              title="Contextual Verification"
              icon={Globe}
              status={mockAnalysis.contextual?.contextMisuse ? 'fail' : 'pass'}
              findings={
                mockAnalysis.contextual?.contextMisuse 
                  ? [mockAnalysis.contextual.contextMisuseDetails || 'Context misuse detected']
                  : ['Media context verified']
              }
            >
              {mockAnalysis.contextual?.reverseSearchMatches && 
                mockAnalysis.contextual.reverseSearchMatches.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-muted-foreground">Reverse Search Matches:</p>
                  {mockAnalysis.contextual.reverseSearchMatches.map((match, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-muted/50 p-2 rounded">
                      <span className="truncate text-foreground">{match.url}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{(match.similarity * 100).toFixed(0)}% match</Badge>
                        {match.date && <span className="text-muted-foreground">{match.date}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AnalysisCard>
          </TabsContent>
        </Tabs>

        {/* Explanations Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Detailed Explanations</h3>
          <div className="grid grid-cols-1 gap-4">
            {mockExplanations.map((explanation, i) => (
              <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <ExplanationPanel explanation={explanation} />
              </div>
            ))}
          </div>
        </div>

        {/* Blockchain Verification */}
        {mockAnalysis.blockchainHash && (
          <BlockchainVerification
            hash={mockAnalysis.blockchainHash}
            txId={mockAnalysis.blockchainTxId}
            timestamp={mockAnalysis.completedAt}
          />
        )}
      </div>
    </div>
  );
}
