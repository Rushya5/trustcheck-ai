import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { BlockchainVerification } from '@/components/blockchain/BlockchainVerification';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlockchainRecords } from '@/hooks/useReports';
import { 
  Blocks, 
  Link as LinkIcon, 
  Shield, 
  CheckCircle,
  Clock,
  ExternalLink,
  AlertTriangle,
  FileQuestion
} from 'lucide-react';

export default function BlockchainPage() {
  const { records, isLoading, error, stats } = useBlockchainRecords();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Blockchain Verification" subtitle="Immutable integrity records" />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-32 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header title="Blockchain Verification" subtitle="Immutable integrity records" />
        <div className="p-6">
          <div className="forensic-card p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Records</h3>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Blockchain Verification" 
        subtitle="Immutable integrity records"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="forensic-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Blocks className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">{stats.totalRecords}</p>
              <p className="text-sm text-muted-foreground">Total Records</p>
            </div>
          </div>
          <div className="forensic-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-trust/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-trust" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">{stats.verifiedRecords}</p>
              <p className="text-sm text-muted-foreground">Verified</p>
            </div>
          </div>
          <div className="forensic-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-analysis/10 flex items-center justify-center">
              <LinkIcon className="h-6 w-6 text-analysis" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">—</p>
              <p className="text-sm text-muted-foreground">Block Height</p>
            </div>
          </div>
          <div className="forensic-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">~2s</p>
              <p className="text-sm text-muted-foreground">Avg Confirm Time</p>
            </div>
          </div>
        </div>

        {/* Network Status */}
        <div className="forensic-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Network Status</h3>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-trust animate-pulse" />
              <span className="text-sm text-trust">Connected</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Network</p>
              <p className="font-mono text-foreground">Polygon PoS</p>
            </div>
            <div>
              <p className="text-muted-foreground">Chain ID</p>
              <p className="font-mono text-foreground">137</p>
            </div>
            <div>
              <p className="text-muted-foreground">Gas Price</p>
              <p className="font-mono text-foreground">~30 Gwei</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Sync</p>
              <p className="font-mono text-foreground">Live</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Recent Verification Records</h3>
            <Button variant="outline" size="sm" asChild>
              <a href="https://polygonscan.com" target="_blank" rel="noopener noreferrer">
                View on Explorer
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>

          {records.length === 0 ? (
            <div className="forensic-card p-8 text-center">
              <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Blockchain Records</h3>
              <p className="text-muted-foreground mb-4">
                Complete an analysis to create your first blockchain verification record.
              </p>
              <Button onClick={() => navigate('/upload')}>
                Upload Media
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {records.map((record, index) => (
                <div 
                  key={record.id}
                  className="animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => navigate(`/analysis/${record.media_id}`)}
                >
                  <BlockchainVerification
                    hash={record.sha256_hash || ''}
                    txId={record.blockchain_tx_id || ''}
                    timestamp={record.blockchain_verified_at ? new Date(record.blockchain_verified_at) : undefined}
                    verified={!!record.blockchain_tx_id}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
