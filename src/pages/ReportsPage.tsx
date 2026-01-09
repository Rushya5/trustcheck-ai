import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useReports } from '@/hooks/useReports';
import { generateForensicReport } from '@/lib/generateForensicReport';
import { toast } from 'sonner';
import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  Shield,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileQuestion
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ReportsPage() {
  const { reports, isLoading, error } = useReports();
  const navigate = useNavigate();
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const getCredibilityStatus = (score: number | null) => {
    if (!score) return 'uncertain';
    if (score >= 70) return 'authentic';
    if (score >= 40) return 'suspicious';
    return 'manipulated';
  };

  const getStatusBadge = (status: 'authentic' | 'suspicious' | 'manipulated' | 'uncertain') => {
    switch (status) {
      case 'authentic':
        return <Badge variant="trust" className="gap-1"><CheckCircle className="h-3 w-3" />Authentic</Badge>;
      case 'suspicious':
        return <Badge variant="warning" className="gap-1"><AlertTriangle className="h-3 w-3" />Suspicious</Badge>;
      case 'manipulated':
        return <Badge variant="danger" className="gap-1"><AlertTriangle className="h-3 w-3" />Manipulated</Badge>;
      default:
        return <Badge variant="secondary" className="gap-1">Uncertain</Badge>;
    }
  };

  const handleDownload = async (report: typeof reports[0]) => {
    setGeneratingId(report.id);
    try {
      const mediaFile = report.media_files as { file_name: string; cases: { title: string } | null } | null;
      await generateForensicReport({
        analysis: report,
        caseName: mediaFile?.cases?.title || 'Unknown Case',
        mediaFileName: mediaFile?.file_name || 'Unknown File'
      });
      toast.success('Report downloaded successfully');
    } catch (err) {
      console.error('Failed to generate report:', err);
      toast.error('Failed to generate report');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleView = (report: typeof reports[0]) => {
    navigate(`/analysis/${report.media_id}`);
  };

  // Calculate stats
  const totalReports = reports.length;
  const blockchainVerified = reports.filter(r => r.blockchain_tx_id).length;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Forensic Reports" subtitle="Generated analysis reports" />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header title="Forensic Reports" subtitle="Generated analysis reports" />
        <div className="p-6">
          <div className="forensic-card p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Reports</h3>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Forensic Reports" 
        subtitle="Generated analysis reports"
      />

      <div className="p-6 space-y-6">
        {/* Report Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="forensic-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">{totalReports}</p>
              <p className="text-sm text-muted-foreground">Total Reports</p>
            </div>
          </div>
          <div className="forensic-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-trust/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-trust" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">{blockchainVerified}</p>
              <p className="text-sm text-muted-foreground">Blockchain Verified</p>
            </div>
          </div>
          <div className="forensic-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-analysis/10 flex items-center justify-center">
              <Download className="h-6 w-6 text-analysis" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">—</p>
              <p className="text-sm text-muted-foreground">Downloads</p>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Recent Reports</h3>
          
          {reports.length === 0 ? (
            <div className="forensic-card p-8 text-center">
              <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete an analysis to generate your first forensic report.
              </p>
              <Button onClick={() => navigate('/upload')}>
                Upload Media
              </Button>
            </div>
          ) : (
            reports.map((report, index) => {
              const mediaFile = report.media_files as { file_name: string; cases: { title: string; case_number: string } | null } | null;
              const caseName = mediaFile?.cases?.title || 'Unknown Case';
              const credibility = Number(report.credibility_score) || 0;
              const status = getCredibilityStatus(report.credibility_score);

              return (
                <div 
                  key={report.id}
                  className="forensic-card p-5 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{caseName}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          {getStatusBadge(status)}
                          <span className="text-xs text-muted-foreground">
                            {mediaFile?.file_name || 'Unknown file'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Completed {report.completed_at 
                            ? formatDistanceToNow(new Date(report.completed_at), { addSuffix: true })
                            : 'recently'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Credibility Score */}
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">Credibility</p>
                        <p className={`text-lg font-bold font-mono ${
                          credibility >= 70 ? 'text-trust' :
                          credibility >= 40 ? 'text-warning' : 'text-danger'
                        }`}>
                          {credibility}%
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleView(report)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="forensic" 
                          size="sm" 
                          onClick={() => handleDownload(report)}
                          disabled={generatingId === report.id}
                        >
                          {generatingId === report.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
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
