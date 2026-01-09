import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: 'default' | 'trust' | 'warning' | 'danger' | 'primary';
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatsCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'trust': return 'border-trust/30 bg-trust/5';
      case 'warning': return 'border-warning/30 bg-warning/5';
      case 'danger': return 'border-danger/30 bg-danger/5';
      case 'primary': return 'border-primary/30 bg-primary/5';
      default: return 'border-border bg-card';
    }
  };

  const getIconClasses = () => {
    switch (variant) {
      case 'trust': return 'text-trust bg-trust/10';
      case 'warning': return 'text-warning bg-warning/10';
      case 'danger': return 'text-danger bg-danger/10';
      case 'primary': return 'text-primary bg-primary/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className={cn(
      "rounded-xl border p-5 transition-all duration-300 hover:shadow-lg",
      getVariantClasses()
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold font-mono text-foreground">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              "mt-2 text-xs font-medium",
              trend.positive ? "text-trust" : "text-danger"
            )}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
        <div className={cn("rounded-lg p-3", getIconClasses())}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
