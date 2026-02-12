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
  cyan: { bg: 'bg-info/10', text: 'text-info' },
  green: { bg: 'bg-success/10', text: 'text-success' },
  magenta: { bg: '', text: 'text-purple-400' },
  red: { bg: 'bg-error/10', text: 'text-error' },
  yellow: { bg: 'bg-warning/10', text: 'text-warning' },
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
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{title}</span>
        <Icon className={`h-4 w-4 ${c.text}`} />
      </div>
      <div className={`text-2xl font-semibold ${c.text}`}>{display}</div>
      {subtitle && <p className="text-[10px] text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
