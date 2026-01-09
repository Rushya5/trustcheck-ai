import { Header } from '@/components/layout/Header';
import { BlockchainVerification } from '@/components/blockchain/BlockchainVerification';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Blocks, 
  Link as LinkIcon, 
  Shield, 
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

const mockTransactions = [
  {
    id: 'tx-001',
    hash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    txId: '0x1234567890abcdef1234567890abcdef12345678',
    timestamp: new Date('2024-01-16T14:32:00'),
    caseId: 'case-001',
    caseName: 'Political Speech Verification',
    verified: true,
  },
  {
    id: 'tx-002',
    hash: '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
    txId: '0x234567890abcdef1234567890abcdef123456789',
    timestamp: new Date('2024-01-15T09:15:00'),
    caseId: 'case-002',
    caseName: 'Celebrity Interview Analysis',
    verified: true,
  },
  {
    id: 'tx-003',
    hash: '0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
    txId: '0x34567890abcdef1234567890abcdef1234567890',
    timestamp: new Date('2024-01-12T16:45:00'),
    caseId: 'case-003',
    caseName: 'Financial Statement Audio',
    verified: true,
  },
];

export default function BlockchainPage() {
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
              <p className="text-2xl font-bold font-mono text-foreground">1,247</p>
              <p className="text-sm text-muted-foreground">Total Records</p>
            </div>
          </div>
          <div className="forensic-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-trust/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-trust" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">1,247</p>
              <p className="text-sm text-muted-foreground">Verified</p>
            </div>
          </div>
          <div className="forensic-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-analysis/10 flex items-center justify-center">
              <LinkIcon className="h-6 w-6 text-analysis" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">89,432</p>
              <p className="text-sm text-muted-foreground">Block Height</p>
            </div>
          </div>
          <div className="forensic-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">2.3s</p>
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
              <p className="font-mono text-foreground">30 Gwei</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Sync</p>
              <p className="font-mono text-foreground">2 seconds ago</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockTransactions.map((tx, index) => (
              <div 
                key={tx.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <BlockchainVerification
                  hash={tx.hash}
                  txId={tx.txId}
                  timestamp={tx.timestamp}
                  verified={tx.verified}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
