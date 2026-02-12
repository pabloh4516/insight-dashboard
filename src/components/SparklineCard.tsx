import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface SparklineCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend: number;
  sparkData: number[];
  color: string;
  compact?: boolean;
}

function Sparkline({ data, color, height = 32, width = 80 }: { data: number[]; color: string; height?: number; width?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-fill-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-fill-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SparklineCard({ title, value, icon: Icon, trend, sparkData, color, compact = false }: SparklineCardProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 border rounded-lg px-3 py-2.5 bg-card hover:bg-accent/50 transition-colors">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{title}</span>
        <span className="text-sm font-semibold text-foreground ml-auto font-mono">{value.toLocaleString()}</span>
        <TrendIndicator value={trend} />
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-card hover:bg-accent/30 transition-colors group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{title}</span>
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-semibold text-foreground font-mono">{value.toLocaleString()}</div>
          <TrendIndicator value={trend} />
        </div>
        <Sparkline data={sparkData} color={color} />
      </div>
    </div>
  );
}

function TrendIndicator({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground mt-1">
        <Minus className="h-3 w-3" /> 0%
      </span>
    );
  }

  const isPositive = value > 0;

  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] mt-1 ${isPositive ? "text-success" : "text-error"}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isPositive ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}
