import { Briefcase } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { jobs, JobEntry } from "@/data/mockData";

const statusLabel: Record<string, string> = { processed: '✅ Concluído', failed: '❌ Falhou', pending: '⏳ Aguardando' };
const statusColor: Record<string, string> = { processed: 'text-success', failed: 'text-error', pending: 'text-warning' };

const columns = [
  { key: 'status', header: 'Situação', render: (j: JobEntry) => <span className={statusColor[j.status]}>{statusLabel[j.status]}</span> },
  { key: 'name', header: 'Tarefa', render: (j: JobEntry) => <span className="text-info font-semibold">{j.name}</span> },
  { key: 'queue', header: 'Fila', render: (j: JobEntry) => <span className="text-muted-foreground">{j.queue}</span> },
  { key: 'duration', header: 'Duração', render: (j: JobEntry) => <span className={j.duration > 10000 ? 'text-error' : 'text-muted-foreground'}>{j.duration}ms</span> },
  { key: 'attempts', header: 'Tentativas', render: (j: JobEntry) => <span className={j.attempts > 1 ? 'text-warning' : 'text-muted-foreground'}>{j.attempts}</span> },
  { key: 'time', header: 'Horário', render: (j: JobEntry) => <span className="text-muted-foreground">{new Date(j.timestamp).toLocaleTimeString()}</span> },
];

const JobsPage = () => (
  <div>
    <PageHeader title="Tarefas" icon={Briefcase} count={jobs.length} subtitle="Tarefas em fila de processamento" />
    <DataTable
      data={jobs}
      columns={columns}
      getKey={j => j.id}
      expandable={(j) => (
        <div className="space-y-2 text-xs">
          <div><span className="text-muted-foreground">Conexão:</span> <span className="text-info">{j.connection}</span></div>
          {j.exception && <div><span className="text-muted-foreground">Motivo da falha:</span> <pre className="mt-1 bg-muted/30 p-2 rounded text-[10px] text-error overflow-auto">{j.exception}</pre></div>}
        </div>
      )}
    />
  </div>
);

export default JobsPage;
