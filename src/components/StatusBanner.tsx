import { CheckCircle2, AlertTriangle, XCircle, WifiOff } from "lucide-react";
import { useHealthCheck } from "@/hooks/useHealthCheck";

function inactivityLabel(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} minuto${Math.round(minutes) !== 1 ? 's' : ''}`;
  const hours = Math.round(minutes / 60);
  return `${hours} hora${hours !== 1 ? 's' : ''}`;
}

function listProblems(checks: NonNullable<ReturnType<typeof useHealthCheck>['checks']>): string[] {
  const problems: string[] = [];
  if (checks.database?.status === 'error') problems.push('Database');
  if (checks.database?.status === 'slow') problems.push('Database (lento)');
  if (checks.redis?.status === 'error') problems.push('Redis');
  if (checks.redis?.status === 'slow') problems.push('Redis (lento)');
  if (checks.queue?.status === 'critical' || checks.queue?.status === 'error') problems.push('Fila de Jobs');
  if (checks.storage?.status === 'error') problems.push('Storage');
  const critAcq = checks.acquirers.filter(a => a.status === 'critical');
  critAcq.forEach(a => problems.push(a.name));
  return problems;
}

export function StatusBanner() {
  const hc = useHealthCheck();

  // 1. Fetch failed
  if (hc.isUp === false && hc.status === null) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
        <WifiOff className="h-5 w-5 text-destructive shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Gateway OFFLINE {hc.statusCode ? `(HTTP ${hc.statusCode})` : ''}
          </p>
          <p className="text-xs text-muted-foreground">
            Não foi possível conectar ao gateway. Verifique a conectividade.
          </p>
        </div>
      </div>
    );
  }

  // 2. status === "down"
  if (hc.status === 'down') {
    const problems = hc.checks ? listProblems(hc.checks) : [];
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
        <XCircle className="h-5 w-5 text-destructive shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Gateway com falha crítica</p>
          <p className="text-xs text-muted-foreground">
            {problems.length > 0
              ? `Componentes com falha: ${problems.join(', ')}.`
              : 'O gateway reportou status crítico.'}
          </p>
        </div>
      </div>
    );
  }

  // 3. status === "degraded"
  if (hc.status === 'degraded') {
    const problems = hc.checks ? listProblems(hc.checks) : [];
    return (
      <div className="flex items-center gap-3 rounded-lg border border-warning/20 bg-warning/5 px-4 py-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Gateway degradado</p>
          <p className="text-xs text-muted-foreground">
            {problems.length > 0
              ? `Componentes com problema: ${problems.join(', ')}.`
              : 'O gateway está parcialmente funcional.'}
          </p>
        </div>
      </div>
    );
  }

  // 4. Inactivity
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
            Nenhuma transação nos últimos {inactivityLabel(minutesAgo)}
          </p>
          <p className="text-xs text-muted-foreground">
            Verifique se o gateway está processando pagamentos.
          </p>
        </div>
      </div>
    );
  }

  // 5. All OK
  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
      <div>
        <p className="text-sm font-medium text-foreground">Sistema operacional</p>
        <p className="text-xs text-muted-foreground">Todos os componentes funcionando normalmente.</p>
      </div>
    </div>
  );
}
