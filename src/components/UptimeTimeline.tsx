import { useHealthCheck, HealthCheckEntry } from "@/hooks/useHealthCheck";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

function blockColor(entry: HealthCheckEntry | null): string {
  if (!entry) return 'hsl(var(--muted))';
  if (!entry.isUp || entry.status === 'down' || entry.status === null) return 'hsl(var(--color-error))';
  if (entry.status === 'degraded') return 'hsl(var(--color-warning))';
  return 'hsl(var(--color-success))';
}

function statusLabel(entry: HealthCheckEntry): string {
  if (!entry.isUp || entry.status === null) return 'Offline';
  if (entry.status === 'down') return 'Down';
  if (entry.status === 'degraded') return 'Degradado';
  return 'Operacional';
}

export function UptimeTimeline() {
  const { history } = useHealthCheck();

  // Pad to 30 blocks
  const blocks: (HealthCheckEntry | null)[] = [];
  for (let i = 0; i < 30; i++) {
    blocks.push(history[history.length - 30 + i] ?? null);
  }

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Disponibilidade (última hora)</span>
        <span className="text-[10px] text-muted-foreground">{history.length} checks</span>
      </div>
      <TooltipProvider>
        <div className="flex gap-0.5">
          {blocks.map((entry, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div
                  className="flex-1 h-5 rounded-sm cursor-default transition-colors"
                  style={{ backgroundColor: blockColor(entry), minWidth: 4 }}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10px]">
                {entry
                  ? <span>{format(new Date(entry.timestamp), 'HH:mm:ss')} — {statusLabel(entry)}</span>
                  : <span>Sem dados</span>}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
