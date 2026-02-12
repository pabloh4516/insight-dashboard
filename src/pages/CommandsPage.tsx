import { Terminal } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { commands, CommandEntry } from "@/data/mockData";

const columns = [
  { key: 'exit', header: 'Resultado', render: (c: CommandEntry) => <span className={`font-display font-bold ${c.exitCode === 0 ? 'text-neon-green' : 'text-neon-red'}`}>{c.exitCode === 0 ? '✅ Sucesso' : '❌ Falha'}</span> },
  { key: 'command', header: 'Comando', render: (c: CommandEntry) => <code className="text-neon-cyan font-semibold">artisan {c.command}</code> },
  { key: 'duration', header: 'Duração', render: (c: CommandEntry) => <span className={c.duration > 10000 ? 'text-neon-red' : 'text-muted-foreground'}>{(c.duration / 1000).toFixed(1)}s</span> },
  { key: 'time', header: 'Horário', render: (c: CommandEntry) => <span className="text-muted-foreground">{new Date(c.timestamp).toLocaleTimeString()}</span> },
];

const CommandsPage = () => (
  <div>
    <PageHeader title="Comandos" icon={Terminal} count={commands.length} subtitle="Comandos executados no servidor" />
    <DataTable
      data={commands}
      columns={columns}
      getKey={c => c.id}
      expandable={(c) => (
        <div className="space-y-2 text-xs">
          {c.arguments.length > 0 && <div><span className="text-muted-foreground">Parâmetros:</span> <span className="text-neon-green">{c.arguments.join(' ')}</span></div>}
          {Object.keys(c.options).length > 0 && (
            <div><span className="text-muted-foreground">Opções:</span><pre className="mt-1 bg-muted/30 p-2 rounded text-[10px] text-neon-cyan overflow-auto">{JSON.stringify(c.options, null, 2)}</pre></div>
          )}
        </div>
      )}
    />
  </div>
);

export default CommandsPage;
