import { AlertTriangle, CheckCircle, Clock, FileSearch, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { formatDistanceToNow } from 'date-fns';

const iconMap: Record<string, any> = {
  Upload,
  AlertTriangle,
  CheckCircle,
  FileSearch,
  Clock,
};

export function RecentActivity() {
  const { logs, isLoading } = useActivityLogs(5);

  if (isLoading) {
    return (
      <div className="forensic-card p-5">
        <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="forensic-card p-5">
      <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
      {logs.length > 0 ? (
        <div className="space-y-4">
          {logs.map((activity, index) => {
            const IconComponent = iconMap[activity.icon || 'FileSearch'] || FileSearch;
            const iconColor = activity.icon_color || 'text-primary';
            
            return (
              <div 
                key={activity.id}
                className={cn(
                  "flex items-start gap-3 animate-fade-in",
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn(
                  "mt-0.5 rounded-lg p-2",
                  iconColor.replace('text-', 'bg-') + '/10'
                )}>
                  <IconComponent className={cn("h-4 w-4", iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          No recent activity
        </p>
      )}
    </div>
  );
}
