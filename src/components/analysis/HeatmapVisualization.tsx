import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface HeatmapPoint {
  x: number;
  y: number;
  value: number;
}

interface HeatmapVisualizationProps {
  data: HeatmapPoint[];
  width?: number;
  height?: number;
  showLegend?: boolean;
}

export function HeatmapVisualization({ 
  data, 
  width = 400, 
  height = 300,
  showLegend = true 
}: HeatmapVisualizationProps) {
  const gridSize = useMemo(() => {
    const maxX = Math.max(...data.map(p => p.x));
    const maxY = Math.max(...data.map(p => p.y));
    return { cols: maxX + 1, rows: maxY + 1 };
  }, [data]);

  const cellWidth = width / gridSize.cols;
  const cellHeight = height / gridSize.rows;

  const getColor = (value: number) => {
    if (value < 0.3) return 'rgba(34, 197, 94, 0.6)'; // Trust green
    if (value < 0.6) return 'rgba(245, 158, 11, 0.7)'; // Warning amber
    return 'rgba(239, 68, 68, 0.8)'; // Danger red
  };

  return (
    <div className="relative">
      <div 
        className="relative rounded-lg overflow-hidden border border-border bg-muted/20"
        style={{ width, height }}
      >
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${cellWidth}px ${cellHeight}px`,
          }}
        />
        
        {/* Heatmap cells */}
        <svg width={width} height={height} className="absolute inset-0">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {data.map((point, i) => (
            <rect
              key={i}
              x={point.x * cellWidth}
              y={point.y * cellHeight}
              width={cellWidth}
              height={cellHeight}
              fill={getColor(point.value)}
              filter={point.value > 0.7 ? "url(#glow)" : undefined}
              className="transition-opacity duration-300 hover:opacity-80"
            />
          ))}
        </svg>

        {/* Scan line effect */}
        <div className="scan-line" />

        {/* Crosshair markers for high-anomaly areas */}
        {data.filter(p => p.value > 0.8).slice(0, 3).map((point, i) => (
          <div
            key={i}
            className="absolute border-2 border-danger rounded-sm animate-pulse"
            style={{
              left: point.x * cellWidth - 5,
              top: point.y * cellHeight - 5,
              width: cellWidth + 10,
              height: cellHeight + 10,
            }}
          />
        ))}
      </div>

      {showLegend && (
        <div className="mt-3 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-trust/60" />
            <span className="text-xs text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-warning/70" />
            <span className="text-xs text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-danger/80" />
            <span className="text-xs text-muted-foreground">High</span>
          </div>
        </div>
      )}
    </div>
  );
}
