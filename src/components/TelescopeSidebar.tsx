import {
  Globe, Send, Briefcase, AlertTriangle, FileText,
  Database, Mail, Zap, HardDrive, Terminal, LayoutDashboard, Clock, Play, Square, LogOut, FolderOpen, ChevronDown
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useRealtime } from "@/contexts/RealtimeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { useEventCounts } from "@/hooks/useSupabaseEvents";
import { useState } from "react";

export function TelescopeSidebar() {
  const { isLive, toggleLive } = useRealtime();
  const { signOut, user } = useAuth();
  const { projects, selectedProject, setSelectedProjectId } = useProject();
  const { data: counts } = useEventCounts(selectedProject?.id ?? null);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);

  const navItems = [
    { title: "Painel Geral", url: "/", icon: LayoutDashboard, count: counts?.total ?? null },
    { title: "Requisições", url: "/requests", icon: Globe, count: counts?.request ?? null },
    { title: "Chamadas Externas", url: "/client-requests", icon: Send, count: counts?.webhook_out ?? null },
    { title: "Tarefas", url: "/jobs", icon: Briefcase, count: counts?.job ?? null },
    { title: "Erros", url: "/exceptions", icon: AlertTriangle, count: counts?.error ?? null },
    { title: "Registros", url: "/logs", icon: FileText, count: null },
    { title: "Consultas ao Banco", url: "/queries", icon: Database, count: null },
    { title: "E-mails", url: "/mail", icon: Mail, count: counts?.email ?? null },
    { title: "Eventos", url: "/events", icon: Zap, count: null },
    { title: "Cache", url: "/cache", icon: HardDrive, count: null },
    { title: "Comandos", url: "/commands", icon: Terminal, count: null },
    { title: "Linha do Tempo", url: "/timeline", icon: Clock, count: null },
    { title: "Projetos", url: "/projects", icon: FolderOpen, count: null },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] flex flex-col shrink-0">
      <div className="p-5 border-b border-[hsl(var(--sidebar-border))]">
        <h1 className="text-base font-semibold text-foreground tracking-tight">
          Tele<span className="text-primary">scope</span>
        </h1>
        <p className="text-[10px] text-muted-foreground mt-1 tracking-wide">
          Painel de Monitoramento
        </p>
      </div>

      {/* Project Selector */}
      <div className="px-4 py-3 border-b border-[hsl(var(--sidebar-border))]">
        <div className="relative">
          <button
            onClick={() => setProjectMenuOpen(!projectMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[hsl(var(--sidebar-accent))] text-xs text-foreground hover:bg-accent transition-colors"
          >
            <span className="truncate">{selectedProject?.name ?? 'Selecionar projeto'}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${projectMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {projectMenuOpen && projects.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-50 py-1 max-h-48 overflow-y-auto">
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProjectId(p.id); setProjectMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors ${
                    p.id === selectedProject?.id ? 'text-primary font-medium' : 'text-foreground'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-3 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex rounded-full h-2 w-2 bg-primary opacity-40 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-[10px] text-primary tracking-wide uppercase font-medium">
            Sistema Ativo
          </span>
        </div>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--sidebar-accent))] transition-all duration-200 group border-l-2 border-transparent"
            activeClassName="text-primary bg-primary/10 border-l-2 !border-primary"
          >
            <item.icon className="h-4 w-4 shrink-0 group-hover:text-primary transition-colors" />
            <span className="flex-1 truncate">{item.title}</span>
            {item.count !== null && item.count > 0 && (
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground group-hover:text-foreground">
                {item.count}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[hsl(var(--sidebar-border))] space-y-3">
        <button
          onClick={toggleLive}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
            isLive
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20'
          }`}
        >
          {isLive ? (
            <>
              <Square className="h-3 w-3 fill-current" />
              Parar
            </>
          ) : (
            <>
              <Play className="h-3 w-3 fill-current" />
              Ao Vivo
            </>
          )}
        </button>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground truncate">{user?.email}</span>
          <button onClick={signOut} className="text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="text-[10px] text-muted-foreground">v4.18.1</div>
      </div>
    </aside>
  );
}
