import { Search, Pause, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActivityBar } from '@/components/ActivityBar';
import { LogsFilterPanel } from '@/components/LogsFilterPanel';
import { useRealtime } from '@/contexts/RealtimeContext';
import { logs as staticLogs, requests as staticRequests, exceptions as staticExceptions } from '@/data/mockData';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';

interface UnifiedLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  method?: string;
  statusCode?: number;
  host: string;
  route: string;
  message: string;
  context?: Record<string, any>;
  stackTrace?: string[];
  duration?: number;
}

const hosts = ['pay.checkout.store', 'api.gateway.com', 'webhook.bspay.io', 'pix.suitpay.com', 'admin.painel.dev'];

function toUnifiedLog(entry: any): UnifiedLog {
  if (entry.type === 'request') {
    const level = entry.statusCode >= 500 ? 'error' : entry.statusCode >= 400 ? 'warning' : 'info';
    return {
      id: entry.id, timestamp: entry.timestamp, level,
      method: entry.method, statusCode: entry.statusCode, duration: entry.duration,
      host: hosts[Math.abs(entry.id.charCodeAt(4)) % hosts.length],
      route: entry.url,
      message: `${entry.method} ${entry.url} — ${entry.duration}ms`,
      context: { payload: entry.payload, response: entry.response },
    };
  }
  if (entry.type === 'exception') {
    return {
      id: entry.id, timestamp: entry.timestamp, level: 'error',
      host: hosts[Math.abs(entry.id.charCodeAt(4)) % hosts.length],
      route: entry.file,
      message: `${entry.class}: ${entry.message}`,
      context: { class: entry.class, line: entry.line, occurrences: entry.occurrences },
      stackTrace: entry.stackTrace,
    };
  }
  return {
    id: entry.id, timestamp: entry.timestamp, level: entry.level ?? 'info',
    host: entry.host ?? hosts[Math.abs(entry.id.charCodeAt(4)) % hosts.length],
    route: entry.route ?? '-',
    message: entry.message,
    context: entry.context,
  };
}

const statusColor: Record<string, string> = {
  info: '',
  debug: '',
  warning: 'bg-warning/5 border-l-2 border-l-warning',
  error: 'bg-error/5 border-l-2 border-l-error',
};

function getStatusClass(code?: number) {
  if (!code) return '';
  if (code >= 500) return 'text-error';
  if (code >= 400) return 'text-warning';
  if (code >= 300) return 'text-info';
  return 'text-success';
}

