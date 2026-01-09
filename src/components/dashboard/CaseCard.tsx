import { Link } from 'react-router-dom';
import { FileSearch, Clock, CheckCircle, Loader2, Archive, ChevronRight, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useCases } from '@/hooks/useCases';
import { toast } from 'sonner';

interface CaseCardProps {
  caseData: {
    id: string;
    case_number: string;
    title: string;
    description?: string | null;
    status: 'open' | 'analyzing' | 'completed' | 'archived';
    priority?: string | null;
    created_at: string;
  };
}

export function CaseCard({ caseData }: CaseCardProps) {
  const { deleteCase } = useCases();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await deleteCase.mutateAsync(caseData.id);
      toast.success('Case deleted successfully');
    } catch (error) {
      toast.error('Failed to delete case');
    }
  };

  const getStatusIcon = () => {
    switch (caseData.status) {
      case 'analyzing':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'archived':
        return <Archive className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusVariant = (): "analysis" | "trust" | "secondary" | "warning" => {
    switch (caseData.status) {
      case 'analyzing': return 'analysis';
      case 'completed': return 'trust';
      case 'archived': return 'secondary';
      default: return 'warning';
    }
  };

  const getPriorityVariant = (): "danger" | "warning" | "secondary" => {
    switch (caseData.priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="relative group">
      <Link to={`/cases/${caseData.id}`} className="block">
        <div className={cn(
          "forensic-card p-5 transition-all duration-300",
          "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
          "group-hover:translate-y-[-2px]",
          caseData.status === 'analyzing' && "border-analysis/30"
        )}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <FileSearch className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-mono text-muted-foreground">{caseData.case_number}</span>
                <Badge variant={getStatusVariant()} className="text-xs">
                  {getStatusIcon()}
                  <span className="ml-1 capitalize">{caseData.status}</span>
                </Badge>
                {caseData.priority && (
                  <Badge variant={getPriorityVariant()} className="text-xs capitalize">
                    {caseData.priority}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {caseData.title}
              </h3>
              {caseData.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {caseData.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(caseData.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Case</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{caseData.title}"? This will also delete all associated media files and analysis results. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteCase.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
