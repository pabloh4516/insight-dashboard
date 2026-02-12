import { Database } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { queries, QueryEntry } from "@/data/mockData";

const columns = [
  { key: 'slow', header: '', render: (q: QueryEntry) => q.slow ? <span className="text-neon-red">🐢</span> : <span className="text-neon-green">⚡</span>, className: 'w-8' },
  { key: 'sql', header: 'Consulta', render: (q: QueryEntry) => <code className={`text-[11px] ${q.slow ? 'text-neon-red' : 'text-neon-cyan'}`}>{q.sql.length > 80 ? q.sql.slice(0, 80) + '...' : q.sql}</code> },
  { key: 'duration', header: 'Duração', render: (q: QueryEntry) => <span className={`font-display font-bold ${q.slow ? 'text-neon-red' : 'text-neon-green'}`}>{q.duration}ms</span> },
  { key: 'connection', header: 'Conexão', render: (q: QueryEntry) => <span className="text-muted-foreground">{q.connection}</span> },
  { key: 'time', header: 'Horário', render: (q: QueryEntry) => <span className="text-muted-foreground">{new Date(q.timestamp).toLocaleTimeString()}</span> },
];

const QueriesPage = () => (
  <div>
    <PageHeader title="Consultas ao Banco" icon={Database} count={queries.length} subtitle={`${queries.filter(q => q.slow).length} consultas lentas detectadas`} />
    <DataTable
      data={queries}
      columns={columns}
      getKey={q => q.id}
      expandable={(q) => (
        <div className="text-xs">
          <span className="text-muted-foreground">Consulta completa:</span>
          <pre className={`mt-1 bg-muted/30 p-3 rounded text-[11px] overflow-auto ${q.slow ? 'text-neon-red' : 'text-neon-cyan'}`}>{q.sql}</pre>
        </div>
      )}
    />
  </div>
);

export default QueriesPage;
