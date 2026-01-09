import { CheckCircle, ExternalLink, Copy, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BlockchainVerificationProps {
  hash: string;
  txId?: string;
  timestamp?: Date;
  verified?: boolean;
}

export function BlockchainVerification({ 
  hash, 
  txId, 
  timestamp,
  verified = true 
}: BlockchainVerificationProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="forensic-card border border-trust/20 overflow-hidden">
      {/* Header */}
      <div className="bg-trust/5 border-b border-trust/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-trust/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-trust" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Blockchain Verification</h4>
              <p className="text-xs text-muted-foreground">Immutable integrity proof</p>
            </div>
          </div>
          {verified && (
            <Badge variant="trust" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Hash */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Integrity Hash (SHA-256)</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono text-primary bg-muted/50 p-2 rounded truncate">
              {hash}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => copyToClipboard(hash, 'Hash')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Transaction ID */}
        {txId && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Blockchain Transaction</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono text-analysis bg-muted/50 p-2 rounded truncate">
                {txId}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => copyToClipboard(txId, 'Transaction ID')}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                asChild
              >
                <a 
                  href={`https://polygonscan.com/tx/${txId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Recorded</span>
              <span className="font-mono text-foreground">
                {timestamp.toISOString()}
              </span>
            </div>
          </div>
        )}

        {/* Chain Badge */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Network</span>
          <Badge variant="secondary" className="text-xs">
            Polygon PoS
          </Badge>
        </div>
      </div>
    </div>
  );
}
