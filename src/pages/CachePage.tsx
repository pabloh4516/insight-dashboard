import { HardDrive } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { cacheEntries, CacheEntry } from "@/data/mockData";

const opConfig: Record<string, { color: string; label: string }> = {
  hit: { color: 'text-neon-green', label: '✅ Encontrado' },
  miss: { color: 'text-neon-red', label: '❌ Não encontrado' },
  set: { color: 'text-neon-cyan', label: '💾 Salvo' },
  forget: { color: 'text-neon-yellow', label: '🗑️ Removido' },
};

const columns = [
  { key: 'op', header: 'Operação', render: (c: CacheEntry) => <span className={`font-display font-bold ${opConfig[c.operation].color}`}>{opConfig[c.operation].label}</span> },
  { key: 'key', header: 'Chave', render: (c: CacheEntry) => <code className="text-neon-cyan text-[11px]">{c.key}</code> },
  { key: 'ttl', header: 'Validade', render: (c: CacheEntry) => <span className="text-muted-foreground">{c.ttl ? `${c.ttl}s` : '—'}</span> },
  { key: 'time', header: 'Horário', render: (c: CacheEntry) => <span className="text-muted-foreground">{new Date(c.timestamp).toLocaleTimeString()}</span> },
];

const CachePage = () => (
  <div>
    <PageHeader title="Cache" icon={HardDrive} count={cacheEntries.length} subtitle="Operações de armazenamento temporário" />
    <DataTable data={cacheEntries} columns={columns} getKey={c => c.id} />
  </div>
);

export default CachePage;
