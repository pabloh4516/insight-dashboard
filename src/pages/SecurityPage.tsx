import { useState, useMemo, useCallback } from "react";
import { PaginationControls } from "@/components/PaginationControls";
import { Shield, Search, List, Network, ChevronDown, ChevronRight, AlertTriangle, ShieldAlert, ShieldCheck, Globe, Monitor } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useProject } from "@/contexts/ProjectContext";
import { useSupabaseEvents, DbEvent } from "@/hooks/useSupabaseEvents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { startOfDay, format } from "date-fns";

type ViewMode = "list" | "ip";

export default function SecurityPage() {
  const { selectedProject } = useProject();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const { events, liveEvents, isLoading } = useSupabaseEvents({
    projectId: selectedProject?.id ?? null,
    type: "security",
    status: statusFilter === "all" ? undefined : statusFilter,
    search: search || undefined,
  });

  const todayStart = useMemo(() => startOfDay(new Date()).toISOString(), []);

  const todayEvents = useMemo(
    () => events.filter((e) => e.created_at >= todayStart),
    [events, todayStart]
  );

  const todayWarnings = todayEvents.filter((e) => e.status === "warning").length;
  const todayErrors = todayEvents.filter((e) => e.status === "error").length;

  const ipGroups = useMemo(() => {
    const groups: Record<string, DbEvent[]> = {};
    events.forEach((e) => {
      const ip = String((e.meta as any)?.ip ?? "desconhecido");
      (groups[ip] ??= []).push(e);
    });
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [events]);

  const liveIds = useMemo(() => new Set(liveEvents.map((e) => e.id)), [liveEvents]);

  const totalPages = Math.max(1, Math.ceil(events.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedEvents = useMemo(
    () => events.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage),
    [events, safePage, itemsPerPage]
  );

  const handlePageChange = useCallback((page: number) => setCurrentPage(page), []);
  const handleItemsPerPageChange = useCallback((count: number) => {
    setItemsPerPage(count);
    setCurrentPage(1);
  }, []);

  const getMeta = (e: DbEvent, key: string) => String((e.meta as any)?.[key] ?? "—");

  return (
    <div className="space-y-6">
      <PageHeader title="Segurança" icon={Shield} count={events.length} subtitle="Monitoramento de eventos de segurança" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Alertas Hoje</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <span className="text-2xl font-bold text-foreground">{todayEvents.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" /> Tentativas Suspeitas
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <span className="text-2xl font-bold text-yellow-500">{todayWarnings}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-destructive" /> Ataques Bloqueados
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <span className="text-2xl font-bold text-destructive">{todayErrors}</span>
          </CardContent>
        </Card>
      </div>

      {/* Top IPs */}
      {ipGroups.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Top IPs Suspeitos</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              {ipGroups.slice(0, 8).map(([ip, evts]) => {
                const errorCount = evts.filter((e) => e.status === "error").length;
                return (
                  <Badge
                    key={ip}
                    variant={errorCount > evts.length / 2 ? "destructive" : "secondary"}
                    className="text-[11px] font-mono gap-1.5"
                  >
                    {ip} <span className="opacity-70">({evts.length})</span>
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs px-3 h-7">Todos</TabsTrigger>
            <TabsTrigger value="warning" className="text-xs px-3 h-7">Warning</TabsTrigger>
            <TabsTrigger value="error" className="text-xs px-3 h-7">Error</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={viewMode === "list" ? "secondary" : "ghost"}
            className="h-8 w-8 p-0"
            onClick={() => setViewMode("list")}
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === "ip" ? "secondary" : "ghost"}
            className="h-8 w-8 p-0"
            onClick={() => setViewMode("ip")}
          >
            <Network className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Live indicator */}
      {liveEvents.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex rounded-full h-2 w-2 bg-primary opacity-40 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-[10px] text-primary uppercase font-medium tracking-wide">Ao Vivo</span>
        </div>
      )}

      {/* Events */}
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Carregando...</p>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShieldCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Nenhum evento de segurança encontrado.</p>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <div>
          <div className="space-y-1">
            {paginatedEvents.map((e) => (
              <EventRow
                key={e.id}
                event={e}
                isLive={liveIds.has(e.id)}
                expanded={expandedId === e.id}
                onToggle={() => setExpandedId(expandedId === e.id ? null : e.id)}
                getMeta={getMeta}
              />
            ))}
          </div>
          <PaginationControls
            currentPage={safePage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            totalItems={events.length}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {ipGroups.map(([ip, evts]) => (
            <Card key={ip}>
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-xs font-mono flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  {ip}
                  <Badge variant="secondary" className="text-[10px] ml-auto">{evts.length} eventos</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 space-y-1">
                {evts.map((e) => (
                  <EventRow
                    key={e.id}
                    event={e}
                    isLive={liveIds.has(e.id)}
                    expanded={expandedId === e.id}
                    onToggle={() => setExpandedId(expandedId === e.id ? null : e.id)}
                    getMeta={getMeta}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function EventRow({
  event,
  isLive,
  expanded,
  onToggle,
  getMeta,
}: {
  event: DbEvent;
  isLive: boolean;
  expanded: boolean;
  onToggle: () => void;
  getMeta: (e: DbEvent, k: string) => string;
}) {
  return (
    <div
      className={`rounded-lg border transition-colors ${isLive ? "border-primary/30 bg-primary/5" : "bg-card"}`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs hover:bg-accent/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
        <Badge
          variant={event.status === "error" ? "destructive" : "secondary"}
          className={`text-[10px] shrink-0 ${event.status === "warning" ? "bg-yellow-500/15 text-yellow-600 border-yellow-500/30" : ""}`}
        >
          {event.status === "error" ? "Bloqueado" : "Suspeito"}
        </Badge>
        <span className="truncate flex-1 text-foreground">{event.summary ?? "Sem descrição"}</span>
        {isLive && (
          <span className="text-[9px] text-primary font-medium uppercase tracking-wider shrink-0">novo</span>
        )}
        <span className="text-[10px] text-muted-foreground shrink-0">
          {format(new Date(event.created_at), "HH:mm:ss")}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-3 pt-1 border-t border-border/50 animate-fade-in">
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <span className="text-muted-foreground">IP de Origem</span>
              <p className="font-mono text-foreground mt-0.5">{getMeta(event, "ip")}</p>
            </div>
            <div>
              <span className="text-muted-foreground">URI Alvo</span>
              <p className="font-mono text-foreground mt-0.5 truncate">{getMeta(event, "uri")}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Motivo</span>
              <p className="text-foreground mt-0.5">{getMeta(event, "reason")}</p>
            </div>
            <div>
              <span className="text-muted-foreground flex items-center gap-1"><Monitor className="h-3 w-3" /> User Agent</span>
              <p className="text-foreground mt-0.5 truncate">{getMeta(event, "user_agent")}</p>
            </div>
          </div>
          {event.status === "error" && (
            <div className="mt-3 p-2 rounded bg-destructive/10 border border-destructive/20 text-[11px] text-destructive">
              Ataque bloqueado — {getMeta(event, "reason")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
