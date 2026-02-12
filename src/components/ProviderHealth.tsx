import { Wifi } from "lucide-react";
import { useGatewayStats } from "@/hooks/useGatewayStats";

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

const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const formatLatency = (ms: number) => ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
const latencyColor = (ms: number) => ms <= 0 ? 'text-muted-foreground' : ms < 1000 ? 'text-primary' : ms <= 3000 ? 'text-warning' : 'text-destructive';

export function ProviderHealth() {
  const { acquirerStats, isLoading } = useGatewayStats("24h");

  return (
    <div className="border rounded-lg bg-card">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Wifi className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] uppercase tracking-widest text-primary font-medium">
          Adquirentes
        </span>
      </div>
      <div className="divide-y divide-border">
        {isLoading ? (
          <div className="py-6 text-center text-xs text-muted-foreground">Carregando...</div>
        ) : acquirerStats.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">Sem dados de adquirentes</div>
        ) : (
          acquirerStats.map((acq) => (
            <div key={acq.name} className={`flex items-center justify-between px-4 py-2.5 ${acq.successRate < 70 ? 'bg-destructive/5' : ''}`}>
              <div className="flex items-center gap-2.5">
                <StatusDot successRate={acq.successRate} />
                <span className="text-xs font-medium text-foreground capitalize">{acq.name}</span>
                <span className="text-[10px] text-muted-foreground">{acq.count} txns</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-muted-foreground font-mono">{formatBRL(acq.totalAmount)}</span>
                {acq.avgLatencyMs > 0 && (
                  <span className={`text-[10px] font-mono ${latencyColor(acq.avgLatencyMs)}`}>{formatLatency(acq.avgLatencyMs)}</span>
                )}
                <LatencyBar successRate={acq.successRate} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
