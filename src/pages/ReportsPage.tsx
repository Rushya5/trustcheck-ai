import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  Shield,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const mockReports = [
  {
    id: 'report-001',
    caseId: 'case-001',
    caseName: 'Political Speech Verification',
    generatedAt: new Date('2024-01-16T14:32:00'),
    mediaCount: 3,
    credibility: 34,
    status: 'manipulated' as const,
  },
  {
    id: 'report-002',
    caseId: 'case-002',
    caseName: 'Celebrity Interview Analysis',
    generatedAt: new Date('2024-01-15T09:15:00'),
    mediaCount: 2,
    credibility: 78,
    status: 'suspicious' as const,
  },
  {
    id: 'report-003',
    caseId: 'case-003',
    caseName: 'Financial Statement Audio',
    generatedAt: new Date('2024-01-12T16:45:00'),
    mediaCount: 1,
    credibility: 92,
    status: 'authentic' as const,
  },
];

export default function ReportsPage() {
  const getStatusBadge = (status: 'authentic' | 'suspicious' | 'manipulated') => {
    switch (status) {
      case 'authentic':
        return <Badge variant="trust" className="gap-1"><CheckCircle className="h-3 w-3" />Authentic</Badge>;
      case 'suspicious':
        return <Badge variant="warning" className="gap-1"><AlertTriangle className="h-3 w-3" />Suspicious</Badge>;
      case 'manipulated':
        return <Badge variant="danger" className="gap-1"><AlertTriangle className="h-3 w-3" />Manipulated</Badge>;
    }
  };

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
              <p className="text-2xl font-bold font-mono text-foreground">24</p>
              <p className="text-sm text-muted-foreground">Total Reports</p>
            </div>
          </div>
          <div className="forensic-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-trust/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-trust" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">18</p>
              <p className="text-sm text-muted-foreground">Blockchain Verified</p>
            </div>
          </div>
          <div className="forensic-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-analysis/10 flex items-center justify-center">
              <Download className="h-6 w-6 text-analysis" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">156</p>
              <p className="text-sm text-muted-foreground">Downloads</p>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Recent Reports</h3>
          
          {mockReports.map((report, index) => (
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
                    <h4 className="font-medium text-foreground">{report.caseName}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      {getStatusBadge(report.status)}
                      <span className="text-xs text-muted-foreground">
                        {report.mediaCount} media files
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Generated {formatDistanceToNow(report.generatedAt, { addSuffix: true })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Credibility Score */}
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">Credibility</p>
                    <p className={`text-lg font-bold font-mono ${
                      report.credibility >= 70 ? 'text-trust' :
                      report.credibility >= 40 ? 'text-warning' : 'text-danger'
                    }`}>
                      {report.credibility}%
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="forensic" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
