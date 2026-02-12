import { useHealthCheck } from "@/hooks/useHealthCheck";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === 'critical') return 'destructive';
  if (status === 'warning') return 'secondary';
  return 'default';
}

function statusLabel(status: string): string {
  if (status === 'critical') return 'Crítico';
  if (status === 'warning') return 'Atenção';
  return 'OK';
}

export function AcquirerHealthTable() {
  const { checks } = useHealthCheck();
  const acquirers = checks?.acquirers ?? [];

  if (acquirers.length === 0) return null;

  return (
    <div className="border rounded-lg p-4 bg-card">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Adquirentes</span>
      <div className="mt-3 space-y-2">
        {acquirers.map(acq => (
          <div key={acq.slug} className="flex items-center gap-3 p-2.5 rounded-md bg-secondary/30">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">{acq.name}</span>
                <Badge variant={statusVariant(acq.status)} className="text-[9px] px-1.5 py-0">
                  {statusLabel(acq.status)}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                <span>{acq.transactions_24h} txns/24h</span>
                <span className="text-primary">{acq.success_rate}% sucesso</span>
                {acq.failure_rate > 0 && <span className="text-destructive">{acq.failure_rate}% falha</span>}
                {acq.last_transaction_at && (
                  <span>última: {formatDistanceToNow(new Date(acq.last_transaction_at), { addSuffix: true, locale: ptBR })}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
