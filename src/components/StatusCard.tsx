import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface StatusCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'cyan' | 'green' | 'magenta' | 'red' | 'yellow';
  subtitle?: string;
}

const colorMap = {
  cyan: { glow: 'glow-cyan', text: 'text-neon-cyan' },
  green: { glow: 'glow-green', text: 'text-neon-green' },
  magenta: { glow: 'glow-magenta', text: 'text-neon-magenta' },
  red: { glow: 'glow-red', text: 'text-neon-red' },
  yellow: { glow: '', text: 'text-neon-yellow' },
};

export function StatusCard({ title, value, icon: Icon, color, subtitle }: StatusCardProps) {
  const [display, setDisplay] = useState(0);
  const c = colorMap[color];

  useEffect(() => {
    let frame: number;
    const duration = 800;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div className={`border rounded-lg p-4 bg-card ${c.glow} animate-border-glow`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">{title}</span>
        <Icon className={`h-4 w-4 ${c.text}`} />
      </div>
      <div className={`text-2xl font-display font-bold ${c.text}`}>{display}</div>
      {subtitle && <p className="text-[10px] text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
