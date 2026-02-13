import { Activity, RefreshCw } from "lucide-react";
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
  const hc = useHealthCheck();

  const factors: { label: string; impact: number }[] = [];

  // Force zero conditions
  const forceZero = (hc.isUp === false && hc.status === null) || hc.status === 'down';

  if (hc.isUp === false && hc.status === null) {
    factors.push({ label: `Health check FALHOU${hc.statusCode ? ` (HTTP ${hc.statusCode})` : ''}`, impact: -100 });
  } else if (hc.status === 'down') {
    factors.push({ label: "Status: DOWN", impact: -100 });
  } else if (hc.status === 'degraded') {
    factors.push({ label: "Status: degradado", impact: -30 });
  } else if (hc.status === 'operational') {
    factors.push({ label: "Health check: OK", impact: 0 });
  }

  // Component-level penalties
  if (hc.checks?.database) {
    const s = hc.checks.database.status;
    if (s === 'error') factors.push({ label: `Database: erro (${hc.checks.database.latency_ms}ms)`, impact: -40 });
    else if (s === 'slow') factors.push({ label: `Database: lento (${hc.checks.database.latency_ms}ms)`, impact: -10 });
    else factors.push({ label: `Database: ok (${hc.checks.database.latency_ms}ms, ${hc.checks.database.connections.active}/${hc.checks.database.connections.max} conn)`, impact: 0 });
  }

  if (hc.checks?.redis) {
    const s = hc.checks.redis.status;
    if (s === 'error') factors.push({ label: `Redis: erro (${hc.checks.redis.latency_ms}ms)`, impact: -30 });
    else if (s === 'slow') factors.push({ label: `Redis: lento (${hc.checks.redis.latency_ms}ms)`, impact: -5 });
    else factors.push({ label: `Redis: ok (${hc.checks.redis.latency_ms}ms)`, impact: 0 });
  }

  if (hc.checks?.queue) {
    const s = hc.checks.queue.status;
    if (s === 'critical') factors.push({ label: `Fila: crítica (${hc.checks.queue.failed_jobs} falhados)`, impact: -25 });
    else if (s === 'warning') factors.push({ label: `Fila: atenção (${hc.checks.queue.failed_jobs} falhados)`, impact: -10 });
    else factors.push({ label: `Fila: ok (${hc.checks.queue.pending_jobs} pendentes)`, impact: 0 });
  }

  if (hc.checks?.storage) {
    if (hc.checks.storage.status === 'error') factors.push({ label: "Storage: erro", impact: -20 });
    else factors.push({ label: "Storage: ok", impact: 0 });
  }

  // Acquirers
  const acquirers = hc.checks?.acquirers ?? [];
  const critAcq = acquirers.filter(a => a.status === 'critical').length;
  const warnAcq = acquirers.filter(a => a.status === 'warning').length;
  if (critAcq > 0) factors.push({ label: `${critAcq} adquirente(s) crítico(s)`, impact: -(critAcq * 15) });
  if (warnAcq > 0) factors.push({ label: `${warnAcq} adquirente(s) com atenção`, impact: -(warnAcq * 5) });

  // Inactivity
  const minutesAgo = hc.checks?.lastTransaction?.minutes_ago;
  if (minutesAgo != null) {
    let inactivityImpact = 0;
    if (minutesAgo > 1440) inactivityImpact = -100;
    else if (minutesAgo > 60) inactivityImpact = -40;
    else if (minutesAgo > 30) inactivityImpact = -20;
    else if (minutesAgo > 10) inactivityImpact = -10;
    factors.push({ label: `Última transação: ${Math.round(minutesAgo)}min atrás`, impact: inactivityImpact });
  }

  const score = forceZero
    ? 0
    : Math.round(Math.max(0, Math.min(100, 100 + factors.reduce((sum, f) => sum + f.impact, 0))));
  const color = getHealthColor(score);
  const label = getHealthLabel(score);
  const ecgDuration = score >= 80 ? '1.5s' : score >= 50 ? '1s' : '0.6s';

  const ecgPath = "M0,12 L8,12 L10,12 L12,4 L14,20 L16,8 L18,14 L20,12 L28,12 L36,12 L38,12 L40,4 L42,20 L44,8 L46,14 L48,12 L56,12";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="border rounded-lg p-4 bg-card cursor-default">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <div className="w-16 h-5 overflow-hidden rounded" style={{ opacity: 0.7 }}>
                  <svg
                    viewBox="0 0 56 24"
                    className="h-full"
                    style={{
                      width: '200%',
                      animation: `ecg-sweep ${ecgDuration} linear infinite`,
                    }}
                    preserveAspectRatio="none"
                  >
                    <path
                      d={ecgPath}
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Saúde do Sistema</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); hc.recheckNow(); }}
                  className="p-1 rounded hover:bg-accent transition-colors"
                  title="Verificar agora"
                >
                  <RefreshCw className="h-3 w-3 text-muted-foreground" />
                </button>
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
        <TooltipContent side="bottom" className="max-w-xs z-50">
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
