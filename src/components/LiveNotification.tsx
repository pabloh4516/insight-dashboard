import { useEffect, useState } from 'react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { AnyEntry } from '@/data/mockData';
import { X } from 'lucide-react';

export function LiveNotification() {
  const { liveEntries, isLive } = useRealtime();
  const [notification, setNotification] = useState<AnyEntry | null>(null);

  useEffect(() => {
    if (!isLive || liveEntries.length === 0) return;

    setNotification(liveEntries[0]);
    const timer = setTimeout(() => setNotification(null), 4000);

    return () => clearTimeout(timer);
  }, [liveEntries, isLive]);

  if (!notification) return null;

  const typeLabels: Record<string, string> = {
    request: 'Requisição',
    client_request: 'Chamada Externa',
    job: 'Tarefa',
    exception: 'Erro',
    log: 'Registro',
    query: 'Consulta',
    mail: 'E-mail',
    event: 'Evento',
    cache: 'Cache',
    command: 'Comando',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className="bg-card border border-success/30 rounded-lg p-3 shadow-lg max-w-xs">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-success mb-1 font-medium">
              ✓ Novo {typeLabels[notification.type] || notification.type}
            </div>
            <p className="text-xs text-foreground/80 truncate">
              {notification.timestamp && new Date(notification.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
