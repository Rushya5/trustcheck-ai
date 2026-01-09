export type MediaType = 'image' | 'video' | 'audio';
export type AnalysisStatus = 'pending' | 'analyzing' | 'complete' | 'error';
export type CredibilityLevel = 'authentic' | 'suspicious' | 'manipulated';

export interface Case {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'open' | 'closed' | 'archived';
  mediaCount: number;
  credibilityScore?: number;
}

export interface MediaFile {
  id: string;
  caseId: string;
  name: string;
  type: MediaType;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  hash: string;
  analysisStatus: AnalysisStatus;
}

export interface VisualAnalysis {
  ganArtifacts: {
    detected: boolean;
    confidence: number;
    locations: { x: number; y: number; width: number; height: number }[];
  };
  elaScore: number;
  faceAnomalies: {
    detected: boolean;
    issues: string[];
    confidence: number;
  };
  lightingConsistency: number;
  pixelAnomalies: { x: number; y: number; severity: number }[];
  frameScores?: number[]; // For videos
}

export interface AudioAnalysis {
  voiceCloneDetected: boolean;
  voiceCloneConfidence: number;
  spectrogramAnomalies: number;
  pitchConsistency: number;
  phonemeConsistency: number;
  speakerEmbeddingMatch?: number;
  lipSyncScore?: number;
}

export interface MetadataAnalysis {
  exifData: Record<string, string>;
  timestampValid: boolean;
  deviceConsistent: boolean;
  compressionAnomalies: boolean;
  editingTraces: string[];
  geolocationValid?: boolean;
}

export interface ContextualAnalysis {
  reverseSearchMatches: { url: string; similarity: number; date?: string }[];
  timelineConsistent: boolean;
  weatherPlausible?: boolean;
  locationPlausible?: boolean;
  contextMisuse: boolean;
  contextMisuseDetails?: string;
}

export interface ForensicAnalysis {
  id: string;
  mediaId: string;
  status: AnalysisStatus;
  startedAt: Date;
  completedAt?: Date;
  visual?: VisualAnalysis;
  audio?: AudioAnalysis;
  metadata: MetadataAnalysis;
  contextual?: ContextualAnalysis;
  overallCredibility: number;
  credibilityLevel: CredibilityLevel;
  confidenceScore: number;
  blockchainHash?: string;
  blockchainTxId?: string;
  explanations: Explanation[];
  heatmapUrl?: string;
}

export interface Explanation {
  category: 'visual' | 'audio' | 'metadata' | 'contextual';
  finding: string;
  severity: 'info' | 'warning' | 'critical';
  technicalDetail: string;
  plainLanguage: string;
  legalSummary: string;
  evidence?: string;
}

export interface ForensicReport {
  id: string;
  caseId: string;
  generatedAt: Date;
  analysis: ForensicAnalysis[];
  summary: string;
  legalSummary: string;
  journalisticSummary: string;
  recommendations: string[];
  integrityHash: string;
  blockchainVerificationId?: string;
}
