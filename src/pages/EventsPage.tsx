import { Zap } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { events, EventEntry } from "@/data/mockData";

const columns = [
  { key: 'name', header: 'Event', render: (e: EventEntry) => <span className="text-neon-green font-semibold">{e.name}</span> },
  { key: 'listeners', header: 'Listeners', render: (e: EventEntry) => <span className="text-muted-foreground">{e.listeners.length}</span> },
  { key: 'broadcast', header: 'Broadcast', render: (e: EventEntry) => e.broadcast ? <span className="text-neon-cyan">📡 Yes</span> : <span className="text-muted-foreground">No</span> },
  { key: 'time', header: 'Time', render: (e: EventEntry) => <span className="text-muted-foreground">{new Date(e.timestamp).toLocaleTimeString()}</span> },
];

const EventsPage = () => (
  <div>
    <PageHeader title="Events" icon={Zap} count={events.length} subtitle="Dispatched events" />
    <DataTable
      data={events}
      columns={columns}
      getKey={e => e.id}
      expandable={(e) => (
        <div className="space-y-3 text-xs">
          <div>
            <span className="text-muted-foreground">Listeners:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {e.listeners.map(l => <span key={l} className="bg-muted/30 px-2 py-0.5 rounded text-[10px] text-neon-cyan">{l}</span>)}
            </div>
          </div>
          {e.payload && <div><span className="text-muted-foreground">Payload:</span><pre className="mt-1 bg-muted/30 p-2 rounded text-[10px] text-neon-green overflow-auto">{JSON.stringify(e.payload, null, 2)}</pre></div>}
        </div>
      )}
    />
  </div>
);

export default EventsPage;
