import { Zap, CreditCard, ArrowDownToLine, TestTube, Search, ChevronDown, ChevronRight, Globe, AlertTriangle, Briefcase, Mail, Terminal, Database, Shield } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useSupabaseEvents, DbEvent } from "@/hooks/useSupabaseEvents";
import { useProject } from "@/contexts/ProjectContext";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const typeConfig: Record<string, { icon: typeof Zap; label: string; color: string }> = {
  request: { icon: Globe, label: "Requisição", color: "bg-primary/15 text-primary" },
  exception: { icon: AlertTriangle, label: "Exceção", color: "bg-destructive/15 text-destructive" },
  job: { icon: Briefcase, label: "Job", color: "bg-blue-500/15 text-blue-400" },
  email: { icon: Mail, label: "E-mail", color: "bg-green-500/15 text-green-400" },
  command: { icon: Terminal, label: "Comando", color: "bg-purple-500/15 text-purple-400" },
  query: { icon: Database, label: "Query", color: "bg-cyan-500/15 text-cyan-400" },
  security: { icon: Shield, label: "Segurança", color: "bg-warning/15 text-warning" },
  payment: { icon: CreditCard, label: "Pagamento", color: "bg-primary/15 text-primary" },
  withdrawal: { icon: ArrowDownToLine, label: "Saque", color: "bg-warning/15 text-warning" },
  test: { icon: TestTube, label: "Teste", color: "bg-muted text-muted-foreground" },
};

const statusConfig: Record<string, string> = {
  success: "bg-primary/15 text-primary",
  warning: "bg-warning/15 text-warning",
  error: "bg-destructive/15 text-destructive",
};

function getMeta(event: DbEvent): Record<string, unknown> {
  return (event.meta as Record<string, unknown>) ?? {};
}

const formatLatency = (ms: number) => ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
const latencyColor = (ms: number) => ms < 1000 ? 'text-primary' : ms <= 3000 ? 'text-warning' : 'text-destructive';

function EventRow({ event }: { event: DbEvent }) {
  const [expanded, setExpanded] = useState(false);
  const config = typeConfig[event.type] ?? { icon: Zap, label: event.type, color: "bg-muted text-muted-foreground" };
  const Icon = config.icon;
  const meta = getMeta(event);
  const isError = event.status === 'error';

  return (
    <div className="border-b border-border last:border-b-0">
      <button onClick={() => setExpanded(!expanded)} className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left ${isError ? 'bg-destructive/5' : ''}`}>
        {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${config.color}`}>{config.label}</Badge>
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusConfig[event.status] ?? ''}`}>{event.status}</Badge>
        <span className="text-xs text-foreground truncate flex-1">{event.summary ?? '—'}</span>
        <span className="text-[10px] text-muted-foreground shrink-0">
          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: ptBR })}
        </span>
      </button>
      {expanded && (
        <div className="px-12 pb-3 space-y-2 animate-fade-up">
          {Object.keys(meta).length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {Object.entries(meta).map(([key, value]) => (
                  <MetaItem key={key} label={key} value={String(value ?? '—')} />
                ))}
              </div>
              {isError && (meta.error_code || meta.error_message) && (
                <div className="bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
                  <div className="text-[10px] text-destructive font-medium mb-1">Erro</div>
                  <div className="text-xs text-destructive font-mono">{String(meta.error_code ?? '')} — {String(meta.error_message ?? '')}</div>
                </div>
              )}
            </>
          ) : (
            <div className="text-xs text-muted-foreground">Sem dados adicionais</div>
          )}
        </div>
      )}
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/30 rounded px-2.5 py-1.5">
      <div className="text-[10px] text-muted-foreground mb-0.5">{label}</div>
      <div className="text-xs text-foreground font-mono truncate">{value}</div>
    </div>
  );
}

const EventsPage = () => {
  const { selectedProject } = useProject();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { events, isLoading } = useSupabaseEvents({
    projectId: selectedProject?.id ?? null,
    type: typeFilter === 'all' ? undefined : typeFilter,
    search: search || undefined,
  });

  return (
    <div>
      <PageHeader title="Eventos" icon={Zap} count={events.length} subtitle="Eventos recebidos do gateway" />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <Tabs value={typeFilter} onValueChange={setTypeFilter}>
          <TabsList className="h-8 flex-wrap">
            <TabsTrigger value="all" className="text-xs px-3 py-1">Todos</TabsTrigger>
            <TabsTrigger value="request" className="text-xs px-3 py-1">Requisições</TabsTrigger>
            <TabsTrigger value="exception" className="text-xs px-3 py-1">Exceções</TabsTrigger>
            <TabsTrigger value="job" className="text-xs px-3 py-1">Jobs</TabsTrigger>
            <TabsTrigger value="query" className="text-xs px-3 py-1">Queries</TabsTrigger>
            <TabsTrigger value="security" className="text-xs px-3 py-1">Segurança</TabsTrigger>
            <TabsTrigger value="payment" className="text-xs px-3 py-1">Pagamentos</TabsTrigger>
            <TabsTrigger value="withdrawal" className="text-xs px-3 py-1">Saques</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar no summary..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-card border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="border rounded-lg bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-xs">Carregando eventos...</div>
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-xs">
            Nenhum evento encontrado. Envie eventos pelo seu gateway para vê-los aqui.
          </div>
        ) : (
          events.map(event => <EventRow key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
};

export default EventsPage;
