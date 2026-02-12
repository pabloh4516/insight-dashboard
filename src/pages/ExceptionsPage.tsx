import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { exceptions, ExceptionEntry } from "@/data/mockData";

const columns = [
  { key: 'class', header: 'Tipo do Erro', render: (e: ExceptionEntry) => <span className="text-neon-red font-semibold">{e.class.split('\\').pop()}</span> },
  { key: 'message', header: 'Mensagem', render: (e: ExceptionEntry) => <span className="text-foreground truncate max-w-[300px] block">{e.message}</span> },
  { key: 'file', header: 'Arquivo', render: (e: ExceptionEntry) => <span className="text-muted-foreground">{e.file.split('/').pop()}:{e.line}</span> },
  { key: 'occurrences', header: 'Vezes', render: (e: ExceptionEntry) => <span className={`font-display font-bold ${e.occurrences > 3 ? 'text-neon-red' : 'text-neon-yellow'}`}>{e.occurrences}x</span> },
  { key: 'time', header: 'Horário', render: (e: ExceptionEntry) => <span className="text-muted-foreground">{new Date(e.timestamp).toLocaleTimeString()}</span> },
];

const ExceptionsPage = () => (
  <div>
    <PageHeader title="Erros" icon={AlertTriangle} count={exceptions.length} subtitle="Erros e falhas do sistema" />
    <DataTable
      data={exceptions}
      columns={columns}
      getKey={e => e.id}
      expandable={(e) => (
        <div className="space-y-3 text-xs">
          <div><span className="text-muted-foreground">Tipo completo:</span> <span className="text-neon-red">{e.class}</span></div>
          <div><span className="text-muted-foreground">Arquivo:</span> <span className="text-neon-cyan">{e.file}:{e.line}</span></div>
          <div>
            <span className="text-muted-foreground">Rastreamento:</span>
            <pre className="mt-1 bg-muted/30 p-3 rounded text-[10px] overflow-auto text-neon-yellow leading-relaxed">
              {e.stackTrace.join('\n')}
            </pre>
          </div>
        </div>
      )}
    />
  </div>
);

export default ExceptionsPage;
