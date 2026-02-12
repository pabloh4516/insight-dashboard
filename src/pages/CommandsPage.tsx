import { Terminal } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { commands, CommandEntry } from "@/data/mockData";

const columns = [
  { key: 'exit', header: 'Exit', render: (c: CommandEntry) => <span className={`font-display font-bold ${c.exitCode === 0 ? 'text-neon-green' : 'text-neon-red'}`}>{c.exitCode === 0 ? '✅ 0' : `❌ ${c.exitCode}`}</span> },
  { key: 'command', header: 'Command', render: (c: CommandEntry) => <code className="text-neon-cyan font-semibold">php artisan {c.command}</code> },
  { key: 'duration', header: 'Duration', render: (c: CommandEntry) => <span className={c.duration > 10000 ? 'text-neon-red' : 'text-muted-foreground'}>{(c.duration / 1000).toFixed(1)}s</span> },
  { key: 'time', header: 'Time', render: (c: CommandEntry) => <span className="text-muted-foreground">{new Date(c.timestamp).toLocaleTimeString()}</span> },
];

const CommandsPage = () => (
  <div>
    <PageHeader title="Commands" icon={Terminal} count={commands.length} subtitle="Artisan commands" />
    <DataTable
      data={commands}
      columns={columns}
      getKey={c => c.id}
      expandable={(c) => (
        <div className="space-y-2 text-xs">
          {c.arguments.length > 0 && <div><span className="text-muted-foreground">Arguments:</span> <span className="text-neon-green">{c.arguments.join(' ')}</span></div>}
          {Object.keys(c.options).length > 0 && (
            <div><span className="text-muted-foreground">Options:</span><pre className="mt-1 bg-muted/30 p-2 rounded text-[10px] text-neon-cyan overflow-auto">{JSON.stringify(c.options, null, 2)}</pre></div>
          )}
        </div>
      )}
    />
  </div>
);

export default CommandsPage;
