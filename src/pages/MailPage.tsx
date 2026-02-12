import { Mail } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { mails, MailEntry } from "@/data/mockData";

const statusConfig: Record<string, string> = { sent: 'text-neon-green', failed: 'text-neon-red', queued: 'text-neon-yellow' };

const columns = [
  { key: 'status', header: 'Status', render: (m: MailEntry) => <span className={statusConfig[m.status]}>{m.status === 'sent' ? '✅' : m.status === 'failed' ? '❌' : '⏳'} {m.status}</span> },
  { key: 'to', header: 'To', render: (m: MailEntry) => <span className="text-neon-cyan">{m.to}</span> },
  { key: 'subject', header: 'Subject', render: (m: MailEntry) => <span className="text-foreground">{m.subject}</span> },
  { key: 'mailable', header: 'Mailable', render: (m: MailEntry) => <span className="text-muted-foreground text-[10px]">{m.mailable.split('\\').pop()}</span> },
  { key: 'time', header: 'Time', render: (m: MailEntry) => <span className="text-muted-foreground">{new Date(m.timestamp).toLocaleTimeString()}</span> },
];

const MailPage = () => (
  <div>
    <PageHeader title="Mail" icon={Mail} count={mails.length} subtitle="Sent emails" />
    <DataTable data={mails} columns={columns} getKey={m => m.id} />
  </div>
);

export default MailPage;
