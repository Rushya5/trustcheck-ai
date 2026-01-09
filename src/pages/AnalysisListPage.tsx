import { useNavigate } from 'react-router-dom';
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
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  FileQuestion,
  Upload,
  Shield
} from 'lucide-react';

export default function AnalysisListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: analyses, isLoading, error } = useQuery({
    queryKey: ['all-analyses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analysis_results')
        .select(`
          *,
          media_files(
            id,
            file_name,
            media_type,
            case_id,
            cases(id, title, case_number)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('analyses-list-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analysis_results',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['all-analyses'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

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
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCredibilityColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 70) return 'text-trust';
    if (score >= 40) return 'text-warning';
    return 'text-danger';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="All Analyses" subtitle="Browse forensic analyses" />
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header title="All Analyses" subtitle="Browse forensic analyses" />
        <div className="p-6">
          <div className="forensic-card p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Analyses</h3>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalAnalyses = analyses?.length ?? 0;
  const completedAnalyses = analyses?.filter(a => a.status === 'completed').length ?? 0;
  const processingAnalyses = analyses?.filter(a => a.status === 'processing' || a.status === 'pending').length ?? 0;
  const blockchainVerified = analyses?.filter(a => a.blockchain_tx_id).length ?? 0;

  return (
    <div className="min-h-screen">
      <Header 
        title="All Analyses" 
        subtitle="Browse forensic analyses"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="forensic-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold font-mono text-foreground">{totalAnalyses}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
          <div className="forensic-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-trust/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-trust" />
            </div>
            <div>
              <p className="text-xl font-bold font-mono text-foreground">{completedAnalyses}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
          <div className="forensic-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xl font-bold font-mono text-foreground">{processingAnalyses}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </div>
          <div className="forensic-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-analysis/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-analysis" />
            </div>
            <div>
              <p className="text-xl font-bold font-mono text-foreground">{blockchainVerified}</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
          </div>
        </div>

        {/* Analyses List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Recent Analyses</h3>

          {analyses?.length === 0 ? (
            <div className="forensic-card p-8 text-center">
              <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Analyses Yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload media files to start your first forensic analysis.
              </p>
              <Button onClick={() => navigate('/upload')}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            </div>
          ) : (
            analyses?.map((analysis, index) => {
              const mediaFile = analysis.media_files as { 
                id: string;
                file_name: string; 
                media_type: string;
                cases: { title: string; case_number: string } | null 
              } | null;
              
              const caseName = mediaFile?.cases?.title || 'Unknown Case';
              const caseNumber = mediaFile?.cases?.case_number || '';
              const fileName = mediaFile?.file_name || 'Unknown File';
              const mediaType = mediaFile?.media_type || 'unknown';
              const credibility = Number(analysis.credibility_score) || 0;

              return (
                <div
                  key={analysis.id}
                  className="forensic-card p-5 hover:border-primary/50 transition-colors cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/analysis/${analysis.media_id}`)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Credibility Meter */}
                      {analysis.status === 'completed' ? (
                        <CredibilityMeter score={credibility} size="sm" />
                      ) : (
                        <div className="h-16 w-16 rounded-full border-2 border-dashed border-muted flex items-center justify-center">
                          {analysis.status === 'processing' ? (
                            <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                          ) : (
                            <Clock className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium text-foreground">{fileName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(analysis.status)}
                          <Badge variant="outline" className="text-xs">
                            {mediaType}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {caseNumber} • {caseName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Credibility Score */}
                      {analysis.status === 'completed' && (
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">Credibility</p>
                          <p className={`text-lg font-bold font-mono ${getCredibilityColor(analysis.credibility_score)}`}>
                            {credibility}%
                          </p>
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="text-right hidden md:block">
                        <p className="text-xs text-muted-foreground">
                          {analysis.status === 'completed' ? 'Completed' : 'Started'}
                        </p>
                        <p className="text-sm text-foreground">
                          {formatDistanceToNow(
                            new Date(analysis.completed_at || analysis.created_at), 
                            { addSuffix: true }
                          )}
                        </p>
                      </div>

                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
