import { Clock, Globe, Send, Briefcase, AlertTriangle, FileText, Database, Mail, Zap, HardDrive, Terminal } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { allEntries, AnyEntry } from "@/data/mockData";
import { useState } from "react";

const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
  request: { icon: Globe, color: 'text-info', label: 'REQUISIÇÃO' },
  client_request: { icon: Send, color: 'text-success', label: 'CHAMADA EXT.' },
  job: { icon: Briefcase, color: 'text-success', label: 'TAREFA' },
  exception: { icon: AlertTriangle, color: 'text-error', label: 'ERRO' },
  log: { icon: FileText, color: 'text-warning', label: 'REGISTRO' },
  query: { icon: Database, color: 'text-purple-400', label: 'CONSULTA' },
  mail: { icon: Mail, color: 'text-info', label: 'E-MAIL' },
  event: { icon: Zap, color: 'text-success', label: 'EVENTO' },
  cache: { icon: HardDrive, color: 'text-purple-400', label: 'CACHE' },
  command: { icon: Terminal, color: 'text-warning', label: 'COMANDO' },
};

const getSummary = (entry: AnyEntry): string => {
  switch (entry.type) {
    case 'request': return `${entry.method} ${entry.url} → ${entry.statusCode}`;
    case 'client_request': return `${entry.method} ${entry.url} → ${entry.statusCode}`;
    case 'job': return `${entry.name} [${entry.status === 'processed' ? 'Concluído' : entry.status === 'failed' ? 'Falhou' : 'Aguardando'}]`;
    case 'exception': return entry.message;
    case 'log': return entry.message;
    case 'query': return entry.sql.slice(0, 60) + (entry.sql.length > 60 ? '...' : '');
    case 'mail': return `→ ${entry.to}: ${entry.subject}`;
    case 'event': return entry.name;
    case 'cache': return `${entry.operation === 'hit' ? 'Encontrado' : entry.operation === 'miss' ? 'Não encontrado' : entry.operation === 'set' ? 'Salvo' : 'Removido'} ${entry.key}`;
    case 'command': return `artisan ${entry.command}`;
    default: return '';
  }
};

const TimelinePage = () => {
  const [filter, setFilter] = useState<string>('all');
  const types = ['all', ...Object.keys(typeConfig)];
  const filtered = filter === 'all' ? allEntries : allEntries.filter(e => e.type === filter);

  const filterLabels: Record<string, string> = { all: 'TODOS', ...Object.fromEntries(Object.entries(typeConfig).map(([k, v]) => [k, v.label])) };

  return (
    <div>
      <PageHeader title="Linha do Tempo" icon={Clock} subtitle="Visão cronológica de todas as atividades" />

      <div className="flex flex-wrap gap-1.5 mb-5">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`text-[9px] uppercase tracking-widest px-2 py-1 rounded border transition-all font-medium ${
              filter === t ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {filterLabels[t]}
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-border via-border/50 to-transparent" />

        <div className="space-y-1">
          {filtered.map((entry) => {
            const config = typeConfig[entry.type];
            const Icon = config?.icon || Globe;
            const hasBatch = entry.batchId;

            const dotColor =
              config?.color === 'text-error' ? 'border-error bg-error/20' :
              config?.color === 'text-success' ? 'border-success bg-success/20' :
              config?.color === 'text-purple-400' ? 'border-purple-400 bg-purple-400/20' :
              config?.color === 'text-warning' ? 'border-warning bg-warning/20' :
              'border-info bg-info/20';

            return (
              <div key={entry.id} className="flex items-start gap-3 pl-2 group">
                <div className={`relative z-10 mt-1.5 h-3 w-3 rounded-full border-2 shrink-0 ${dotColor}`} />

                <div className="flex-1 pb-2 border-b border-border/30 group-hover:bg-muted/10 rounded px-2 py-1.5 transition-colors">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Icon className={`h-3 w-3 ${config?.color || 'text-foreground'}`} />
                    <span className={`text-[9px] uppercase tracking-widest font-medium ${config?.color || 'text-foreground'}`}>
                      {config?.label || entry.type}
                    </span>
                    <span className="text-[9px] text-muted-foreground ml-auto">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                    {hasBatch && (
                      <span className="text-[8px] bg-muted px-1 rounded text-info">{entry.batchId}</span>
                    )}
                  </div>
                  <p className="text-xs text-foreground/80">{getSummary(entry)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;
