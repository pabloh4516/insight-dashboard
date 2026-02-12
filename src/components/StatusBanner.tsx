import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useGatewayStats } from "@/hooks/useGatewayStats";

export function StatusBanner() {
  const { errorsToday, totalEvents, acquirerStats } = useGatewayStats("24h");

  // Calculate health score (same logic as SystemHealthBar)
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
            {errorsToday} erro{errorsToday !== 1 ? 's' : ''} nas últimas 24h. Verifique os detalhes abaixo.
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
          {errorsToday} erro{errorsToday !== 1 ? 's' : ''} nas últimas 24h. Verifique os erros abaixo.
        </p>
      </div>
    </div>
  );
}
