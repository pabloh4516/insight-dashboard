import { Globe } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { requests, RequestEntry } from "@/data/mockData";

const statusColor = (code: number) => {
  if (code < 300) return "text-neon-green";
  if (code < 500) return "text-neon-yellow";
  return "text-neon-red";
};

const methodColor = (m: string) => {
  const map: Record<string, string> = { GET: 'text-neon-cyan', POST: 'text-neon-green', PUT: 'text-neon-yellow', DELETE: 'text-neon-red', PATCH: 'text-neon-magenta' };
  return map[m] || 'text-foreground';
};

const columns = [
  { key: 'method', header: 'Método', render: (r: RequestEntry) => <span className={`font-bold text-[11px] ${methodColor(r.method)}`}>{r.method}</span> },
  { key: 'url', header: 'Endereço', render: (r: RequestEntry) => <span className="text-foreground">{r.url}</span> },
  { key: 'status', header: 'Status', render: (r: RequestEntry) => <span className={`font-display font-bold ${statusColor(r.statusCode)}`}>{r.statusCode}</span> },
  { key: 'duration', header: 'Tempo', render: (r: RequestEntry) => <span className={r.duration > 1000 ? 'text-neon-red' : 'text-muted-foreground'}>{r.duration}ms</span> },
  { key: 'time', header: 'Horário', render: (r: RequestEntry) => <span className="text-muted-foreground">{new Date(r.timestamp).toLocaleTimeString()}</span> },
];

const RequestsPage = () => (
  <div>
    <PageHeader title="Requisições" icon={Globe} count={requests.length} subtitle="Todas as requisições recebidas pelo sistema" />
    <DataTable
      data={requests}
      columns={columns}
      getKey={r => r.id}
      expandable={(r) => (
        <div className="space-y-3 text-xs">
          <div><span className="text-muted-foreground">IP de origem:</span> <span className="text-neon-cyan">{r.ip}</span></div>
          {r.headers && <div><span className="text-muted-foreground">Cabeçalhos:</span><pre className="mt-1 bg-muted/30 p-2 rounded text-[10px] overflow-auto">{JSON.stringify(r.headers, null, 2)}</pre></div>}
          {r.payload && <div><span className="text-muted-foreground">Dados enviados:</span><pre className="mt-1 bg-muted/30 p-2 rounded text-[10px] overflow-auto text-neon-green">{JSON.stringify(r.payload, null, 2)}</pre></div>}
          {r.response && <div><span className="text-muted-foreground">Resposta:</span><pre className="mt-1 bg-muted/30 p-2 rounded text-[10px] overflow-auto text-neon-cyan">{JSON.stringify(r.response, null, 2)}</pre></div>}
        </div>
      )}
    />
  </div>
);

export default RequestsPage;
