import { Case, MediaFile, ForensicAnalysis, Explanation } from '@/types/analysis';

export const mockCases: Case[] = [
  {
    id: 'case-001',
    name: 'Political Speech Verification',
    description: 'Verify authenticity of viral political speech video',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    status: 'open',
    mediaCount: 3,
    credibilityScore: 34,
  },
  {
    id: 'case-002',
    name: 'Celebrity Interview Analysis',
    description: 'Analyze suspected deepfake interview footage',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-15'),
    status: 'open',
    mediaCount: 2,
    credibilityScore: 78,
  },
  {
    id: 'case-003',
    name: 'Financial Statement Audio',
    description: 'Verify audio recording of executive statement',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    status: 'closed',
    mediaCount: 1,
    credibilityScore: 92,
  },
];

export const mockMediaFiles: MediaFile[] = [
  {
    id: 'media-001',
    caseId: 'case-001',
    name: 'speech_video.mp4',
    type: 'video',
    size: 45000000,
    url: '/placeholder.svg',
    uploadedAt: new Date('2024-01-15'),
    hash: 'sha256:a3f2b8c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
    analysisStatus: 'complete',
  },
  {
    id: 'media-002',
    caseId: 'case-001',
    name: 'audio_extract.wav',
    type: 'audio',
    size: 12000000,
    url: '/placeholder.svg',
    uploadedAt: new Date('2024-01-15'),
    hash: 'sha256:b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5',
    analysisStatus: 'complete',
  },
  {
    id: 'media-003',
    caseId: 'case-001',
    name: 'thumbnail.jpg',
    type: 'image',
    size: 250000,
    url: '/placeholder.svg',
    uploadedAt: new Date('2024-01-15'),
    hash: 'sha256:c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
    analysisStatus: 'analyzing',
  },
];

export const mockExplanations: Explanation[] = [
  {
    category: 'visual',
    finding: 'GAN Artifact Pattern Detected',
    severity: 'critical',
    technicalDetail: 'Frequency domain analysis reveals characteristic GAN fingerprints at 0.7-0.9 normalized frequency bands. Pattern consistent with StyleGAN2 architecture.',
    plainLanguage: 'We detected digital fingerprints that are typically left behind when AI creates or modifies images. These patterns suggest the face in this video was artificially generated.',
    legalSummary: 'Technical analysis indicates the presence of Generative Adversarial Network (GAN) artifacts with 94% confidence, suggesting synthetic media manipulation.',
    evidence: 'Frequency spectrum analysis, Fourier transform coefficients',
  },
  {
    category: 'visual',
    finding: 'Face Boundary Inconsistencies',
    severity: 'critical',
    technicalDetail: 'Edge detection reveals 23% higher variance at face boundary compared to natural imagery baseline. Blending artifacts present at hairline and jaw regions.',
    plainLanguage: 'The edges around the face don\'t match naturally with the rest of the video. This often happens when a face is digitally placed onto someone else\'s body.',
    legalSummary: 'Facial boundary analysis detected statistically significant edge artifacts (p < 0.001) consistent with face-swapping manipulation techniques.',
    evidence: 'Canny edge detection, boundary gradient analysis',
  },
  {
    category: 'audio',
    finding: 'Voice Clone Characteristics',
    severity: 'warning',
    technicalDetail: 'Speaker embedding comparison shows 0.67 cosine similarity with reference samples. Mel-spectrogram reveals unnatural formant transitions in 12% of phonemes.',
    plainLanguage: 'The voice in this recording shows signs of being artificially cloned. Some speech patterns don\'t match how a real human voice naturally produces sounds.',
    legalSummary: 'Audio forensic analysis indicates potential voice synthesis with moderate confidence (67%). Phoneme transitions exhibit artificial characteristics.',
    evidence: 'Speaker verification model output, spectrogram analysis',
  },
  {
    category: 'metadata',
    finding: 'Timestamp Manipulation',
    severity: 'warning',
    technicalDetail: 'EXIF CreateDate (2024-01-10) conflicts with FileModifyDate (2023-06-15). Compression artifacts suggest multiple re-encoding cycles.',
    plainLanguage: 'The file\'s internal timestamps don\'t match up correctly. This suggests the video was edited or modified after its claimed creation date.',
    legalSummary: 'Metadata analysis reveals temporal inconsistencies between creation and modification timestamps, indicating post-production alterations.',
    evidence: 'EXIF data extraction, file system metadata',
  },
  {
    category: 'contextual',
    finding: 'Real Media Reused in False Context',
    severity: 'critical',
    technicalDetail: 'Reverse image search identifies original source from 2022 press conference. Current claim attributes to 2024 event. Weather/lighting conditions inconsistent with claimed date.',
    plainLanguage: 'This video is real, but it\'s being shared with false information. The original footage is from 2022, not 2024 as claimed. The weather conditions in the video don\'t match what was actually happening on the claimed date.',
    legalSummary: 'Contextual verification confirms media authenticity but identifies deliberate misattribution. Original source verified; current context claims are demonstrably false.',
    evidence: 'Reverse search results, historical weather data, original source verification',
  },
];

