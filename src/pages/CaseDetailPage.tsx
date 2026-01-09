import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CredibilityMeter } from '@/components/dashboard/CredibilityMeter';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Eye,
  Upload,
  Image,
  Video,
  Music,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  FileQuestion,
  Play
} from 'lucide-react';

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch case details
  const { data: caseData, isLoading: caseLoading, error: caseError } = useQuery({
    queryKey: ['case', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });

  // Fetch media files for this case
  const { data: mediaFiles, isLoading: mediaLoading } = useQuery({
    queryKey: ['case-media', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_files')
        .select(`
          *,
          analysis_results(*)
        `)
        .eq('case_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });

  // Real-time subscription for media files and analysis updates
  useEffect(() => {
    if (!user || !id) return;

    const mediaChannel = supabase
      .channel(`case-media-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_files',
          filter: `case_id=eq.${id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['case-media', id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analysis_results',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['case-media', id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(mediaChannel);
    };
  }, [user, id, queryClient]);

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'image':
        return Image;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      default:
        return Image;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="trust" className="gap-1"><CheckCircle className="h-3 w-3" />Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" />Processing</Badge>;
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'failed':
        return <Badge variant="danger" className="gap-1"><AlertTriangle className="h-3 w-3" />Failed</Badge>;
      default:
        return <Badge variant="outline">No Analysis</Badge>;
    }
  };

  const getCaseStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary">Open</Badge>;
      case 'analyzing':
        return <Badge variant="analysis">Analyzing</Badge>;
      case 'completed':
        return <Badge variant="trust">Completed</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (caseLoading || mediaLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Case Details" subtitle="Loading..." />
        <div className="p-6 space-y-6">
          <Skeleton className="h-32 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (caseError || !caseData) {
    return (
      <div className="min-h-screen">
        <Header title="Case Details" subtitle="Error" />
        <div className="p-6">
          <div className="forensic-card p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Case Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {caseError?.message || 'The requested case could not be found.'}
            </p>
            <Button onClick={() => navigate('/cases')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cases
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalMedia = mediaFiles?.length ?? 0;
  const completedAnalyses = mediaFiles?.filter(m => 
    (m.analysis_results as { status: string }[])?.[0]?.status === 'completed'
  ).length ?? 0;
  const processingAnalyses = mediaFiles?.filter(m => {
    const status = (m.analysis_results as { status: string }[])?.[0]?.status;
    return status === 'processing' || status === 'pending';
  }).length ?? 0;

  return (
    <div className="min-h-screen">
      <Header 
        title={caseData.title}
        subtitle={`Case ${caseData.case_number}`}
      />

      <div className="p-6 space-y-6">
        {/* Back Button & Case Info */}
        <div className="flex items-start justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/cases')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cases
          </Button>
          {getCaseStatusBadge(caseData.status)}
        </div>

        {/* Case Summary */}
        <div className="forensic-card p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{caseData.title}</h2>
              {caseData.description && (
                <p className="text-muted-foreground mt-1">{caseData.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Created {formatDistanceToNow(new Date(caseData.created_at), { addSuffix: true })}
              </p>
            </div>
            <Button onClick={() => navigate('/upload')} variant="forensic">
              <Upload className="h-4 w-4 mr-2" />
              Upload More Media
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-foreground">{totalMedia}</p>
              <p className="text-xs text-muted-foreground">Media Files</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-trust">{completedAnalyses}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-warning">{processingAnalyses}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </div>
        </div>

        {/* Media Files List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Media Files</h3>

          {mediaFiles?.length === 0 ? (
            <div className="forensic-card p-8 text-center">
              <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Media Files</h3>
              <p className="text-muted-foreground mb-4">
                Upload media files to start forensic analysis.
              </p>
              <Button onClick={() => navigate('/upload')}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mediaFiles?.map((media, index) => {
                const MediaIcon = getMediaIcon(media.media_type);
                const analysisResult = (media.analysis_results as {
                  status: string;
                  credibility_score: number | null;
                }[])?.[0];
                const analysisStatus = analysisResult?.status || 'none';
                const credibility = Number(analysisResult?.credibility_score) || 0;

                return (
                  <div
                    key={media.id}
                    className="forensic-card p-5 hover:border-primary/50 transition-colors cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => navigate(`/analysis/${media.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Thumbnail or Icon */}
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        {analysisStatus === 'completed' ? (
                          <CredibilityMeter score={credibility} size="sm" />
                        ) : analysisStatus === 'processing' ? (
                          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                        ) : (
                          <MediaIcon className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{media.file_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(analysisStatus)}
                          <Badge variant="outline" className="text-xs capitalize">
                            {media.media_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(media.created_at), { addSuffix: true })}
                        </p>
                      </div>

                      {/* View Button */}
                      <Button variant="outline" size="sm">
                        {analysisStatus === 'completed' ? (
                          <Eye className="h-4 w-4" />
                        ) : analysisStatus === 'processing' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
