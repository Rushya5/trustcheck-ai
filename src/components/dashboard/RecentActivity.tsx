import { AlertTriangle, CheckCircle, Clock, FileSearch, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const activities = [
  {
    id: 1,
    type: 'upload',
    title: 'New media uploaded',
    description: 'speech_video.mp4 added to Case #001',
    time: '5 minutes ago',
    icon: Upload,
    iconColor: 'text-primary',
  },
  {
    id: 2,
    type: 'analysis',
    title: 'Analysis complete',
    description: 'Deepfake detected in interview.mp4',
    time: '12 minutes ago',
    icon: AlertTriangle,
    iconColor: 'text-danger',
  },
  {
    id: 3,
    type: 'verified',
    title: 'Media verified',
    description: 'document_scan.jpg marked as authentic',
    time: '1 hour ago',
    icon: CheckCircle,
    iconColor: 'text-trust',
  },
  {
    id: 4,
    type: 'analyzing',
    title: 'Analysis in progress',
    description: 'Processing audio_recording.wav',
    time: '2 hours ago',
    icon: FileSearch,
    iconColor: 'text-analysis',
  },
  {
    id: 5,
    type: 'pending',
    title: 'Pending review',
    description: 'Case #003 awaiting human verification',
    time: '3 hours ago',
    icon: Clock,
    iconColor: 'text-warning',
  },
];

export function RecentActivity() {
  return (
    <div className="forensic-card p-5">
      <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div 
            key={activity.id}
            className={cn(
              "flex items-start gap-3 animate-fade-in",
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={cn(
              "mt-0.5 rounded-lg p-2",
              activity.iconColor.replace('text-', 'bg-') + '/10'
            )}>
              <activity.icon className={cn("h-4 w-4", activity.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{activity.title}</p>
              <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
