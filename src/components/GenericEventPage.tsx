import { LucideIcon, Search, ChevronDown, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useSupabaseEvents, DbEvent } from "@/hooks/useSupabaseEvents";
import { useProject } from "@/contexts/ProjectContext";
import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface GenericEventPageProps {
  type: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
}

const statusConfig: Record<string, string> = {
  success: "bg-primary/15 text-primary",
  warning: "bg-warning/15 text-warning",
  error: "bg-destructive/15 text-destructive",
};

function EventRow({ event, isLive }: { event: DbEvent; isLive?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const meta = (event.meta as Record<string, unknown>) ?? {};
  const isError = event.status === "error";

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left ${isError ? "bg-destructive/5" : ""} ${isLive ? "animate-fade-in border-l-2 border-l-primary" : ""}`}
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
        )}
        <Badge
          variant="outline"
          className={`text-[10px] px-1.5 py-0 ${statusConfig[event.status] ?? ""}`}
        >
          {event.status}
        </Badge>
        <span className="text-xs text-foreground truncate flex-1">
          {event.summary ?? "—"}
        </span>
        <span className="text-[10px] text-muted-foreground shrink-0">
          {formatDistanceToNow(new Date(event.created_at), {
            addSuffix: true,
            locale: ptBR,
          })}
        </span>
      </button>
      {expanded && (
        <div className="px-12 pb-3 space-y-2 animate-fade-up">
          {Object.keys(meta).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {Object.entries(meta).map(([key, value]) => (
                <div key={key} className="bg-muted/30 rounded px-2.5 py-1.5">
                  <div className="text-[10px] text-muted-foreground mb-0.5">{key}</div>
                  <div className="text-xs text-foreground font-mono truncate">
                    {typeof value === "object" ? JSON.stringify(value) : String(value ?? "—")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Sem dados adicionais</div>
          )}
          {isError && (meta.error_code || meta.error_message || meta.error) && (
            <div className="bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
              <div className="text-[10px] text-destructive font-medium mb-1">Erro</div>
              <div className="text-xs text-destructive font-mono">
                {String(meta.error_code ?? meta.error ?? "")}
                {meta.error_message ? ` — ${String(meta.error_message)}` : ""}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function GenericEventPage({ type, title, subtitle, icon }: GenericEventPageProps) {
  const { selectedProject } = useProject();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { events, liveEvents, isLoading } = useSupabaseEvents({
    projectId: selectedProject?.id ?? null,
    type,
    status: statusFilter === "all" ? undefined : statusFilter,
        search: search || undefined,
  });

  const liveIds = useMemo(() => new Set(liveEvents.map(e => e.id)), [liveEvents]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1">
          <PageHeader title={title} icon={icon} count={events.length} subtitle={subtitle} />
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-primary shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Ao Vivo
          {liveEvents.length > 0 && (
            <span className="text-muted-foreground">({liveEvents.length} novos)</span>
          )}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs px-3 py-1">Todos</TabsTrigger>
            <TabsTrigger value="success" className="text-xs px-3 py-1">Success</TabsTrigger>
            <TabsTrigger value="error" className="text-xs px-3 py-1">Error</TabsTrigger>
            <TabsTrigger value="warning" className="text-xs px-3 py-1">Warning</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar no summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-card border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="border rounded-lg bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-xs">
            Carregando eventos...
          </div>
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-xs">
            Nenhum evento encontrado. Envie eventos do tipo "{type}" pelo seu gateway.
          </div>
        ) : (
          events.map((event) => <EventRow key={event.id} event={event} isLive={liveIds.has(event.id)} />)
        )}
      </div>
    </div>
  );
}
