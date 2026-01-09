import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import type { Database } from '@/integrations/supabase/types';

type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];

export function useActivityLogs(limit = 10) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const logsQuery = useQuery({
    queryKey: ['activity-logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*, cases(title), media_files(file_name)')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('activity-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const logActivity = useMutation({
    mutationFn: async (activity: {
      action: string;
      title: string;
      description?: string;
      caseId?: string;
      mediaId?: string;
      icon?: string;
      iconColor?: string;
    }) => {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user!.id,
          action: activity.action,
          title: activity.title,
          description: activity.description,
          case_id: activity.caseId,
          media_id: activity.mediaId,
          icon: activity.icon,
          icon_color: activity.iconColor,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
    },
  });

  return {
    logs: logsQuery.data ?? [],
    isLoading: logsQuery.isLoading,
    logActivity,
  };
}
