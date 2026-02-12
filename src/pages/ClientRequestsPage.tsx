import { Send } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { clientRequests, ClientRequestEntry } from "@/data/mockData";

const providerColors: Record<string, string> = {
  BSPAY: 'text-neon-cyan',
  SuitPay: 'text-neon-green',
  EzzeBank: 'text-neon-magenta',
  Postback: 'text-neon-yellow',
};

const columns = [
  { key: 'provider', header: 'Provider', render: (r: ClientRequestEntry) => <span className={`font-display font-bold text-[11px] ${providerColors[r.provider] || 'text-foreground'}`}>{r.provider}</span> },
  { key: 'method', header: 'Method', render: (r: ClientRequestEntry) => <span className="font-bold text-neon-green">{r.method}</span> },
  { key: 'url', header: 'URL', render: (r: ClientRequestEntry) => <span className="text-foreground truncate max-w-[300px] block">{r.url}</span> },
  { key: 'status', header: 'Status', render: (r: ClientRequestEntry) => <span className={`font-display font-bold ${r.statusCode < 300 ? 'text-neon-green' : 'text-neon-red'}`}>{r.statusCode}</span> },
  { key: 'duration', header: 'Duration', render: (r: ClientRequestEntry) => <span className={r.duration > 5000 ? 'text-neon-red' : 'text-muted-foreground'}>{r.duration}ms</span> },
  { key: 'time', header: 'Time', render: (r: ClientRequestEntry) => <span className="text-muted-foreground">{new Date(r.timestamp).toLocaleTimeString()}</span> },
];

const ClientRequestsPage = () => (
  <div>
    <PageHeader title="Client Requests" icon={Send} count={clientRequests.length} subtitle="Outgoing HTTP calls to external services" />
    <DataTable
      data={clientRequests}
      columns={columns}
      getKey={r => r.id}
      expandable={(r) => (
        <div className="space-y-3 text-xs">
          {r.payload && <div><span className="text-muted-foreground">Payload:</span><pre className="mt-1 bg-muted/30 p-2 rounded text-[10px] text-neon-green overflow-auto">{JSON.stringify(r.payload, null, 2)}</pre></div>}
          {r.response && <div><span className="text-muted-foreground">Response:</span><pre className="mt-1 bg-muted/30 p-2 rounded text-[10px] text-neon-cyan overflow-auto">{JSON.stringify(r.response, null, 2)}</pre></div>}
        </div>
      )}
    />
  </div>
);

export default ClientRequestsPage;
