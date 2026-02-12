import { Send } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { clientRequests, ClientRequestEntry } from "@/data/mockData";

const providerColors: Record<string, string> = {
  BSPAY: 'text-info',
  SuitPay: 'text-success',
  EzzeBank: 'text-purple-400',
  Postback: 'text-warning',
};

const columns = [
  { key: 'provider', header: 'Provedor', render: (r: ClientRequestEntry) => <span className={`font-semibold text-[11px] ${providerColors[r.provider] || 'text-foreground'}`}>{r.provider}</span> },
  { key: 'method', header: 'Método', render: (r: ClientRequestEntry) => <span className="font-bold text-success">{r.method}</span> },
  { key: 'url', header: 'Endereço', render: (r: ClientRequestEntry) => <span className="text-foreground truncate max-w-[300px] block">{r.url}</span> },
  { key: 'status', header: 'Status', render: (r: ClientRequestEntry) => <span className={`font-semibold ${r.statusCode < 300 ? 'text-success' : 'text-error'}`}>{r.statusCode}</span> },
  { key: 'duration', header: 'Tempo', render: (r: ClientRequestEntry) => <span className={r.duration > 5000 ? 'text-error' : 'text-muted-foreground'}>{r.duration}ms</span> },
  { key: 'time', header: 'Horário', render: (r: ClientRequestEntry) => <span className="text-muted-foreground">{new Date(r.timestamp).toLocaleTimeString()}</span> },
];

const ClientRequestsPage = () => (
  <div>
    <PageHeader title="Chamadas Externas" icon={Send} count={clientRequests.length} subtitle="Chamadas feitas para serviços externos (adquirentes, postbacks)" />
    <DataTable
      data={clientRequests}
      columns={columns}
      getKey={r => r.id}
      expandable={(r) => (
        <div className="space-y-3 text-xs">
          {r.payload && <div><span className="text-muted-foreground">Dados enviados:</span><pre className="mt-1 bg-muted/30 p-2 rounded text-[10px] text-success overflow-auto">{JSON.stringify(r.payload, null, 2)}</pre></div>}
          {r.response && <div><span className="text-muted-foreground">Resposta:</span><pre className="mt-1 bg-muted/30 p-2 rounded text-[10px] text-info overflow-auto">{JSON.stringify(r.response, null, 2)}</pre></div>}
        </div>
      )}
    />
  </div>
);

export default ClientRequestsPage;
