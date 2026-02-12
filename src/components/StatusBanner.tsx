import { CheckCircle2, AlertTriangle, XCircle, WifiOff } from "lucide-react";
import { useGatewayStats } from "@/hooks/useGatewayStats";
import { useHealthCheck } from "@/hooks/useHealthCheck";

function inactivityLabel(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} minuto${Math.round(minutes) !== 1 ? 's' : ''}`;
  const hours = Math.round(minutes / 60);
  return `${hours} hora${hours !== 1 ? 's' : ''}`;
}

export function StatusBanner() {
  const { errorsToday, totalEvents, acquirerStats } = useGatewayStats("24h");
  const hc = useHealthCheck();

  // 1. Fetch failed / timeout / HTTP error
  if (hc.isUp === false && hc.status === null) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
        <WifiOff className="h-5 w-5 text-destructive shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Gateway OFFLINE {hc.statusCode ? `(HTTP ${hc.statusCode})` : ''}
          </p>
          <p className="text-xs text-muted-foreground">
            Não foi possível conectar ao health check do gateway.
          </p>
        </div>
      </div>
    );
  }

  // 2. status === "down"
  if (hc.status === 'down') {
    const downComponents: string[] = [];
    if (hc.checks?.database?.status !== 'ok') downComponents.push('Database');
    if (hc.checks?.redis?.status !== 'ok') downComponents.push('Redis');
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
        <XCircle className="h-5 w-5 text-destructive shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Gateway DOWN</p>
          <p className="text-xs text-muted-foreground">
            {downComponents.length > 0
              ? `Componentes com falha: ${downComponents.join(', ')}.`
              : 'O gateway reportou status crítico.'}
          </p>
        </div>
      </div>
    );
  }

  // 3. status === "degraded"
  if (hc.status === 'degraded') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-warning/20 bg-warning/5 px-4 py-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Gateway degradado</p>
          <p className="text-xs text-muted-foreground">
            O gateway está parcialmente funcional. Verifique os detalhes abaixo.
          </p>
        </div>
      </div>
    );
  }

  // 4. Inactivity via health check last_transaction
  const minutesAgo = hc.checks?.lastTransaction?.minutes_ago;
  if (minutesAgo != null && minutesAgo > 30) {
    const isCritical = minutesAgo > 60;
    return (
      <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
        isCritical ? 'border-destructive/20 bg-destructive/5' : 'border-warning/20 bg-warning/5'
      }`}>
        {isCritical
          ? <XCircle className="h-5 w-5 text-destructive shrink-0" />
          : <AlertTriangle className="h-5 w-5 text-warning shrink-0" />}
        <div>
          <p className="text-sm font-medium text-foreground">
            {isCritical ? 'Possível inatividade crítica.' : 'Atenção: possível inatividade.'}
          </p>
          <p className="text-xs text-muted-foreground">
            Última transação há {inactivityLabel(minutesAgo)}.
          </p>
        </div>
      </div>
    );
  }

  // 5. Normal score-based banner
  const errorRate = totalEvents > 0 ? (errorsToday / totalEvents) * 100 : 0;
  const errorImpact = Math.min(errorRate * 3, 30);
  const lowAcquirers = acquirerStats.filter(a => a.successRate < 90).length;
  const acqImpact = Math.min(lowAcquirers * 15, 30);
  const acqsWithLatency = acquirerStats.filter(a => a.avgLatencyMs > 0);
  const avgLatency = acqsWithLatency.length > 0
    ? acqsWithLatency.reduce((sum, a) => sum + a.avgLatencyMs, 0) / acqsWithLatency.length
    : 0;
  const latencyImpact = avgLatency > 3000 ? 20 : avgLatency > 1500 ? 10 : avgLatency > 500 ? 5 : 0;
  const noEventsPenalty = totalEvents === 0 ? 10 : 0;

  const score = Math.round(Math.max(0, Math.min(100, 100 - errorImpact - acqImpact - latencyImpact - noEventsPenalty)));

  if (score >= 80) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Seu sistema está funcionando normalmente.</p>
          <p className="text-xs text-muted-foreground">Nenhuma ação necessária no momento.</p>
        </div>
      </div>
    );
  }

  if (score >= 50) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-warning/20 bg-warning/5 px-4 py-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Alguns problemas detectados.</p>
          <p className="text-xs text-muted-foreground">
            {errorsToday} erro{errorsToday !== 1 ? 's' : ''} nas últimas 24h.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
      <XCircle className="h-5 w-5 text-destructive shrink-0" />
      <div>
        <p className="text-sm font-medium text-foreground">Atenção! Problemas críticos detectados.</p>
        <p className="text-xs text-muted-foreground">
          {errorsToday} erro{errorsToday !== 1 ? 's' : ''} nas últimas 24h.
        </p>
      </div>
    </div>
  );
}
