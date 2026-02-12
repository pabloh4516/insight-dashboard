import { FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { logs, LogEntry } from "@/data/mockData";
import { useState } from "react";

const levelConfig: Record<string, { icon: string; color: string }> = {
  info: { icon: '🔵', color: 'text-neon-cyan' },
  warning: { icon: '🟡', color: 'text-neon-yellow' },
  error: { icon: '🔴', color: 'text-neon-red' },
  debug: { icon: '⚪', color: 'text-muted-foreground' },
};

const columns = [
  { key: 'level', header: 'Level', render: (l: LogEntry) => <span className={levelConfig[l.level].color}>{levelConfig[l.level].icon} {l.level}</span> },
  { key: 'message', header: 'Message', render: (l: LogEntry) => <span className="text-foreground">{l.message}</span> },
  { key: 'time', header: 'Time', render: (l: LogEntry) => <span className="text-muted-foreground">{new Date(l.timestamp).toLocaleTimeString()}</span> },
];

const LogsPage = () => {
  const [filter, setFilter] = useState<string>('all');
  const filtered = filter === 'all' ? logs : logs.filter(l => l.level === filter);

  return (
    <div>
      <PageHeader title="Logs" icon={FileText} count={logs.length} subtitle="Application logs" />
      <div className="flex gap-2 mb-4">
        {['all', 'info', 'warning', 'error', 'debug'].map(level => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            className={`text-[10px] font-display uppercase tracking-widest px-3 py-1.5 rounded border transition-all ${
              filter === level ? 'border-neon-cyan text-neon-cyan glow-cyan' : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
      <DataTable
        data={filtered}
        columns={columns}
        getKey={l => l.id}
        expandable={(l) => l.context ? (
          <div className="text-xs">
            <span className="text-muted-foreground">Context:</span>
            <pre className="mt-1 bg-muted/30 p-2 rounded text-[10px] text-neon-green overflow-auto">{JSON.stringify(l.context, null, 2)}</pre>
          </div>
        ) : null}
      />
    </div>
  );
};

export default LogsPage;
