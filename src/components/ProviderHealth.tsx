import { Wifi } from "lucide-react";
import { providerHealthData, ProviderStatus } from "@/data/mockData";

function StatusDot({ status }: { status: ProviderStatus["status"] }) {
  const colors = {
    online: "bg-primary",
    degraded: "bg-warning",
    offline: "bg-error",
  };

  return (
    <span className="relative flex h-2 w-2">
      {status === "online" && (
        <span className={`absolute inline-flex h-full w-full rounded-full ${colors[status]} opacity-40 animate-ping`} />
      )}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${colors[status]}`} />
    </span>
  );
}

function LatencyBar({ latency, status }: { latency: number | null; status: ProviderStatus["status"] }) {
  if (latency === null) {
    return <span className="text-[10px] text-error font-mono">timeout</span>;
  }

  const maxLatency = 1000;
  const pct = Math.min((latency / maxLatency) * 100, 100);
  const color = latency < 300 ? "bg-primary" : latency < 600 ? "bg-warning" : "bg-error";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-16 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground font-mono">{latency}ms</span>
    </div>
  );
}

export function ProviderHealth() {
  return (
    <div className="border rounded-lg bg-card">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Wifi className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] uppercase tracking-widest text-primary font-medium">
          Provedores
        </span>
      </div>
      <div className="divide-y divide-border">
        {providerHealthData.map((provider) => (
          <div
            key={provider.name}
            className={`flex items-center justify-between px-4 py-2.5 ${provider.status === 'offline' ? 'bg-error/5' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <StatusDot status={provider.status} />
              <span className="text-xs font-medium text-foreground">{provider.name}</span>
              <span className="text-[10px] text-muted-foreground capitalize">{provider.status}</span>
            </div>
            <div className="flex items-center gap-4">
              <LatencyBar latency={provider.latency} status={provider.status} />
              <span className="text-[10px] text-muted-foreground font-mono">{provider.uptime}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
