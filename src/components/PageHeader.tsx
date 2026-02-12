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
        <Icon className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
        {count !== undefined && (
          <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{count}</span>
        )}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1 ml-8">{subtitle}</p>}
      <div className="mt-3 h-px bg-border" />
    </div>
  );
}
