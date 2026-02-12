import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CreditCard, ArrowDownToLine, TestTube, Zap, Globe, AlertTriangle, Briefcase, Mail, Terminal, Database, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGatewayStats } from "@/hooks/useGatewayStats";
import { DbEvent } from "@/hooks/useSupabaseEvents";

const typeConfig: Record<string, { icon: typeof Zap; label: string; color: string }> = {
  request: { icon: Globe, label: "Requisição", color: "text-primary" },
  exception: { icon: AlertTriangle, label: "Exceção", color: "text-destructive" },
  job: { icon: Briefcase, label: "Job", color: "text-blue-400" },
  email: { icon: Mail, label: "E-mail", color: "text-green-400" },
  command: { icon: Terminal, label: "Comando", color: "text-purple-400" },
  query: { icon: Database, label: "Query", color: "text-cyan-400" },
  security: { icon: Shield, label: "Segurança", color: "text-warning" },
  payment: { icon: CreditCard, label: "Pagamento", color: "text-primary" },
  withdrawal: { icon: ArrowDownToLine, label: "Saque", color: "text-warning" },
  test: { icon: TestTube, label: "Teste", color: "text-muted-foreground" },
};

export function RecentActivityFeed() {
  const navigate = useNavigate();
  const { recentEvents, isLoading } = useGatewayStats("24h");

  return (
    <div className="border rounded-lg bg-card">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-primary font-medium">
          Atividade Recente
        </span>
        <button onClick={() => navigate("/events")} className="text-[10px] text-muted-foreground hover:text-primary transition-colors">
          Ver todos →
        </button>
      </div>
      <div className="divide-y divide-border relative">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Carregando...</div>
        ) : recentEvents.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Nenhum evento recente</div>
        ) : (
          recentEvents.map((event, index) => {
            const config = typeConfig[event.type] ?? { icon: Zap, label: event.type, color: "text-muted-foreground" };
            const Icon = config.icon;
            const borderColor = event.status === 'error' ? 'border-l-destructive' : event.status === 'warning' ? 'border-l-warning' : 'border-l-transparent';

            return (
              <button
                key={event.id}
                onClick={() => navigate("/events")}
                className={`w-full flex items-start gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors text-left border-l-2 ${borderColor}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-muted-foreground">{config.label}</span>
                  </div>
                  <p className="text-xs text-foreground truncate">{event.summary ?? '—'}</p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                  {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: ptBR })}
                </span>
              </button>
            );
          })
        )}
        {recentEvents.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  );
}
