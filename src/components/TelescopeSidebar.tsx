import {
  Globe, Send, Briefcase, AlertTriangle, FileText,
  Database, Mail, Zap, HardDrive, Terminal, LayoutDashboard, Clock
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { stats } from "@/data/mockData";

const navItems = [
  { title: "Overview", url: "/", icon: LayoutDashboard, count: null },
  { title: "Requests", url: "/requests", icon: Globe, count: stats.requests },
  { title: "Client Requests", url: "/client-requests", icon: Send, count: stats.clientRequests },
  { title: "Jobs", url: "/jobs", icon: Briefcase, count: stats.jobs },
  { title: "Exceptions", url: "/exceptions", icon: AlertTriangle, count: stats.exceptions },
  { title: "Logs", url: "/logs", icon: FileText, count: stats.logs },
  { title: "Queries", url: "/queries", icon: Database, count: stats.queries },
  { title: "Mail", url: "/mail", icon: Mail, count: stats.mails },
  { title: "Events", url: "/events", icon: Zap, count: stats.events },
  { title: "Cache", url: "/cache", icon: HardDrive, count: stats.cache },
  { title: "Commands", url: "/commands", icon: Terminal, count: stats.commands },
  { title: "Timeline", url: "/timeline", icon: Clock, count: null },
];

export function TelescopeSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-[hsl(var(--sidebar-border))]">
        <h1 className="font-display text-xl font-bold text-neon-cyan tracking-widest">
          TELESCOPE
        </h1>
        <p className="text-[10px] text-muted-foreground mt-1 tracking-wider uppercase">
          Monitoring Dashboard
        </p>
      </div>

      {/* System Status */}
      <div className="px-5 py-3 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green" />
          </span>
          <span className="text-[10px] text-neon-green tracking-widest uppercase font-display">
            System Online
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--sidebar-accent))] transition-all duration-200 group"
            activeClassName="text-neon-cyan bg-[hsl(var(--sidebar-accent))] border-r-2 border-neon-cyan"
          >
            <item.icon className="h-4 w-4 shrink-0 group-hover:text-primary transition-colors" />
            <span className="flex-1 truncate">{item.title}</span>
            {item.count !== null && (
              <span className="text-[10px] font-display bg-muted px-1.5 py-0.5 rounded text-muted-foreground group-hover:text-foreground">
                {item.count}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[hsl(var(--sidebar-border))] text-[10px] text-muted-foreground">
        <div className="font-display tracking-wider">v4.18.1</div>
      </div>
    </aside>
  );
}
