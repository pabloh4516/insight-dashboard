import { Database, Server, HardDrive, Layers, Archive, Cpu } from "lucide-react";
import { useHealthCheck } from "@/hooks/useHealthCheck";

function statusColor(status: string): string {
  if (status === 'ok') return 'hsl(var(--color-success))';
  if (status === 'slow' || status === 'warning') return 'hsl(var(--color-warning))';
  return 'hsl(var(--color-error))';
}

function StatusDot({ status }: { status: string }) {
  const color = statusColor(status);
  return <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />;
}

export function ComponentHealthPanel() {
  const { checks } = useHealthCheck();
  if (!checks) return null;

  const components = [
    {
      icon: Cpu,
      name: 'PHP',
      status: checks.php?.status ?? 'ok',
      detail: checks.php ? `v${checks.php.version} · ${checks.php.memory_usage_mb}MB / ${checks.php.memory_limit}` : null,
    },
    {
      icon: Database,
      name: 'Database',
      status: checks.database?.status ?? 'unknown',
      detail: checks.database ? `${checks.database.latency_ms}ms · ${checks.database.connections.active}/${checks.database.connections.max} conn` : null,
    },
    {
      icon: Server,
      name: 'Redis',
      status: checks.redis?.status ?? 'unknown',
      detail: checks.redis ? `${checks.redis.latency_ms}ms` : null,
    },
    {
      icon: Layers,
      name: 'Fila de Jobs',
      status: checks.queue?.status ?? 'unknown',
      detail: checks.queue ? `${checks.queue.pending_jobs} pendentes · ${checks.queue.failed_jobs} falhados` : null,
    },
    {
      icon: Archive,
      name: 'Storage',
      status: checks.storage?.status ?? 'unknown',
      detail: checks.storage ? (checks.storage.writable ? 'Gravável' : 'Somente leitura') : null,
    },
    {
      icon: HardDrive,
      name: 'Adquirentes',
      status: checks.acquirers.some(a => a.status === 'critical') ? 'critical' : checks.acquirers.some(a => a.status === 'warning') ? 'warning' : 'ok',
      detail: `${checks.acquirers.length} ativo${checks.acquirers.length !== 1 ? 's' : ''}`,
    },
  ];

  return (
    <div className="border rounded-lg p-4 bg-card">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Componentes</span>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
        {components.map(c => (
          <div key={c.name} className="flex items-start gap-2.5 p-2.5 rounded-md bg-secondary/30">
            <c.icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <StatusDot status={c.status} />
                <span className="text-xs font-medium text-foreground">{c.name}</span>
              </div>
              {c.detail && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{c.detail}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
