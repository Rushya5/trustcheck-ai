import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AnalysisResult = Database['public']['Tables']['analysis_results']['Row'];
type AnalysisStatus = Database['public']['Enums']['analysis_status'];
type CredibilityLevel = Database['public']['Enums']['credibility_level'];

// Simulated analysis engine
function generateSimulatedAnalysis() {
  const isManipulated = Math.random() > 0.5;
  const credibilityScore = isManipulated 
    ? 20 + Math.random() * 40 
    : 60 + Math.random() * 40;
  
  const credibilityLevel: CredibilityLevel = 
    credibilityScore >= 80 ? 'authentic' :
    credibilityScore >= 60 ? 'likely_authentic' :
    credibilityScore >= 40 ? 'uncertain' :
    credibilityScore >= 20 ? 'likely_manipulated' : 'manipulated';

  const visualArtifacts = isManipulated ? [
    { type: 'GAN fingerprint', location: 'face region', severity: 'high' },
    { type: 'Boundary inconsistency', location: 'jawline', severity: 'medium' },
  ] : [];

  const audioArtifacts = isManipulated && Math.random() > 0.5 ? [
    { type: 'Voice synthesis markers', location: 'frequency domain', severity: 'high' },
  ] : [];

  const metadataIssues = Math.random() > 0.7 ? [
    { type: 'Timestamp mismatch', detail: 'Creation date after modification date' },
  ] : [];

  // Generate heatmap data
  const heatmapData = [];
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const isFaceRegion = x >= 3 && x <= 7 && y >= 2 && y <= 6;
      const baseValue = isFaceRegion && isManipulated ? 0.6 + Math.random() * 0.4 : Math.random() * 0.3;
      heatmapData.push({ x, y, value: baseValue });
    }
  }

  return {
    credibility_score: credibilityScore,
    credibility_level: credibilityLevel,
    visual_manipulation_detected: isManipulated,
    visual_confidence: 0.75 + Math.random() * 0.2,
    visual_artifacts: visualArtifacts,
    heatmap_data: heatmapData,
    audio_manipulation_detected: audioArtifacts.length > 0,
    audio_confidence: 0.7 + Math.random() * 0.25,
    audio_artifacts: audioArtifacts,
    metadata_integrity_score: metadataIssues.length > 0 ? 60 + Math.random() * 20 : 85 + Math.random() * 15,
    metadata_issues: metadataIssues,
    exif_data: {
      'Make': 'Unknown Device',
      'Model': 'Digital Camera',
      'DateTime': new Date().toISOString(),
      'Software': 'Image Editor 2.0',
    },
    context_verified: !isManipulated,
    context_notes: isManipulated 
      ? 'Potential context misuse detected - similar media found with different claims'
      : 'No context issues found',
    sha256_hash: Array.from({ length: 64 }, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join(''),
    plain_explanation: isManipulated
      ? 'This media shows signs of digital manipulation. Our analysis detected artificial patterns commonly associated with AI-generated or edited content. The face region shows inconsistencies that suggest the use of face-swapping technology.'
      : 'This media appears to be authentic. Our multi-layer analysis found no significant signs of manipulation. The visual, audio, and metadata components are consistent with genuine media.',
    legal_explanation: isManipulated
      ? 'FORENSIC FINDING: Digital manipulation detected with high confidence. Evidence includes: (1) GAN-generated artifacts in facial region, (2) Boundary inconsistencies at face edges, (3) Potential metadata tampering. This media should not be considered reliable evidence without further verification.'
      : 'FORENSIC FINDING: Media authenticity verified. No significant indicators of digital manipulation detected. Metadata integrity confirmed. This media may be considered for evidentiary purposes subject to standard chain-of-custody requirements.',
    technical_explanation: isManipulated
      ? `Technical Analysis Summary:\n- GAN Fingerprint Detection: StyleGAN2 patterns identified (confidence: ${(75 + Math.random() * 20).toFixed(1)}%)\n- ELA Score: Anomalous (${(60 + Math.random() * 30).toFixed(1)}% deviation)\n- Face Boundary Analysis: Inconsistent gradients detected\n- Frequency Domain: Characteristic GAN artifacts at 0.7-0.9 normalized frequency`
      : `Technical Analysis Summary:\n- GAN Fingerprint Detection: None detected\n- ELA Score: Normal (${(5 + Math.random() * 10).toFixed(1)}% deviation)\n- Face Boundary Analysis: Consistent\n- Frequency Domain: Natural distribution`,
  };
}

export function useAnalysis(mediaId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const analysisQuery = useQuery({
    queryKey: ['analysis', mediaId],
    queryFn: async () => {
      if (!mediaId) return null;
      
      const { data, error } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('media_id', mediaId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as AnalysisResult | null;
    },
    enabled: !!user && !!mediaId,
  });

  // Real-time subscription for analysis updates
  useEffect(() => {
    if (!user || !mediaId) return;

    const channel = supabase
      .channel(`analysis-${mediaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analysis_results',
          filter: `media_id=eq.${mediaId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['analysis', mediaId] });
          
          if (payload.eventType === 'UPDATE' && (payload.new as any).status === 'completed') {
            toast.success('Analysis completed!');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, mediaId, queryClient]);

  return {
    analysis: analysisQuery.data,
    isLoading: analysisQuery.isLoading,
    error: analysisQuery.error,
  };
}

export function useStartAnalysis() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<Record<string, number>>({});

  const startAnalysis = useMutation({
    mutationFn: async (mediaId: string) => {
      // Create initial analysis record
      const { data: analysisRecord, error: createError } = await supabase
        .from('analysis_results')
        .insert({
          media_id: mediaId,
          status: 'processing' as AnalysisStatus,
          processing_started_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (createError) throw createError;

      // Simulate analysis progress
      const analysisId = analysisRecord.id;
      let currentProgress = 0;
      
      const progressInterval = setInterval(() => {
        currentProgress += Math.random() * 15;
        if (currentProgress > 100) currentProgress = 100;
        setProgress(prev => ({ ...prev, [mediaId]: currentProgress }));
        
        if (currentProgress >= 100) {
          clearInterval(progressInterval);
        }
      }, 500);

      // Simulate analysis time (3-6 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 3000));
      
      clearInterval(progressInterval);
      setProgress(prev => ({ ...prev, [mediaId]: 100 }));

      // Generate simulated results
      const results = generateSimulatedAnalysis();
      
      // Update with results
      const { data, error } = await supabase
        .from('analysis_results')
        .update({
          ...results,
          status: 'completed' as AnalysisStatus,
          completed_at: new Date().toISOString(),
        })
        .eq('id', analysisId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['analysis'] });
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
    },
    onError: (error) => {
      toast.error('Analysis failed: ' + (error as Error).message);
    },
  });

  return {
    startAnalysis,
    progress,
    isAnalyzing: startAnalysis.isPending,
  };
}
