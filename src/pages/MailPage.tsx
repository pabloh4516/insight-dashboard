import { Mail } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { mails, MailEntry } from "@/data/mockData";

const statusLabel: Record<string, string> = { sent: '✅ Enviado', failed: '❌ Falhou', queued: '⏳ Na fila' };
const statusColor: Record<string, string> = { sent: 'text-success', failed: 'text-error', queued: 'text-warning' };

const columns = [
  { key: 'status', header: 'Situação', render: (m: MailEntry) => <span className={statusColor[m.status]}>{statusLabel[m.status]}</span> },
  { key: 'to', header: 'Destinatário', render: (m: MailEntry) => <span className="text-info">{m.to}</span> },
  { key: 'subject', header: 'Assunto', render: (m: MailEntry) => <span className="text-foreground">{m.subject}</span> },
  { key: 'mailable', header: 'Tipo', render: (m: MailEntry) => <span className="text-muted-foreground text-[10px]">{m.mailable.split('\\').pop()}</span> },
  { key: 'time', header: 'Horário', render: (m: MailEntry) => <span className="text-muted-foreground">{new Date(m.timestamp).toLocaleTimeString()}</span> },
];

const MailPage = () => (
  <div>
    <PageHeader title="E-mails" icon={Mail} count={mails.length} subtitle="E-mails enviados pelo sistema" />
    <DataTable data={mails} columns={columns} getKey={m => m.id} />
  </div>
);

export default MailPage;
