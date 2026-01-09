import { Link } from 'react-router-dom';
import { Folder, Clock, FileImage, ChevronRight } from 'lucide-react';
import { Case } from '@/types/analysis';
import { Badge } from '@/components/ui/badge';
import { CredibilityMeter } from './CredibilityMeter';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface CaseCardProps {
  caseData: Case;
}

export function CaseCard({ caseData }: CaseCardProps) {
  const getStatusBadge = () => {
    switch (caseData.status) {
      case 'open': return <Badge variant="analysis">Open</Badge>;
      case 'closed': return <Badge variant="trust">Closed</Badge>;
      case 'archived': return <Badge variant="secondary">Archived</Badge>;
    }
  };

  return (
    <Link 
      to={`/cases/${caseData.id}`}
      className="group block"
    >
      <div className={cn(
        "forensic-card p-5 transition-all duration-300",
        "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
        "group-hover:translate-y-[-2px]"
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Folder className="h-4 w-4 text-primary shrink-0" />
              {getStatusBadge()}
            </div>
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {caseData.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {caseData.description}
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileImage className="h-3 w-3" />
                {caseData.mediaCount} files
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(caseData.updatedAt, { addSuffix: true })}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {caseData.credibilityScore !== undefined && (
              <CredibilityMeter score={caseData.credibilityScore} size="sm" showLabel={false} />
            )}
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}
