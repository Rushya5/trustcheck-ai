import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type MediaFile = Database['public']['Tables']['media_files']['Row'];
type MediaType = Database['public']['Enums']['media_type'];

export function useMediaFiles(caseId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mediaQuery = useQuery({
    queryKey: ['media-files', caseId],
    queryFn: async () => {
      let query = supabase
        .from('media_files')
        .select('*, analysis_results(*)')
        .order('created_at', { ascending: false });
      
      if (caseId) {
        query = query.eq('case_id', caseId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('media-files-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_files',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['media-files'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const uploadMedia = useMutation({
    mutationFn: async ({ file, caseId }: { file: File; caseId: string }) => {
      // Upload to storage
      const filePath = `${user!.id}/${caseId}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('media-files')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;

      // Determine media type
      let mediaType: MediaType = 'image';
      if (file.type.startsWith('video/')) mediaType = 'video';
      else if (file.type.startsWith('audio/')) mediaType = 'audio';

      // Create database record
      const { data, error } = await supabase
        .from('media_files')
        .insert({
          case_id: caseId,
          user_id: user!.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          media_type: mediaType,
          mime_type: file.type,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });

  const deleteMedia = useMutation({
    mutationFn: async ({ id, filePath }: { id: string; filePath: string }) => {
      // Delete from storage
      await supabase.storage.from('media-files').remove([filePath]);
      
      // Delete from database
      const { error } = await supabase
        .from('media_files')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
    },
  });

  return {
    mediaFiles: mediaQuery.data ?? [],
    isLoading: mediaQuery.isLoading,
    error: mediaQuery.error,
    uploadMedia,
    deleteMedia,
  };
}
