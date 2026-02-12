import { useMemo } from 'react';

interface ActivityBarProps {
  entries: { timestamp: string }[];
  minutes?: number;
}

export function ActivityBar({ entries, minutes = 30 }: ActivityBarProps) {
  const bars = useMemo(() => {
    const now = Date.now();
    const bucketCount = 60;
    const bucketSize = (minutes * 60 * 1000) / bucketCount;
    const buckets = new Array(bucketCount).fill(0);

    entries.forEach(entry => {
      const age = now - new Date(entry.timestamp).getTime();
      const idx = Math.floor(age / bucketSize);
      if (idx >= 0 && idx < bucketCount) {
        buckets[bucketCount - 1 - idx]++;
      }
    });

    const max = Math.max(...buckets, 1);
    return buckets.map(count => ({ count, height: Math.max((count / max) * 100, 4) }));
  }, [entries, minutes]);

  return (
    <div className="flex items-end gap-px h-8 w-full px-1">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all duration-200"
          style={{
            height: `${bar.height}%`,
            backgroundColor: bar.count === 0
              ? 'hsl(var(--muted) / 0.3)'
              : bar.count > 3
                ? 'hsl(var(--neon-cyan))'
                : 'hsl(var(--neon-cyan) / 0.5)',
          }}
          title={`${bar.count} eventos`}
        />
      ))}
    </div>
  );
}