const LogsPage = () => {
  const { liveEntries, isLive, toggleLive } = useRealtime();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Record<string, Set<string>>>({
    level: new Set(),
    host: new Set(),
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [localLive, setLocalLive] = useState(false);

  const effectiveLive = isLive || localLive;

  const toggleLocalLive = useCallback(() => {
    if (!isLive && !localLive) {
      toggleLive();
    }
    setLocalLive(prev => !prev);
  }, [isLive, localLive, toggleLive]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allLogs = useMemo(() => {
    const staticUnified = [
      ...staticLogs.map(toUnifiedLog),
      ...staticRequests.map(toUnifiedLog),
      ...staticExceptions.map(toUnifiedLog),
    ];

    const liveUnified = liveEntries
      .filter(e => e.type === 'log' || e.type === 'request' || e.type === 'exception')
      .map(toUnifiedLog);

    return [...liveUnified, ...staticUnified].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [liveEntries]);

  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      if (filters.level.size > 0 && !filters.level.has(log.level)) return false;
      if (filters.host.size > 0 && !filters.host.has(log.host)) return false;
      if (search) {
        const q = search.toLowerCase();
        return log.message.toLowerCase().includes(q) || log.route.toLowerCase().includes(q) || log.host.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allLogs, filters, search]);

  useEffect(() => {
    if (effectiveLive && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [filteredLogs, effectiveLive]);

  const filterSections = useMemo(() => {
    const levelCounts: Record<string, number> = { info: 0, warning: 0, error: 0, debug: 0 };
    const hostCounts: Record<string, number> = {};
    allLogs.forEach(l => {
      levelCounts[l.level] = (levelCounts[l.level] || 0) + 1;
      hostCounts[l.host] = (hostCounts[l.host] || 0) + 1;
    });

    return [
      {
        label: 'Nível', key: 'level',
        options: [
          { value: 'warning', label: 'Warning', count: levelCounts.warning },
          { value: 'error', label: 'Error', count: levelCounts.error },
          { value: 'info', label: 'Info', count: levelCounts.info },
          { value: 'debug', label: 'Debug', count: levelCounts.debug },
        ],
      },
      {
        label: 'Host', key: 'host',
        options: Object.entries(hostCounts).map(([h, c]) => ({ value: h, label: h, count: c })),
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

  const handleReset = () => setFilters({ level: new Set(), host: new Set() });

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] -m-6">
      {/* Top bar */}
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

        <Button
          variant={effectiveLive ? 'default' : 'outline'}
          size="sm"
          className={`h-8 text-xs gap-1.5 ${effectiveLive ? 'bg-success/20 text-success border-success/30 hover:bg-success/30' : ''}`}
          onClick={toggleLocalLive}
        >
          {effectiveLive ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              Ao Vivo
            </>
          ) : (
            <>
              <Pause className="h-3 w-3" />
              Pausado
            </>
          )}
        </Button>

        <span className="text-[10px] text-muted-foreground tabular-nums">
          {filteredLogs.length} registros
        </span>
      </div>

      {/* Activity bar */}
      <div className="px-4 py-2 border-b border-border/50 bg-card/30">
        <ActivityBar entries={allLogs} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Filter panel */}
        <div className="border-r border-border/50 p-3 overflow-y-auto scrollbar-hidden bg-card/20">
          <LogsFilterPanel
            sections={filterSections}
            selected={filters}
            onToggle={handleToggleFilter}
            onReset={handleReset}
          />
        </div>

        {/* Log table */}
        <div ref={scrollRef} className="flex-1 overflow-auto scrollbar-hidden">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-card/90 backdrop-blur-sm z-10">
              <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                <th className="text-left px-3 py-2 w-6" />
                <th className="text-left px-3 py-2 w-32">Horário</th>
                <th className="text-left px-2 py-2 w-14">Método</th>
                <th className="text-left px-2 py-2 w-14">Status</th>
                <th className="text-left px-2 py-2 w-40">Host</th>
                <th className="text-left px-2 py-2 w-48">Rota</th>
                <th className="text-left px-2 py-2">Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, i) => {
                const isExpanded = expanded.has(log.id);
                return (
                  <tbody key={log.id}>
                    <tr
                      onClick={() => toggleExpand(log.id)}
                      className={`border-b border-border/20 hover:bg-muted/20 transition-colors cursor-pointer ${statusColor[log.level] || ''} ${i < 3 && effectiveLive ? 'animate-fade-in' : ''}`}
                    >
                      <td className="px-3 py-1.5">
                        {isExpanded ? <ChevronDown className="h-3 w-3 text-primary" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                      </td>
                      <td className="px-3 py-1.5 text-muted-foreground tabular-nums whitespace-nowrap">
                        {formatTime(log.timestamp)}
                      </td>
                      <td className="px-2 py-1.5 font-semibold text-foreground">
                        {log.method || '—'}
                      </td>
                      <td className={`px-2 py-1.5 font-semibold tabular-nums ${getStatusClass(log.statusCode)}`}>
                        {log.statusCode || '—'}
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground truncate max-w-[160px]">
                        {log.host}
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground truncate max-w-[192px]">
                        {log.route}
                      </td>
                      <td className="px-2 py-1.5 text-foreground truncate">
                        {log.message}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-muted/5 border-b border-border/20">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="space-y-3">
                            {/* Status badge */}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Status</span>
                              <div className={`px-2 py-1 rounded text-[10px] font-semibold ${
                                log.level === 'error' ? 'bg-error/10 text-error border border-error/30' :
                                log.level === 'warning' ? 'bg-warning/10 text-warning border border-warning/30' :
                                log.level === 'info' ? 'bg-success/10 text-success border border-success/30' :
                                'bg-muted/30 text-muted-foreground border border-muted/40'
                              }`}>
                                {log.level.toUpperCase()}
                              </div>
                            </div>

                            {/* Duration */}
                            {log.duration && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Duração</span>
                                <span className="text-xs text-foreground font-mono">{log.duration}ms</span>
                              </div>
                            )}

                            {/* Context */}
                            {log.context && Object.keys(log.context).length > 0 && (
                              <div>
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium block mb-1">Contexto</span>
                                <pre className="text-[10px] bg-background/50 border border-border/50 rounded p-2 text-success overflow-auto max-h-40 font-mono">
                                  {JSON.stringify(log.context, null, 2)}
                                </pre>
                              </div>
                            )}

                            {/* Stack Trace */}
                            {log.stackTrace && log.stackTrace.length > 0 && (
                              <div>
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium block mb-1">Stack Trace</span>
                                <div className="text-[9px] bg-background/50 border border-border/50 rounded p-2 text-error/80 font-mono space-y-0.5 max-h-40 overflow-auto">
                                  {log.stackTrace.map((line, idx) => (
                                    <div key={idx}>{line}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
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
