import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  icon: LucideIcon;
  count?: number;
  subtitle?: string;
}

export function PageHeader({ title, icon: Icon, count, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-neon-cyan" />
        <h1 className="font-display text-lg font-bold tracking-wider text-foreground uppercase">{title}</h1>
        {count !== undefined && (
          <span className="text-xs font-display bg-muted px-2 py-0.5 rounded text-neon-cyan">{count}</span>
        )}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1 ml-8">{subtitle}</p>}
      <div className="mt-3 h-px bg-gradient-to-r from-neon-cyan/40 via-transparent to-transparent" />
    </div>
  );
}
