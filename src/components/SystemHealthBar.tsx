import { Activity } from "lucide-react";
import { useGatewayStats } from "@/hooks/useGatewayStats";
import { useHealthCheck } from "@/hooks/useHealthCheck";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function getHealthColor(score: number): string {
  if (score >= 80) return "hsl(var(--color-success))";
  if (score >= 50) return "hsl(var(--color-warning))";
  return "hsl(var(--color-error))";
}

function getHealthLabel(score: number): string {
  if (score >= 80) return "Saudável";
  if (score >= 50) return "Atenção";
  return "Crítico";
}

export function SystemHealthBar() {
  const { errorsToday, totalEvents, acquirerStats } = useGatewayStats("24h");
  const hc = useHealthCheck();

  const factors: { label: string; impact: number }[] = [];

  // Health check status factor
  if (hc.isUp === false && hc.status === null) {
    factors.push({ label: `Health check FALHOU${hc.statusCode ? ` (HTTP ${hc.statusCode})` : ''}`, impact: -100 });
  } else if (hc.status === 'down') {
    factors.push({ label: "Status: DOWN", impact: -100 });
  } else if (hc.status === 'degraded') {
    factors.push({ label: "Status: degradado", impact: -30 });
  } else if (hc.status === 'operational') {
    factors.push({ label: "Health check: OK", impact: 0 });
  }

  // Queue critical
  if (hc.checks?.queue?.status === 'critical') {
    factors.push({ label: `Fila: ${hc.checks.queue.failed_jobs} jobs falhados`, impact: -20 });
  } else if (hc.checks?.queue) {
    factors.push({ label: `Fila: ${hc.checks.queue.failed_jobs} jobs falhados`, impact: 0 });
  }

  // Inactivity from last_transaction
  const minutesAgo = hc.checks?.lastTransaction?.minutes_ago;
  if (minutesAgo != null) {
    let inactivityImpact = 0;
    if (minutesAgo > 1440) inactivityImpact = -100;
    else if (minutesAgo > 60) inactivityImpact = -70;
    else if (minutesAgo > 30) inactivityImpact = -40;
    else if (minutesAgo > 10) inactivityImpact = -20;
    factors.push({ label: `Última transação: ${Math.round(minutesAgo)}min atrás`, impact: inactivityImpact });
  }

  // Database latency (informational)
  if (hc.checks?.database) {
    factors.push({ label: `Database: ${hc.checks.database.status} (${hc.checks.database.latency_ms}ms)`, impact: 0 });
  }

  // Redis latency (informational)
  if (hc.checks?.redis) {
    factors.push({ label: `Redis: ${hc.checks.redis.status} (${hc.checks.redis.latency_ms}ms)`, impact: 0 });
  }

  // Error rate impact
  const errorRate = totalEvents > 0 ? (errorsToday / totalEvents) * 100 : 0;
  const errorImpact = Math.min(errorRate * 3, 30);
  factors.push({ label: `Taxa de erro: ${errorRate.toFixed(1)}%`, impact: -errorImpact });

  // Acquirer health
  const lowAcquirers = acquirerStats.filter(a => a.successRate < 90).length;
  const acqImpact = lowAcquirers * 15;
  factors.push({ label: `Adquirentes com problemas: ${lowAcquirers}`, impact: -Math.min(acqImpact, 30) });

  // Average latency impact
  const acqsWithLatency = acquirerStats.filter(a => a.avgLatencyMs > 0);
  const avgLatency = acqsWithLatency.length > 0
    ? acqsWithLatency.reduce((sum, a) => sum + a.avgLatencyMs, 0) / acqsWithLatency.length
    : 0;
  const latencyImpact = avgLatency > 3000 ? 20 : avgLatency > 1500 ? 10 : avgLatency > 500 ? 5 : 0;
  factors.push({ label: `Latência média: ${avgLatency > 0 ? `${Math.round(avgLatency)}ms` : 'N/A'}`, impact: -latencyImpact });

  // No events penalty
  if (totalEvents === 0) {
    factors.push({ label: "Sem eventos recebidos", impact: -10 });
  }

  // If health check is DOWN or fetch failed, score = 0
  const forceZero = (hc.isUp === false && hc.status === null) || hc.status === 'down';
  const score = forceZero
    ? 0
    : Math.round(Math.max(0, Math.min(100, 100 + factors.reduce((sum, f) => sum + f.impact, 0))));
  const color = getHealthColor(score);
  const label = getHealthLabel(score);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="border rounded-lg p-4 bg-card cursor-default">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Saúde do Sistema</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold font-mono" style={{ color }}>{score}</span>
                <span className="text-[10px] text-muted-foreground">/100</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color, backgroundColor: `${color}20` }}>{label}</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="text-xs font-medium mb-2">Fatores:</p>
            {factors.map((f, i) => (
              <div key={i} className="flex items-center justify-between gap-4 text-[11px]">
                <span className="text-muted-foreground">{f.label}</span>
                <span className={f.impact < 0 ? "text-destructive" : "text-primary"}>{f.impact}</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
