import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ActivityBar } from '@/components/ActivityBar';
import { LogsFilterPanel } from '@/components/LogsFilterPanel';
import { useSupabaseEvents, DbEvent } from '@/hooks/useSupabaseEvents';
import { useProject } from '@/contexts/ProjectContext';
import { useState, useMemo } from 'react';

interface UnifiedLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  type: string;
  summary: string;
  meta: Record<string, unknown> | null;
}

function eventToLog(e: DbEvent): UnifiedLog {
  const level = e.status === 'error' ? 'error' : e.status === 'warning' ? 'warning' : 'info';
  return {
    id: e.id,
    timestamp: e.created_at,
    level,
    type: e.type,
    summary: e.summary ?? '',
    meta: e.meta as Record<string, unknown> | null,
  };
}

const statusColor: Record<string, string> = {
  info: '',
  debug: '',
  warning: 'bg-warning/5 border-l-2 border-l-warning',
  error: 'bg-error/5 border-l-2 border-l-error',
};

const typeLabels: Record<string, string> = {
  payment: '💰 Pagamento',
  withdrawal: '💸 Saque',
  test: '🧪 Teste',
};

const LogsPage = () => {
  const { selectedProject } = useProject();
  const { events } = useSupabaseEvents({ projectId: selectedProject?.id ?? null });
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Record<string, Set<string>>>({
    level: new Set(),
    type: new Set(),
  });

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allLogs = useMemo(() => events.map(eventToLog), [events]);

  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      if (filters.level.size > 0 && !filters.level.has(log.level)) return false;
      if (filters.type.size > 0 && !filters.type.has(log.type)) return false;
      if (search) {
        const q = search.toLowerCase();
        return log.summary.toLowerCase().includes(q) || log.type.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allLogs, filters, search]);

  const filterSections = useMemo(() => {
    const levelCounts: Record<string, number> = { info: 0, warning: 0, error: 0 };
    const typeCounts: Record<string, number> = {};
    allLogs.forEach(l => {
      levelCounts[l.level] = (levelCounts[l.level] || 0) + 1;
      typeCounts[l.type] = (typeCounts[l.type] || 0) + 1;
    });

    return [
      {
        label: 'Nível', key: 'level',
        options: [
          { value: 'warning', label: 'Warning', count: levelCounts.warning },
          { value: 'error', label: 'Error', count: levelCounts.error },
          { value: 'info', label: 'Info', count: levelCounts.info },
        ],
      },
      {
        label: 'Tipo', key: 'type',
        options: Object.entries(typeCounts).map(([t, c]) => ({ value: t, label: typeLabels[t] || t, count: c })),
      },
    ];
  }, [allLogs]);

  const handleToggleFilter = (sectionKey: string, value: string) => {
    setFilters(prev => {
      const next = { ...prev };
      const set = new Set(prev[sectionKey] || []);
      set.has(value) ? set.delete(value) : set.add(value);
      next[sectionKey] = set;
      return next;
    });
  };

  const handleReset = () => setFilters({ level: new Set(), type: new Set() });

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] -m-6">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card/50">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar logs..."
            className="pl-8 h-8 text-xs bg-background border-border"
          />
        </div>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {filteredLogs.length} registros
        </span>
      </div>

      <div className="px-4 py-2 border-b border-border/50 bg-card/30">
        <ActivityBar entries={allLogs} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="border-r border-border/50 p-3 overflow-y-auto scrollbar-hidden bg-card/20">
          <LogsFilterPanel
            sections={filterSections}
            selected={filters}
            onToggle={handleToggleFilter}
            onReset={handleReset}
          />
        </div>

        <div className="flex-1 overflow-auto scrollbar-hidden">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-card/90 backdrop-blur-sm z-10">
              <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                <th className="text-left px-3 py-2 w-6" />
                <th className="text-left px-3 py-2 w-32">Horário</th>
                <th className="text-left px-2 py-2 w-24">Tipo</th>
                <th className="text-left px-2 py-2 w-20">Nível</th>
                <th className="text-left px-2 py-2">Resumo</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const isExpanded = expanded.has(log.id);
                return (
                  <tbody key={log.id}>
                    <tr
                      onClick={() => toggleExpand(log.id)}
                      className={`border-b border-border/20 hover:bg-muted/20 transition-colors cursor-pointer ${statusColor[log.level] || ''}`}
                    >
                      <td className="px-3 py-1.5">
                        {isExpanded ? <ChevronDown className="h-3 w-3 text-primary" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                      </td>
                      <td className="px-3 py-1.5 text-muted-foreground tabular-nums whitespace-nowrap">
                        {formatTime(log.timestamp)}
                      </td>
                      <td className="px-2 py-1.5 font-semibold text-foreground">
                        {typeLabels[log.type] || log.type}
                      </td>
                      <td className={`px-2 py-1.5 font-semibold ${log.level === 'error' ? 'text-error' : log.level === 'warning' ? 'text-warning' : 'text-success'}`}>
                        {log.level.toUpperCase()}
                      </td>
                      <td className="px-2 py-1.5 text-foreground truncate">
                        {log.summary}
                      </td>
                    </tr>
                    {isExpanded && log.meta && (
                      <tr className="bg-muted/5 border-b border-border/20">
                        <td colSpan={5} className="px-4 py-4">
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium block mb-1">Metadados</span>
                          <pre className="text-[10px] bg-background/50 border border-border/50 rounded p-2 text-success overflow-auto max-h-40 font-mono">
                            {JSON.stringify(log.meta, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-xs">
              Nenhum log encontrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
