import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export function useReports() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const reportsQuery = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      // Get all completed analyses with their media and case info
      const { data, error } = await supabase
        .from('analysis_results')
        .select(`
          *,
          media_files(
            id,
            file_name,
            case_id,
            cases(id, title, case_number)
          )
        `)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analysis_results',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['reports'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return {
    reports: reportsQuery.data ?? [],
    isLoading: reportsQuery.isLoading,
    error: reportsQuery.error,
  };
}

export function useBlockchainRecords() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const recordsQuery = useQuery({
    queryKey: ['blockchain-records'],
    queryFn: async () => {
      // Get all analyses with blockchain verification
      const { data, error } = await supabase
        .from('analysis_results')
        .select(`
          *,
          media_files(
            id,
            file_name,
            case_id,
            cases(id, title, case_number)
          )
        `)
        .not('blockchain_tx_id', 'is', null)
        .order('blockchain_verified_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('blockchain-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analysis_results',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['blockchain-records'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Calculate stats
  const totalRecords = recordsQuery.data?.length ?? 0;
  const verifiedRecords = recordsQuery.data?.filter(r => r.blockchain_tx_id)?.length ?? 0;

  return {
    records: recordsQuery.data ?? [],
    isLoading: recordsQuery.isLoading,
    error: recordsQuery.error,
    stats: {
      totalRecords,
      verifiedRecords,
    }
  };
}
