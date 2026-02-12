import {
  Globe, Send, Briefcase, AlertTriangle, FileText,
  Database, Mail, Zap, HardDrive, Terminal, LayoutDashboard, Clock, Play, Square
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { stats } from "@/data/mockData";
import { useRealtime } from "@/contexts/RealtimeContext";

const navItems = [
  { title: "Painel Geral", url: "/", icon: LayoutDashboard, count: null },
  { title: "Requisições", url: "/requests", icon: Globe, count: stats.requests },
  { title: "Chamadas Externas", url: "/client-requests", icon: Send, count: stats.clientRequests },
  { title: "Tarefas", url: "/jobs", icon: Briefcase, count: stats.jobs },
  { title: "Erros", url: "/exceptions", icon: AlertTriangle, count: stats.exceptions },
  { title: "Registros", url: "/logs", icon: FileText, count: stats.logs },
  { title: "Consultas ao Banco", url: "/queries", icon: Database, count: stats.queries },
  { title: "E-mails", url: "/mail", icon: Mail, count: stats.mails },
  { title: "Eventos", url: "/events", icon: Zap, count: stats.events },
  { title: "Cache", url: "/cache", icon: HardDrive, count: stats.cache },
  { title: "Comandos", url: "/commands", icon: Terminal, count: stats.commands },
  { title: "Linha do Tempo", url: "/timeline", icon: Clock, count: null },
];

export function TelescopeSidebar() {
  const { isLive, toggleLive } = useRealtime();
  return (
    <aside className="w-64 min-h-screen bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] flex flex-col shrink-0">
      <div className="p-5 border-b border-[hsl(var(--sidebar-border))]">
        <h1 className="text-base font-semibold text-foreground tracking-tight">
          Telescope
        </h1>
        <p className="text-[10px] text-muted-foreground mt-1 tracking-wide">
          Painel de Monitoramento
        </p>
      </div>

      <div className="px-5 py-3 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-[10px] text-success tracking-wide uppercase font-medium">
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
            className="flex items-center gap-3 px-5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--sidebar-accent))] transition-all duration-200 group"
            activeClassName="text-primary bg-[hsl(var(--sidebar-accent))] border-r-2 border-primary"
          >
            <item.icon className="h-4 w-4 shrink-0 group-hover:text-primary transition-colors" />
            <span className="flex-1 truncate">{item.title}</span>
            {item.count !== null && (
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground group-hover:text-foreground">
                {item.count}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[hsl(var(--sidebar-border))]">
        <button
          onClick={toggleLive}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-medium tracking-wide transition-all ${
            isLive
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-success/10 border border-success/30 text-success hover:bg-success/20'
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
        <div className="text-[10px] text-muted-foreground mt-3">v4.18.1</div>
      </div>
    </aside>
  );
}