export const mockAnalysis: ForensicAnalysis = {
  id: 'analysis-001',
  mediaId: 'media-001',
  status: 'complete',
  startedAt: new Date('2024-01-15T10:00:00'),
  completedAt: new Date('2024-01-15T10:05:32'),
  visual: {
    ganArtifacts: {
      detected: true,
      confidence: 0.94,
      locations: [
        { x: 120, y: 80, width: 200, height: 250 },
      ],
    },
    elaScore: 0.78,
    faceAnomalies: {
      detected: true,
      issues: ['Boundary inconsistency', 'Lighting mismatch', 'Texture discontinuity'],
      confidence: 0.89,
    },
    lightingConsistency: 0.45,
    pixelAnomalies: [
      { x: 150, y: 100, severity: 0.9 },
      { x: 180, y: 120, severity: 0.85 },
      { x: 200, y: 150, severity: 0.7 },
    ],
    frameScores: [0.34, 0.32, 0.35, 0.33, 0.31, 0.36, 0.34, 0.32, 0.35, 0.33],
  },
  audio: {
    voiceCloneDetected: true,
    voiceCloneConfidence: 0.67,
    spectrogramAnomalies: 0.45,
    pitchConsistency: 0.78,
    phonemeConsistency: 0.88,
    lipSyncScore: 0.72,
  },
  metadata: {
    exifData: {
      'Make': 'Unknown',
      'Model': 'Unknown',
      'DateTimeOriginal': '2024:01:10 14:32:15',
      'Software': 'Adobe Premiere Pro 2024',
      'GPSLatitude': '40.7128',
      'GPSLongitude': '-74.0060',
    },
    timestampValid: false,
    deviceConsistent: false,
    compressionAnomalies: true,
    editingTraces: ['Adobe Premiere Pro', 'FFmpeg re-encoding'],
  },
  contextual: {
    reverseSearchMatches: [
      { url: 'https://example.com/original-2022', similarity: 0.98, date: '2022-03-15' },
    ],
    timelineConsistent: false,
    weatherPlausible: false,
    locationPlausible: true,
    contextMisuse: true,
    contextMisuseDetails: 'Original footage from March 2022 press conference misattributed to January 2024 event.',
  },
  overallCredibility: 34,
  credibilityLevel: 'manipulated',
  confidenceScore: 0.91,
  blockchainHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
  blockchainTxId: '0x1234567890abcdef1234567890abcdef12345678',
  explanations: mockExplanations,
  heatmapUrl: '/placeholder.svg',
};

export const generateMockHeatmapData = () => {
  const data = [];
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
      const centerX = 10, centerY = 8;
      const distance = Math.sqrt(Math.pow(i - centerX, 2) + Math.pow(j - centerY, 2));
      const value = Math.max(0, 1 - distance / 12) + Math.random() * 0.2;
      data.push({ x: i, y: j, value: Math.min(1, value) });
    }
  }
  return data;
};
