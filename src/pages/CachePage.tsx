import { HardDrive } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { cacheEntries, CacheEntry } from "@/data/mockData";

const opConfig: Record<string, { color: string; label: string }> = {
  hit: { color: 'text-neon-green', label: 'HIT ✅' },
  miss: { color: 'text-neon-red', label: 'MISS ❌' },
  set: { color: 'text-neon-cyan', label: 'SET 💾' },
  forget: { color: 'text-neon-yellow', label: 'FORGET 🗑️' },
};

const columns = [
  { key: 'op', header: 'Operation', render: (c: CacheEntry) => <span className={`font-display font-bold ${opConfig[c.operation].color}`}>{opConfig[c.operation].label}</span> },
  { key: 'key', header: 'Key', render: (c: CacheEntry) => <code className="text-neon-cyan text-[11px]">{c.key}</code> },
  { key: 'ttl', header: 'TTL', render: (c: CacheEntry) => <span className="text-muted-foreground">{c.ttl ? `${c.ttl}s` : '—'}</span> },
  { key: 'time', header: 'Time', render: (c: CacheEntry) => <span className="text-muted-foreground">{new Date(c.timestamp).toLocaleTimeString()}</span> },
];

const CachePage = () => (
  <div>
    <PageHeader title="Cache" icon={HardDrive} count={cacheEntries.length} subtitle="Cache operations" />
    <DataTable data={cacheEntries} columns={columns} getKey={c => c.id} />
  </div>
);

export default CachePage;
