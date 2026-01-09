import { ReactNode } from 'react';
import { LucideIcon, ChevronRight, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AnalysisCardProps {
  title: string;
  icon: LucideIcon;
  status: 'pass' | 'warning' | 'fail' | 'analyzing';
  score?: number;
  findings?: string[];
  children?: ReactNode;
  expandable?: boolean;
}

export function AnalysisCard({ 
  title, 
  icon: Icon, 
  status, 
  score, 
  findings = [],
  children,
  expandable = false
}: AnalysisCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pass':
        return { 
          badge: <Badge variant="trust">Pass</Badge>,
          borderClass: 'border-trust/30',
          iconClass: 'text-trust',
          StatusIcon: CheckCircle
        };
      case 'warning':
        return { 
          badge: <Badge variant="warning">Warning</Badge>,
          borderClass: 'border-warning/30',
          iconClass: 'text-warning',
          StatusIcon: AlertCircle
        };
      case 'fail':
        return { 
          badge: <Badge variant="danger">Failed</Badge>,
          borderClass: 'border-danger/30',
          iconClass: 'text-danger',
          StatusIcon: AlertTriangle
        };
      case 'analyzing':
        return { 
          badge: <Badge variant="analysis">Analyzing</Badge>,
          borderClass: 'border-analysis/30',
          iconClass: 'text-analysis',
          StatusIcon: Icon
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={cn(
      "forensic-card border transition-all duration-300 hover:shadow-lg",
      config.borderClass
    )}>
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "rounded-lg p-2",
              config.iconClass.replace('text-', 'bg-') + '/10'
            )}>
              <Icon className={cn("h-5 w-5", config.iconClass)} />
            </div>
            <div>
              <h4 className="font-medium text-foreground">{title}</h4>
              {score !== undefined && (
                <p className="text-xs text-muted-foreground font-mono">
                  Score: {(score * 100).toFixed(1)}%
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {config.badge}
            {expandable && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>
      </div>

      {/* Findings List */}
      {findings.length > 0 && (
        <div className="p-4 space-y-2">
          {findings.map((finding, i) => (
            <div key={i} className="flex items-start gap-2">
              <config.StatusIcon className={cn("h-4 w-4 mt-0.5 shrink-0", config.iconClass)} />
              <p className="text-sm text-muted-foreground">{finding}</p>
            </div>
          ))}
        </div>
      )}

      {/* Custom Content */}
      {children && (
        <div className="p-4 border-t border-border/50">
          {children}
        </div>
      )}
    </div>
  );
}
