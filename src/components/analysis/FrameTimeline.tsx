import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface FrameTimelineProps {
  scores: number[];
  currentFrame?: number;
  onFrameSelect?: (frame: number) => void;
}

export function FrameTimeline({ scores, currentFrame = 0, onFrameSelect }: FrameTimelineProps) {
  const getColor = (score: number) => {
    if (score >= 0.7) return 'bg-trust';
    if (score >= 0.4) return 'bg-warning';
    return 'bg-danger';
  };

  const avgScore = useMemo(() => {
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }, [scores]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Frame Analysis Timeline</span>
        <span className="font-mono">Avg: {(avgScore * 100).toFixed(1)}%</span>
      </div>
      
      <div className="relative h-12 rounded-lg bg-muted/50 overflow-hidden">
        {/* Frame bars */}
        <div className="absolute inset-0 flex items-end gap-px p-1">
          {scores.map((score, i) => (
            <button
              key={i}
              onClick={() => onFrameSelect?.(i)}
              className={cn(
                "flex-1 rounded-t transition-all duration-200",
                getColor(score),
                currentFrame === i && "ring-2 ring-white",
                "hover:opacity-80"
              )}
              style={{ height: `${score * 100}%`, minHeight: '4px' }}
            />
          ))}
        </div>
        
        {/* Threshold line */}
        <div className="absolute left-0 right-0 h-px bg-white/30" style={{ bottom: '70%' }} />
        <div className="absolute left-0 right-0 h-px bg-white/20" style={{ bottom: '40%' }} />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Frame 0</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-danger" />
            Anomaly
          </span>
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-warning" />
            Suspicious
          </span>
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-trust" />
            Normal
          </span>
        </div>
        <span>Frame {scores.length - 1}</span>
      </div>
    </div>
  );
}
