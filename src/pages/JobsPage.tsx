import { Briefcase } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { jobs, JobEntry } from "@/data/mockData";

const statusIcon: Record<string, string> = { processed: '✅', failed: '❌', pending: '⏳' };
const statusColor: Record<string, string> = { processed: 'text-neon-green', failed: 'text-neon-red', pending: 'text-neon-yellow' };

const columns = [
  { key: 'status', header: 'Status', render: (j: JobEntry) => <span className={statusColor[j.status]}>{statusIcon[j.status]} {j.status}</span> },
  { key: 'name', header: 'Job', render: (j: JobEntry) => <span className="text-neon-cyan font-semibold">{j.name}</span> },
  { key: 'queue', header: 'Queue', render: (j: JobEntry) => <span className="text-muted-foreground">{j.queue}</span> },
  { key: 'duration', header: 'Duration', render: (j: JobEntry) => <span className={j.duration > 10000 ? 'text-neon-red' : 'text-muted-foreground'}>{j.duration}ms</span> },
  { key: 'attempts', header: 'Attempts', render: (j: JobEntry) => <span className={j.attempts > 1 ? 'text-neon-yellow' : 'text-muted-foreground'}>{j.attempts}</span> },
  { key: 'time', header: 'Time', render: (j: JobEntry) => <span className="text-muted-foreground">{new Date(j.timestamp).toLocaleTimeString()}</span> },
];

const JobsPage = () => (
  <div>
    <PageHeader title="Jobs" icon={Briefcase} count={jobs.length} subtitle="Queue jobs processing" />
    <DataTable
      data={jobs}
      columns={columns}
      getKey={j => j.id}
      expandable={(j) => (
        <div className="space-y-2 text-xs">
          <div><span className="text-muted-foreground">Connection:</span> <span className="text-neon-cyan">{j.connection}</span></div>
          {j.exception && <div><span className="text-muted-foreground">Exception:</span> <pre className="mt-1 bg-muted/30 p-2 rounded text-[10px] text-neon-red overflow-auto">{j.exception}</pre></div>}
        </div>
      )}
    />
  </div>
);

export default JobsPage;
