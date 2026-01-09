import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AnalysisResult = Database['public']['Tables']['analysis_results']['Row'];
type AnalysisStatus = Database['public']['Enums']['analysis_status'];

// Get the media URL from storage
async function getMediaUrl(filePath: string): Promise<string> {
  const { data } = supabase.storage.from('media-files').getPublicUrl(filePath);
  return data.publicUrl;
}

// Extract frames from video for analysis
async function extractVideoFrames(videoUrl: string, numFrames: number = 10): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    
    const frameUrls: string[] = [];
    
    video.onloadedmetadata = async () => {
      const duration = video.duration;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to create canvas context'));
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const captureFrame = (time: number): Promise<string> => {
        return new Promise((res) => {
          video.currentTime = time;
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            res(dataUrl);
          };
        });
      };
      
      // Capture frames at regular intervals
      for (let i = 0; i < numFrames; i++) {
        const time = (duration * i) / numFrames;
        try {
          const frameUrl = await captureFrame(time);
          frameUrls.push(frameUrl);
        } catch (e) {
          console.error(`Failed to capture frame ${i}:`, e);
        }
      }
      
      resolve(frameUrls);
    };
    
    video.onerror = () => reject(new Error('Failed to load video'));
    video.load();
  });
}

interface AnalyzeParams {
  mediaId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'audio';
}

interface AnalyzeWithAIParams extends AnalyzeParams {
  filePath: string;
}

// Call the AI analysis edge function
async function analyzeWithAI({ mediaId, mediaUrl, mediaType, filePath }: AnalyzeWithAIParams): Promise<void> {
  let frameUrls: string[] | undefined;
  
  // For videos, extract frames client-side (these are already base64)
  if (mediaType === 'video') {
    try {
      frameUrls = await extractVideoFrames(mediaUrl, 10);
      console.log(`Extracted ${frameUrls.length} frames from video`);
    } catch (e) {
      console.error('Frame extraction failed, falling back to single frame:', e);
    }
  }
  
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-media`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        mediaId, 
        imageUrl: mediaUrl,
        filePath, // Pass file path for direct storage download
        mediaType,
        frameUrls 
      }),
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
      // Get the media file to get the file path and type
      const { data: mediaFile, error: mediaError } = await supabase
        .from('media_files')
        .select('file_path, media_type')
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
        currentProgress += Math.random() * 8;
        if (currentProgress > 90) currentProgress = 90; // Cap at 90 until AI completes
        setProgress(prev => ({ ...prev, [mediaId]: currentProgress }));
      }, 500);

      try {
        // Get the public URL for the media (used for video frame extraction)
        const mediaUrl = await getMediaUrl(mediaFile.file_path);
        
        // Call AI analysis with file path for direct storage access
        await analyzeWithAI({
          mediaId,
          mediaUrl,
          mediaType: mediaFile.media_type as 'image' | 'video' | 'audio',
          filePath: mediaFile.file_path, // Pass the file path for storage download
        });
        
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
