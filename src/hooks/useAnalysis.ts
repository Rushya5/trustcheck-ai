import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AnalysisResult = Database['public']['Tables']['analysis_results']['Row'];
type AnalysisStatus = Database['public']['Enums']['analysis_status'];

// Get the image URL from storage
async function getMediaUrl(filePath: string): Promise<string> {
  const { data } = supabase.storage.from('media').getPublicUrl(filePath);
  return data.publicUrl;
}

// Call the AI analysis edge function
async function analyzeWithAI(mediaId: string, imageUrl: string): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-media`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ mediaId, imageUrl }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Analysis failed');
  }

  return response.json();
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
      // Get the media file to get the file path
      const { data: mediaFile, error: mediaError } = await supabase
        .from('media_files')
        .select('file_path')
        .eq('id', mediaId)
        .single();

      if (mediaError) throw mediaError;

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

      // Start progress simulation
      let currentProgress = 0;
      
      const progressInterval = setInterval(() => {
        currentProgress += Math.random() * 10;
        if (currentProgress > 90) currentProgress = 90; // Cap at 90 until AI completes
        setProgress(prev => ({ ...prev, [mediaId]: currentProgress }));
      }, 500);

      try {
        // Get the public URL for the image
        const imageUrl = await getMediaUrl(mediaFile.file_path);
        
        // Call AI analysis
        await analyzeWithAI(mediaId, imageUrl);
        
        clearInterval(progressInterval);
        setProgress(prev => ({ ...prev, [mediaId]: 100 }));
        
        // Fetch the updated analysis
        const { data, error } = await supabase
          .from('analysis_results')
          .select('*')
          .eq('media_id', mediaId)
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        clearInterval(progressInterval);
        
        // Update status to failed
        await supabase
          .from('analysis_results')
          .update({ status: 'failed' as AnalysisStatus })
          .eq('id', analysisRecord.id);
        
        throw error;
      }
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
