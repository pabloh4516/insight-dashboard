import { Clock, Globe, Send, Briefcase, AlertTriangle, FileText, Database, Mail, Zap, HardDrive, Terminal } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { allEntries, AnyEntry } from "@/data/mockData";
import { useState } from "react";

const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
  request: { icon: Globe, color: 'text-neon-cyan', label: 'REQUEST' },
  client_request: { icon: Send, color: 'text-neon-green', label: 'CLIENT REQ' },
  job: { icon: Briefcase, color: 'text-neon-green', label: 'JOB' },
  exception: { icon: AlertTriangle, color: 'text-neon-red', label: 'EXCEPTION' },
  log: { icon: FileText, color: 'text-neon-yellow', label: 'LOG' },
  query: { icon: Database, color: 'text-neon-magenta', label: 'QUERY' },
  mail: { icon: Mail, color: 'text-neon-cyan', label: 'MAIL' },
  event: { icon: Zap, color: 'text-neon-green', label: 'EVENT' },
  cache: { icon: HardDrive, color: 'text-neon-magenta', label: 'CACHE' },
  command: { icon: Terminal, color: 'text-neon-yellow', label: 'COMMAND' },
};

const getSummary = (entry: AnyEntry): string => {
  switch (entry.type) {
    case 'request': return `${entry.method} ${entry.url} → ${entry.statusCode}`;
    case 'client_request': return `${entry.method} ${entry.url} → ${entry.statusCode}`;
    case 'job': return `${entry.name} [${entry.status}]`;
    case 'exception': return entry.message;
    case 'log': return entry.message;
    case 'query': return entry.sql.slice(0, 60) + (entry.sql.length > 60 ? '...' : '');
    case 'mail': return `→ ${entry.to}: ${entry.subject}`;
    case 'event': return entry.name;
    case 'cache': return `${entry.operation.toUpperCase()} ${entry.key}`;
    case 'command': return `artisan ${entry.command}`;
    default: return '';
  }
};

const TimelinePage = () => {
  const [filter, setFilter] = useState<string>('all');
  const types = ['all', ...Object.keys(typeConfig)];
  const filtered = filter === 'all' ? allEntries : allEntries.filter(e => e.type === filter);

  return (
    <div>
      <PageHeader title="Timeline" icon={Clock} subtitle="Chronological view of all entries" />

      {/* Filter */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`text-[9px] font-display uppercase tracking-widest px-2 py-1 rounded border transition-all ${
              filter === t ? 'border-neon-cyan text-neon-cyan glow-cyan' : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'all' ? 'ALL' : typeConfig[t]?.label || t}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-neon-cyan/40 via-neon-cyan/20 to-transparent" />

        <div className="space-y-1">
          {filtered.map((entry, i) => {
            const config = typeConfig[entry.type];
            const Icon = config?.icon || Globe;
            const hasBatch = entry.batchId;

            return (
              <div key={entry.id} className="flex items-start gap-3 pl-2 group">
                {/* Dot */}
                <div className={`relative z-10 mt-1.5 h-3 w-3 rounded-full border-2 shrink-0 ${
                  config?.color === 'text-neon-red' ? 'border-neon-red bg-neon-red/20' :
                  config?.color === 'text-neon-green' ? 'border-neon-green bg-neon-green/20' :
                  config?.color === 'text-neon-magenta' ? 'border-neon-magenta bg-neon-magenta/20' :
                  config?.color === 'text-neon-yellow' ? 'border-neon-yellow bg-neon-yellow/20' :
                  'border-neon-cyan bg-neon-cyan/20'
                }`} />

                {/* Content */}
                <div className="flex-1 pb-2 border-b border-border/30 group-hover:bg-muted/10 rounded px-2 py-1.5 transition-colors">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Icon className={`h-3 w-3 ${config?.color || 'text-foreground'}`} />
                    <span className={`text-[9px] font-display uppercase tracking-widest ${config?.color || 'text-foreground'}`}>
                      {config?.label || entry.type}
                    </span>
                    <span className="text-[9px] text-muted-foreground ml-auto">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                    {hasBatch && (
                      <span className="text-[8px] bg-muted px-1 rounded text-neon-cyan font-display">{entry.batchId}</span>
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
