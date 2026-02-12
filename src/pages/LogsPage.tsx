import { FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { logs, LogEntry } from "@/data/mockData";
import { useState } from "react";

const levelConfig: Record<string, { icon: string; color: string; label: string }> = {
  info: { icon: '🔵', color: 'text-neon-cyan', label: 'informação' },
  warning: { icon: '🟡', color: 'text-neon-yellow', label: 'alerta' },
  error: { icon: '🔴', color: 'text-neon-red', label: 'erro' },
  debug: { icon: '⚪', color: 'text-muted-foreground', label: 'depuração' },
};

const filterLabels: Record<string, string> = {
  all: 'Todos',
  info: 'Informação',
  warning: 'Alertas',
  error: 'Erros',
  debug: 'Depuração',
};

const columns = [
  { key: 'level', header: 'Nível', render: (l: LogEntry) => <span className={levelConfig[l.level].color}>{levelConfig[l.level].icon} {levelConfig[l.level].label}</span> },
  { key: 'message', header: 'Mensagem', render: (l: LogEntry) => <span className="text-foreground">{l.message}</span> },
  { key: 'time', header: 'Horário', render: (l: LogEntry) => <span className="text-muted-foreground">{new Date(l.timestamp).toLocaleTimeString()}</span> },
];

const LogsPage = () => {
  const [filter, setFilter] = useState<string>('all');
  const filtered = filter === 'all' ? logs : logs.filter(l => l.level === filter);

  return (
    <div>
      <PageHeader title="Registros" icon={FileText} count={logs.length} subtitle="Registros de atividade do sistema" />
      <div className="flex gap-2 mb-4">
        {Object.entries(filterLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-[10px] font-display uppercase tracking-widest px-3 py-1.5 rounded border transition-all ${
              filter === key ? 'border-neon-cyan text-neon-cyan glow-cyan' : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <DataTable
        data={filtered}
        columns={columns}
        getKey={l => l.id}
        expandable={(l) => l.context ? (
          <div className="text-xs">
            <span className="text-muted-foreground">Detalhes:</span>
            <pre className="mt-1 bg-muted/30 p-2 rounded text-[10px] text-neon-green overflow-auto">{JSON.stringify(l.context, null, 2)}</pre>
          </div>
        ) : null}
      />
    </div>
  );
};

export default LogsPage;
