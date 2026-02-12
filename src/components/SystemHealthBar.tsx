import { Activity } from "lucide-react";
import { stats, providerHealthData } from "@/data/mockData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function calculateHealthScore(): { score: number; factors: { label: string; impact: number }[] } {
  const factors: { label: string; impact: number }[] = [];

  // Error rate impact (max -30)
  const errorRate = parseFloat(stats.errorRate as string);
  const errorImpact = Math.min(errorRate * 3, 30);
  factors.push({ label: `Taxa de erro: ${errorRate}%`, impact: -errorImpact });

  // Failed jobs impact (max -20)
  const failedImpact = Math.min(stats.failedJobs * 10, 20);
  factors.push({ label: `Jobs falhados: ${stats.failedJobs}`, impact: -failedImpact });

  // Offline providers impact (max -30)
  const offlineCount = providerHealthData.filter(p => p.status === 'offline').length;
  const degradedCount = providerHealthData.filter(p => p.status === 'degraded').length;
  const providerImpact = offlineCount * 20 + degradedCount * 5;
  factors.push({ label: `Provedores offline: ${offlineCount}, degradados: ${degradedCount}`, impact: -Math.min(providerImpact, 30) });

  // Slow queries impact (max -20)
  const slowImpact = Math.min(stats.slowQueries * 5, 20);
  factors.push({ label: `Queries lentas: ${stats.slowQueries}`, impact: -slowImpact });

  const score = Math.max(0, Math.min(100, 100 + factors.reduce((sum, f) => sum + f.impact, 0)));
  return { score, factors };
}

function getHealthColor(score: number): string {
  if (score >= 80) return "hsl(var(--color-success))";
  if (score >= 50) return "hsl(var(--color-warning))";
  return "hsl(var(--color-error))";
}

function getHealthLabel(score: number): string {
  if (score >= 80) return "Saudável";
  if (score >= 50) return "Atenção";
  return "Crítico";
}

export function SystemHealthBar() {
  const { score, factors } = calculateHealthScore();
  const color = getHealthColor(score);
  const label = getHealthLabel(score);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="border rounded-lg p-4 bg-card cursor-default">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                  Saúde do Sistema
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold font-mono" style={{ color }}>{score}</span>
                <span className="text-[10px] text-muted-foreground">/100</span>
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{ color, backgroundColor: `${color}20` }}
                >
                  {label}
                </span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${score}%`, backgroundColor: color }}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="text-xs font-medium mb-2">Fatores:</p>
            {factors.map((f, i) => (
              <div key={i} className="flex items-center justify-between gap-4 text-[11px]">
                <span className="text-muted-foreground">{f.label}</span>
                <span className={f.impact < 0 ? "text-error" : "text-success"}>{f.impact}</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
