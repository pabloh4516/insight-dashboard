import { CheckCircle2, AlertTriangle, XCircle, WifiOff } from "lucide-react";
import { useGatewayStats } from "@/hooks/useGatewayStats";
import { useHealthCheck } from "@/hooks/useHealthCheck";

function getInactivityPenalty(lastEventAt: string | null): number {
  if (!lastEventAt) return 100;
  const minutes = (Date.now() - new Date(lastEventAt).getTime()) / 60000;
  if (minutes > 1440) return 100;
  if (minutes > 60) return 70;
  if (minutes > 30) return 40;
  if (minutes > 10) return 20;
  return 0;
}

function formatMinutes(lastEventAt: string | null): string {
  if (!lastEventAt) return "mais de 24h";
  const minutes = Math.round((Date.now() - new Date(lastEventAt).getTime()) / 60000);
  if (minutes < 60) return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  const hours = Math.round(minutes / 60);
  return `${hours} hora${hours !== 1 ? 's' : ''}`;
}

export function StatusBanner() {
  const { errorsToday, totalEvents, acquirerStats, lastEventAt } = useGatewayStats("24h");
  const healthCheck = useHealthCheck();

  // Health check failed → immediate critical
  if (healthCheck.isUp === false) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
        <WifiOff className="h-5 w-5 text-destructive shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Gateway OFFLINE {healthCheck.statusCode ? `(HTTP ${healthCheck.statusCode})` : ''}
          </p>
          <p className="text-xs text-muted-foreground">
            Health check falhou. Seu gateway parece estar fora do ar.
          </p>
        </div>
      </div>
    );
  }

  // Inactivity check
  const inactivityPenalty = getInactivityPenalty(lastEventAt);
  if (inactivityPenalty >= 40) {
    const timeStr = formatMinutes(lastEventAt);
    const isCritical = inactivityPenalty >= 70;
    return (
      <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
        isCritical 
          ? 'border-destructive/20 bg-destructive/5'
          : 'border-warning/20 bg-warning/5'
      }`}>
        {isCritical
          ? <XCircle className="h-5 w-5 text-destructive shrink-0" />
          : <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
        }
        <div>
          <p className="text-sm font-medium text-foreground">
            {isCritical ? 'Seu gateway parece estar offline.' : 'Atenção: possível inatividade.'}
          </p>
          <p className="text-xs text-muted-foreground">
            Nenhum evento recebido nos últimos {timeStr}.
          </p>
        </div>
      </div>
    );
  }

  // Normal score calculation
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

  const score = Math.round(Math.max(0, Math.min(100, 100 - errorImpact - acqImpact - latencyImpact - noEventsPenalty - inactivityPenalty)));

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
