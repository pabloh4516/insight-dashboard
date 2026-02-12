import { Zap } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { events, EventEntry } from "@/data/mockData";

const columns = [
  { key: 'name', header: 'Evento', render: (e: EventEntry) => <span className="text-success font-semibold">{e.name}</span> },
  { key: 'listeners', header: 'Ações disparadas', render: (e: EventEntry) => <span className="text-muted-foreground">{e.listeners.length}</span> },
  { key: 'broadcast', header: 'Transmitido', render: (e: EventEntry) => e.broadcast ? <span className="text-info">📡 Sim</span> : <span className="text-muted-foreground">Não</span> },
  { key: 'time', header: 'Horário', render: (e: EventEntry) => <span className="text-muted-foreground">{new Date(e.timestamp).toLocaleTimeString()}</span> },
];

const EventsPage = () => (
  <div>
    <PageHeader title="Eventos" icon={Zap} count={events.length} subtitle="Eventos disparados pelo sistema" />
    <DataTable
      data={events}
      columns={columns}
      getKey={e => e.id}
      expandable={(e) => (
        <div className="space-y-3 text-xs">
          <div>
            <span className="text-muted-foreground">Ações executadas:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {e.listeners.map(l => <span key={l} className="bg-muted/30 px-2 py-0.5 rounded text-[10px] text-info">{l}</span>)}
            </div>
          </div>
          {e.payload && <div><span className="text-muted-foreground">Dados:</span><pre className="mt-1 bg-muted/30 p-2 rounded text-[10px] text-success overflow-auto">{JSON.stringify(e.payload, null, 2)}</pre></div>}
        </div>
      )}
    />
  </div>
);

export default EventsPage;
