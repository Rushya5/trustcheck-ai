import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      // Get case counts
      const { count: totalCases } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true });

      const { count: openCases } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Get media file counts
      const { count: totalMedia } = await supabase
        .from('media_files')
        .select('*', { count: 'exact', head: true });

      // Get analysis results
      const { data: analyses } = await supabase
        .from('analysis_results')
        .select('credibility_level, status');

      const completedAnalyses = analyses?.filter(a => a.status === 'completed') || [];
      const pendingAnalyses = analyses?.filter(a => a.status === 'pending' || a.status === 'processing') || [];
      
      const deepfakesDetected = completedAnalyses.filter(
        a => a.credibility_level === 'manipulated' || a.credibility_level === 'likely_manipulated'
      ).length;

      const verifiedAuthentic = completedAnalyses.filter(
        a => a.credibility_level === 'authentic' || a.credibility_level === 'likely_authentic'
      ).length;

      // Calculate average credibility
      const { data: scoresData } = await supabase
        .from('analysis_results')
        .select('credibility_score')
        .not('credibility_score', 'is', null);

      const scores = scoresData?.map(s => s.credibility_score).filter(Boolean) as number[] || [];
      const avgCredibility = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : 50;

      return {
        totalCases: totalCases ?? 0,
        openCases: openCases ?? 0,
        totalMedia: totalMedia ?? 0,
        completedAnalyses: completedAnalyses.length,
        pendingAnalyses: pendingAnalyses.length,
        deepfakesDetected,
        verifiedAuthentic,
        avgCredibility,
      };
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
