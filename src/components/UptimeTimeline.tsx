import { useHealthCheck, HealthCheckEntry } from "@/hooks/useHealthCheck";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, startOfHour, addHours } from "date-fns";

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

  const now = new Date();
  const hourStart = startOfHour(now);
  const hourEnd = addHours(hourStart, 1);

  // Build 30 slots — each slot is a 2-min window within the current hour
  // history is already deduplicated by slot, so map them back
  const slotMap = new Map<number, HealthCheckEntry>();
  for (const entry of history) {
    const diff = new Date(entry.timestamp).getTime() - hourStart.getTime();
    const slot = Math.floor(diff / (2 * 60 * 1000));
    if (slot >= 0 && slot < 30) slotMap.set(slot, entry);
  }

  const blocks: (HealthCheckEntry | null)[] = [];
  for (let i = 0; i < 30; i++) {
    blocks.push(slotMap.get(i) ?? null);
  }

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          Disponibilidade ({format(hourStart, 'HH:mm')} – {format(hourEnd, 'HH:mm')})
        </span>
        <span className="text-[10px] text-muted-foreground">{history.length}/30 checks</span>
      </div>
      <TooltipProvider>
        <div className="flex gap-0.5">
          {blocks.map((entry, i) => {
            const slotStart = new Date(hourStart.getTime() + i * 2 * 60 * 1000);
            const slotEnd = new Date(slotStart.getTime() + 2 * 60 * 1000);
            return (
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
                    : <span>{format(slotStart, 'HH:mm')}–{format(slotEnd, 'HH:mm')} · Sem dados</span>}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
