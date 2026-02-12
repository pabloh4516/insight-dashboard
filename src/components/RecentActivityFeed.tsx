import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Globe, Send, Briefcase, AlertTriangle, FileText,
  Database, Mail, Zap, HardDrive, Terminal
} from "lucide-react";
import { allEntries, AnyEntry } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

const typeConfig: Record<string, { icon: typeof Globe; label: string; route: string }> = {
  request: { icon: Globe, label: "Requisição", route: "/requests" },
  client_request: { icon: Send, label: "Chamada Ext.", route: "/client-requests" },
  job: { icon: Briefcase, label: "Tarefa", route: "/jobs" },
  exception: { icon: AlertTriangle, label: "Erro", route: "/exceptions" },
  log: { icon: FileText, label: "Log", route: "/logs" },
  query: { icon: Database, label: "Query", route: "/queries" },
  mail: { icon: Mail, label: "E-mail", route: "/mail" },
  event: { icon: Zap, label: "Evento", route: "/events" },
  cache: { icon: HardDrive, label: "Cache", route: "/cache" },
  command: { icon: Terminal, label: "Comando", route: "/commands" },
};

function getEntrySummary(entry: AnyEntry): string {
  switch (entry.type) {
    case "request": return `${entry.method} ${entry.url} → ${entry.statusCode}`;
    case "client_request": return `${entry.provider}: ${entry.method} → ${entry.statusCode}`;
    case "job": return `${entry.name} (${entry.status})`;
    case "exception": return entry.message.slice(0, 60);
    case "log": return entry.message.slice(0, 60);
    case "query": return entry.sql.slice(0, 50) + "...";
    case "mail": return `${entry.subject} → ${entry.to}`;
    case "event": return entry.name;
    case "cache": return `${entry.operation}: ${entry.key}`;
    case "command": return entry.command;
    default: return "";
  }
}

function getSeverityColor(entry: AnyEntry): string {
  if (entry.type === "exception") return "text-error";
  if (entry.type === "log" && entry.level === "error") return "text-error";
  if (entry.type === "log" && entry.level === "warning") return "text-warning";
  if (entry.type === "job" && entry.status === "failed") return "text-error";
  if (entry.type === "request" && entry.statusCode >= 500) return "text-error";
  if (entry.type === "request" && entry.statusCode >= 400) return "text-warning";
  if (entry.type === "client_request" && entry.statusCode >= 500) return "text-error";
  return "text-muted-foreground";
}

export function RecentActivityFeed() {
  const navigate = useNavigate();
  const recentEntries = allEntries.slice(0, 10);

  return (
    <div className="border rounded-lg bg-card">
      <div className="px-4 py-3 border-b">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          Atividade Recente
        </span>
      </div>
      <div className="divide-y divide-border">
        {recentEntries.map((entry) => {
          const config = typeConfig[entry.type];
          if (!config) return null;
          const Icon = config.icon;
          const severityColor = getSeverityColor(entry);

          return (
            <button
              key={entry.id}
              onClick={() => navigate(config.route)}
              className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors text-left"
            >
              <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${severityColor}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground">{config.label}</span>
                </div>
                <p className="text-xs text-foreground truncate">{getEntrySummary(entry)}</p>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true, locale: ptBR })}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
