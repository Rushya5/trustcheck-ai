import { cn } from '@/lib/utils';
import { CredibilityLevel } from '@/types/analysis';

interface CredibilityMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function CredibilityMeter({ score, size = 'md', showLabel = true }: CredibilityMeterProps) {
  const getLevel = (score: number): CredibilityLevel => {
    if (score >= 70) return 'authentic';
    if (score >= 40) return 'suspicious';
    return 'manipulated';
  };

  const level = getLevel(score);

  const getColor = () => {
    switch (level) {
      case 'authentic': return 'text-trust';
      case 'suspicious': return 'text-warning';
      case 'manipulated': return 'text-danger';
    }
  };

  const getGlow = () => {
    switch (level) {
      case 'authentic': return 'shadow-trust/30';
      case 'suspicious': return 'shadow-warning/30';
      case 'manipulated': return 'shadow-danger/30';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-24 w-24 text-2xl';
      case 'md': return 'h-36 w-36 text-4xl';
      case 'lg': return 'h-48 w-48 text-5xl';
    }
  };

  const strokeWidth = size === 'sm' ? 6 : size === 'md' ? 8 : 10;
  const radius = size === 'sm' ? 40 : size === 'md' ? 60 : 80;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn("relative flex items-center justify-center", getSizeClasses())}>
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            className={cn(getColor(), "transition-all duration-1000")}
            style={{
              filter: `drop-shadow(0 0 10px currentColor)`,
            }}
          />
        </svg>
        <div className={cn("font-bold font-mono", getColor(), getSizeClasses().split(' ')[2])}>
          {score}%
        </div>
      </div>
      {showLabel && (
        <div className="text-center">
          <p className={cn("text-sm font-semibold uppercase tracking-wider", getColor())}>
            {level === 'authentic' && 'Likely Authentic'}
            {level === 'suspicious' && 'Suspicious'}
            {level === 'manipulated' && 'Likely Manipulated'}
          </p>
        </div>
      )}
    </div>
  );
}
