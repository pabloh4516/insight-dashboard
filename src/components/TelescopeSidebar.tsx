import {
  Zap, FileText, LayoutDashboard, LogOut, FolderOpen, ChevronDown, ChevronRight,
  Globe, AlertTriangle, Database, Cog, Mail, HardDrive, Terminal, Shield,
  ArrowDownLeft, ArrowUpRight, LogIn, Settings, RefreshCw, Bell
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { useEventCounts } from "@/hooks/useSupabaseEvents";
import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  count: number | null;
}

interface SidebarGroup {
  label: string;
  items: NavItem[];
}

export function TelescopeSidebar() {
  const { signOut, user } = useAuth();
  const { projects, selectedProject, setSelectedProjectId } = useProject();
  const { data: counts } = useEventCounts(selectedProject?.id ?? null);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const location = useLocation();

  const groups: SidebarGroup[] = useMemo(() => [
    {
      label: "Visão Geral",
      items: [
        { title: "Painel Geral", url: "/", icon: LayoutDashboard, count: counts?.total ?? null },
        { title: "Eventos", url: "/events", icon: Zap, count: counts?.payment ?? null },
        { title: "Registros", url: "/logs", icon: FileText, count: null },
      ],
    },
    {
      label: "Operações",
      items: [
        { title: "Requests", url: "/requests", icon: Globe, count: counts?.request ?? null },
        { title: "Queries", url: "/queries", icon: Database, count: counts?.query ?? null },
        { title: "Jobs", url: "/jobs", icon: Cog, count: counts?.job ?? null },
        { title: "Mail", url: "/mails", icon: Mail, count: counts?.email ?? null },
        { title: "Cache", url: "/cache", icon: HardDrive, count: counts?.cache ?? null },
        { title: "Commands", url: "/commands", icon: Terminal, count: counts?.command ?? null },
      ],
    },
    {
      label: "Segurança e Acesso",
      items: [
        { title: "Segurança", url: "/security", icon: Shield, count: counts?.security ?? null },
        { title: "Logins", url: "/logins", icon: LogIn, count: counts?.login ?? null },
        { title: "Config", url: "/config-changes", icon: Settings, count: counts?.config_change ?? null },
      ],
    },
    {
      label: "Integrações",
      items: [
        { title: "Webhooks In", url: "/webhooks-in", icon: ArrowDownLeft, count: counts?.webhook_in ?? null },
        { title: "Webhooks Out", url: "/webhooks-out", icon: ArrowUpRight, count: counts?.webhook_out ?? null },
        { title: "Fallback", url: "/acquirer-switch", icon: RefreshCw, count: counts?.acquirer_switch ?? null },
      ],
    },
  ], [counts]);

  // Auto-open group containing active route
  const activeGroupIndices = useMemo(() => {
    const indices = new Set<number>();
    groups.forEach((group, i) => {
      const match = group.items.some(item =>
        item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url)
      );
      if (match) indices.add(i);
    });
    return indices;
  }, [groups, location.pathname]);

  const [openGroups, setOpenGroups] = useState<Set<number>>(activeGroupIndices);

  // Keep active group open when route changes
  useMemo(() => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      activeGroupIndices.forEach(i => next.add(i));
      return next;
    });
  }, [activeGroupIndices]);

  const toggleGroup = (index: number) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

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
        {groups.map((group, groupIndex) => {
          const isOpen = openGroups.has(groupIndex);
          return (
            <div key={group.label} className="mb-1">
              <button
                onClick={() => toggleGroup(groupIndex)}
                className="w-full flex items-center gap-2 px-5 py-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                <span className="font-medium">{group.label}</span>
              </button>
              {isOpen && (
                <div>
                  {group.items.map((item) => (
                    <NavLink
                      key={item.url}
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-5 pl-9 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--sidebar-accent))] transition-all duration-200 group border-l-2 border-transparent"
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
                </div>
              )}
            </div>
          );
        })}

        {/* Fixed items */}
        <div className="mt-1 pt-1 border-t border-[hsl(var(--sidebar-border))]">
          <NavLink
            to="/projects"
            className="flex items-center gap-3 px-5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--sidebar-accent))] transition-all duration-200 group border-l-2 border-transparent"
            activeClassName="text-primary bg-primary/10 border-l-2 !border-primary"
          >
            <FolderOpen className="h-4 w-4 shrink-0 group-hover:text-primary transition-colors" />
            <span className="flex-1 truncate">Projetos</span>
          </NavLink>
          <NavLink
            to="/notifications"
            className="flex items-center gap-3 px-5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--sidebar-accent))] transition-all duration-200 group border-l-2 border-transparent"
            activeClassName="text-primary bg-primary/10 border-l-2 !border-primary"
          >
            <Bell className="h-4 w-4 shrink-0 group-hover:text-primary transition-colors" />
            <span className="flex-1 truncate">Notificações</span>
          </NavLink>
        </div>
      </nav>

      <div className="p-4 border-t border-[hsl(var(--sidebar-border))] space-y-3">
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
