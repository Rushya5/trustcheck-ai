import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Case = Database['public']['Tables']['cases']['Row'];
type CaseInsert = Database['public']['Tables']['cases']['Insert'];

export function useCases() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const casesQuery = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Case[];
    },
    enabled: !!user,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('cases-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cases',
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['cases'] });
          
          if (payload.eventType === 'INSERT') {
            toast.info('New case created');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Case updated');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const createCase = useMutation({
    mutationFn: async ({ title, description, priority }: { title: string; description?: string; priority?: string }) => {
      // Generate case number
      const { data: caseNumber } = await supabase.rpc('generate_case_number');
      
      const { data, error } = await supabase
        .from('cases')
        .insert({
          title,
          description,
          priority: priority || 'medium',
          case_number: caseNumber || `TC-${Date.now()}`,
          user_id: user!.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });

  const updateCase = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Case> & { id: string }) => {
      const { data, error } = await supabase
        .from('cases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });

  const deleteCase = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });

  return {
    cases: casesQuery.data ?? [],
    isLoading: casesQuery.isLoading,
    error: casesQuery.error,
    createCase,
    updateCase,
    deleteCase,
  };
}

export function useCase(caseId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cases', caseId],
    queryFn: async () => {
      if (!caseId) return null;
      
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', caseId)
        .single();
      
      if (error) throw error;
      return data as Case;
    },
    enabled: !!user && !!caseId,
  });
}
