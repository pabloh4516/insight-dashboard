import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface FilterSection {
  label: string;
  key: string;
  options: { value: string; label: string; count: number }[];
}

interface LogsFilterPanelProps {
  sections: FilterSection[];
  selected: Record<string, Set<string>>;
  onToggle: (sectionKey: string, value: string) => void;
  onReset: () => void;
}

export function LogsFilterPanel({ sections, selected, onToggle, onReset }: LogsFilterPanelProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleSection = (key: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const hasAnyFilter = Object.values(selected).some(s => s.size > 0);

  return (
    <div className="w-56 shrink-0 space-y-1 text-xs">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">Filtros</span>
        {hasAnyFilter && (
          <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground" onClick={onReset}>
            <RotateCcw className="h-3 w-3 mr-1" /> Resetar
          </Button>
        )}
      </div>

      {sections.map(section => {
        const isCollapsed = collapsed.has(section.key);
        return (
          <div key={section.key} className="border-b border-border/30 pb-2 mb-2">
            <button
              onClick={() => toggleSection(section.key)}
              className="flex items-center gap-1 w-full text-left text-[10px] font-display uppercase tracking-widest text-muted-foreground hover:text-foreground py-1"
            >
              {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {section.label}
            </button>
            {!isCollapsed && (
              <div className="space-y-1 mt-1 ml-4">
                {section.options.map(opt => {
                  const isChecked = selected[section.key]?.has(opt.value) ?? false;
                  return (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => onToggle(section.key, opt.value)}
                        className="h-3 w-3"
                      />
                      <span className={`flex-1 ${isChecked ? 'text-foreground' : 'text-muted-foreground'} group-hover:text-foreground`}>
                        {opt.label}
                      </span>
                      <span className="text-muted-foreground tabular-nums">{opt.count}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
