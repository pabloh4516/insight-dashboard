import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { exceptions, ExceptionEntry } from "@/data/mockData";

const columns = [
  { key: 'class', header: 'Exception', render: (e: ExceptionEntry) => <span className="text-neon-red font-semibold">{e.class.split('\\').pop()}</span> },
  { key: 'message', header: 'Message', render: (e: ExceptionEntry) => <span className="text-foreground truncate max-w-[300px] block">{e.message}</span> },
  { key: 'file', header: 'File', render: (e: ExceptionEntry) => <span className="text-muted-foreground">{e.file.split('/').pop()}:{e.line}</span> },
  { key: 'occurrences', header: 'Count', render: (e: ExceptionEntry) => <span className={`font-display font-bold ${e.occurrences > 3 ? 'text-neon-red' : 'text-neon-yellow'}`}>{e.occurrences}x</span> },
  { key: 'time', header: 'Time', render: (e: ExceptionEntry) => <span className="text-muted-foreground">{new Date(e.timestamp).toLocaleTimeString()}</span> },
];

const ExceptionsPage = () => (
  <div>
    <PageHeader title="Exceptions" icon={AlertTriangle} count={exceptions.length} subtitle="Application errors" />
    <DataTable
      data={exceptions}
      columns={columns}
      getKey={e => e.id}
      expandable={(e) => (
        <div className="space-y-3 text-xs">
          <div><span className="text-muted-foreground">Full class:</span> <span className="text-neon-red">{e.class}</span></div>
          <div><span className="text-muted-foreground">File:</span> <span className="text-neon-cyan">{e.file}:{e.line}</span></div>
          <div>
            <span className="text-muted-foreground">Stack Trace:</span>
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
