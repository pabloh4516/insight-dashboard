import { Wifi } from "lucide-react";
import { useHealthCheck } from "@/hooks/useHealthCheck";

function StatusDot({ successRate }: { successRate: number }) {
  const color = successRate >= 95 ? "bg-primary" : successRate >= 70 ? "bg-warning" : "bg-destructive";
  const isOnline = successRate >= 95;

  return (
    <span className="relative flex h-2 w-2">
      {isOnline && <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-40 animate-ping`} />}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
    </span>
  );
}

function LatencyBar({ successRate }: { successRate: number }) {
  const pct = Math.min(successRate, 100);
  const color = successRate >= 95 ? "bg-primary" : successRate >= 70 ? "bg-warning" : "bg-destructive";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-16 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground font-mono">{successRate.toFixed(0)}%</span>
    </div>
  );
}

export function ProviderHealth() {
  const { checks, isUp } = useHealthCheck();
  const acquirers = checks?.acquirers ?? [];

  return (
    <div className="border rounded-lg bg-card">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Wifi className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] uppercase tracking-widest text-primary font-medium">
          Adquirentes
        </span>
      </div>
      <div className="divide-y divide-border">
        {isUp === null ? (
          <div className="py-6 text-center text-xs text-muted-foreground">Carregando...</div>
        ) : acquirers.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">Sem dados de adquirentes</div>
        ) : (
          acquirers.map((acq) => (
            <div key={acq.slug} className={`flex items-center justify-between px-4 py-2.5 ${acq.success_rate < 70 ? 'bg-destructive/5' : ''}`}>
              <div className="flex items-center gap-2.5">
                <StatusDot successRate={acq.success_rate} />
                <span className="text-xs font-medium text-foreground capitalize">{acq.name}</span>
                <span className="text-[10px] text-muted-foreground">{acq.transactions_24h} txns</span>
              </div>
              <div className="flex items-center gap-4">
                <LatencyBar successRate={acq.success_rate} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
