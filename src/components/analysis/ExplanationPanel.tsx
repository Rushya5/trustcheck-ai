import { useState } from 'react';
import { Explanation } from '@/types/analysis';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Eye, FileText, Scale, ChevronDown, ChevronUp } from 'lucide-react';

interface ExplanationPanelProps {
  explanation: Explanation;
}

export function ExplanationPanel({ explanation }: ExplanationPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'plain' | 'legal' | 'technical'>('plain');

  const getSeverityBadge = () => {
    switch (explanation.severity) {
      case 'critical': return <Badge variant="danger">Critical</Badge>;
      case 'warning': return <Badge variant="warning">Warning</Badge>;
      case 'info': return <Badge variant="info">Info</Badge>;
    }
  };

  const getCategoryBadge = () => {
    switch (explanation.category) {
      case 'visual': return <Badge variant="analysis" className="text-xs">Visual</Badge>;
      case 'audio': return <Badge variant="analysis" className="text-xs">Audio</Badge>;
      case 'metadata': return <Badge variant="secondary" className="text-xs">Metadata</Badge>;
      case 'contextual': return <Badge variant="warning" className="text-xs">Context</Badge>;
    }
  };

  const getContent = () => {
    switch (viewMode) {
      case 'plain': return explanation.plainLanguage;
      case 'legal': return explanation.legalSummary;
      case 'technical': return explanation.technicalDetail;
    }
  };

  return (
    <div className={cn(
      "forensic-card border transition-all duration-300",
      explanation.severity === 'critical' && "border-danger/30",
      explanation.severity === 'warning' && "border-warning/30",
      explanation.severity === 'info' && "border-primary/30"
    )}>
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getSeverityBadge()}
              {getCategoryBadge()}
            </div>
            <h4 className="font-medium text-foreground">{explanation.finding}</h4>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {explanation.plainLanguage}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50 pt-4 animate-fade-in">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">View:</span>
            <div className="flex rounded-lg bg-muted p-1">
              <Button
                variant={viewMode === 'plain' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={(e) => { e.stopPropagation(); setViewMode('plain'); }}
              >
                <Eye className="h-3 w-3 mr-1" />
                Plain
              </Button>
              <Button
                variant={viewMode === 'legal' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={(e) => { e.stopPropagation(); setViewMode('legal'); }}
              >
                <Scale className="h-3 w-3 mr-1" />
                Legal
              </Button>
              <Button
                variant={viewMode === 'technical' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={(e) => { e.stopPropagation(); setViewMode('technical'); }}
              >
                <FileText className="h-3 w-3 mr-1" />
                Technical
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="rounded-lg bg-muted/50 p-4">
            <p className={cn(
              "text-sm text-foreground leading-relaxed",
              viewMode === 'technical' && "font-mono text-xs"
            )}>
              {getContent()}
            </p>
          </div>

          {/* Evidence */}
          {explanation.evidence && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-1">Evidence Sources:</p>
              <p className="text-xs font-mono text-primary">{explanation.evidence}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
