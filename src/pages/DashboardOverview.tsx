import {
  LayoutDashboard, AlertTriangle, Zap, Activity, Server, Shield, Briefcase, Globe
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageHeader } from "@/components/PageHeader";
import { StatusBanner } from "@/components/StatusBanner";
import { Tooltip as ShadTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { useState, useMemo } from "react";
import { SparklineCard } from "@/components/SparklineCard";
import { SystemHealthBar } from "@/components/SystemHealthBar";
import { RecentActivityFeed } from "@/components/RecentActivityFeed";
import { ProviderHealth } from "@/components/ProviderHealth";
import { useGatewayStats } from "@/hooks/useGatewayStats";

const periods = ["1h", "6h", "24h", "7d"] as const;
type PeriodKey = typeof periods[number];

const COLORS = {
  request: "hsl(160, 84%, 39%)",
  error: "hsl(0, 72%, 51%)",
  job: "hsl(220, 70%, 55%)",
  security: "hsl(38, 92%, 50%)",
};

const DashboardOverview = () => {
  const [chartPeriod, setChartPeriod] = useState<PeriodKey>("24h");
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const stats = useGatewayStats(chartPeriod);

  const toggleSeries = (key: string) => {
    setHiddenSeries(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const requestSparkline = useMemo(() => stats.hourlyData.map(h => h.requests), [stats.hourlyData]);
  const errorSparkline = useMemo(() => stats.hourlyData.map(h => h.errors), [stats.hourlyData]);

  return (
    <TooltipProvider>
    <div>
      <PageHeader title="Painel Geral" icon={LayoutDashboard} subtitle="Monitoramento técnico — Saúde do sistema em tempo real" />

      {/* Status Banner */}
      <div className="mb-5 animate-fade-up">
        <StatusBanner />
      </div>

      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 animate-fade-up">
          <ShadTooltip>
            <TooltipTrigger asChild>
              <div><SystemHealthBar /></div>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p className="text-xs">Nota geral baseada em erros e velocidade de resposta</p></TooltipContent>
          </ShadTooltip>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ShadTooltip>
            <TooltipTrigger asChild>
              <div className="border rounded-lg p-4 bg-card card-hover animate-fade-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Requisições</span>
                </div>
                <div className="text-lg font-bold font-mono text-foreground">{stats.requestsToday.toLocaleString()}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">Quantas vezes seu sistema foi chamado hoje</p></TooltipContent>
          </ShadTooltip>
          <ShadTooltip>
            <TooltipTrigger asChild>
              <div className="border rounded-lg p-4 bg-card card-hover animate-fade-up" style={{ animationDelay: '150ms' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  <span className="text-[10px] uppercase tracking-widest text-destructive font-medium">Erros Hoje</span>
                </div>
                <div className="text-lg font-bold font-mono text-foreground">{stats.errorsToday.toLocaleString()}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">Quantidade de falhas nas operações</p></TooltipContent>
          </ShadTooltip>
        </div>
      </div>

      {/* Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <SparklineCard title="Requisições Hoje" value={stats.requestsToday} icon={Globe} trend={0} sparkData={requestSparkline.length > 1 ? requestSparkline : [0, 0]} color={COLORS.request} />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: '260ms' }}>
          <SparklineCard title="Erros Hoje" value={stats.errorsToday} icon={AlertTriangle} trend={0} sparkData={errorSparkline.length > 1 ? errorSparkline : [0, 0]} color={COLORS.error} />
        </div>
        <ShadTooltip>
          <TooltipTrigger asChild>
            <div className="animate-fade-up" style={{ animationDelay: '320ms' }}>
              <div className="border rounded-lg p-4 bg-card card-hover" style={{ borderTopWidth: '2px', borderTopColor: COLORS.job }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Jobs Processados</span>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground font-mono">{stats.jobsToday.toLocaleString()}</div>
                    <span className="text-[10px] text-muted-foreground mt-1">Taxa de sucesso: <span className="font-mono text-primary">{stats.jobSuccessRate.toFixed(0)}%</span></span>
                  </div>
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Tarefas automáticas que o sistema executou</p></TooltipContent>
        </ShadTooltip>
      </div>

      {/* Secondary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="animate-fade-up" style={{ animationDelay: '400ms' }}>
          <SparklineCard title="Total Eventos" value={stats.totalEvents} icon={Zap} trend={0} sparkData={[0, 0]} color={COLORS.request} compact />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: '450ms' }}>
          <div className={`flex items-center gap-3 border rounded-lg px-3 py-2.5 card-hover ${stats.securityAlertsToday > 0 ? 'bg-warning/5 border-warning/30' : 'bg-card'}`}>
            <Shield className={`h-3.5 w-3.5 ${stats.securityAlertsToday > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
            <span className="text-xs text-muted-foreground">Alertas Segurança</span>
            <span className={`text-sm font-bold ml-auto font-mono ${stats.securityAlertsToday > 0 ? 'text-warning' : 'text-foreground'}`}>{stats.securityAlertsToday}</span>
          </div>
        </div>
        <div className="animate-fade-up" style={{ animationDelay: '500ms' }}>
          <SparklineCard title="Adquirentes" value={stats.acquirerStats.length} icon={Server} trend={0} sparkData={[0, 0]} color={COLORS.request} compact />
        </div>
        {/* Error card - expandable */}
        <div className="animate-fade-up" style={{ animationDelay: '550ms' }}>
          {stats.errorsToday > 0 ? (
            <div className="border rounded-lg p-3 bg-destructive/5 border-destructive/20">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                <span className="text-[10px] uppercase tracking-widest text-destructive font-medium">Erros Recentes</span>
                <span className="ml-auto text-lg font-bold font-mono text-destructive">{stats.errorsToday}</span>
              </div>
              <div className="space-y-1.5">
                {stats.recentErrors.slice(0, 3).map(err => {
                  const meta = (err.meta as Record<string, unknown>) ?? {};
                  return (
                    <div key={err.id} className="flex items-center gap-2 text-[10px]">
                      <span className="text-destructive font-mono truncate flex-1">{err.summary ?? String(meta.error_code ?? '—')}</span>
                      <span className="text-muted-foreground capitalize shrink-0">{String(meta.acquirer ?? '')}</span>
                      <span className="text-muted-foreground shrink-0">{formatDistanceToNow(new Date(err.created_at), { addSuffix: true, locale: ptBR })}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <SparklineCard title="Erros" value={0} icon={AlertTriangle} trend={0} sparkData={[0, 0]} color={COLORS.error} compact />
          )}
        </div>
      </div>

      {/* Volume Chart - Requests per hour */}
      <div className="border rounded-lg p-4 bg-card mb-5 animate-fade-up" style={{ animationDelay: '600ms' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Volume de Requisições por Hora</span>
          <div className="flex gap-1">
            {periods.map(p => (
              <button key={p} onClick={() => setChartPeriod(p)}
                className={`px-2.5 py-1 text-[10px] rounded-full font-medium transition-colors ${
                  chartPeriod === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}>{p}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mb-3">
          {[
            { key: "requests", label: "Requisições", color: COLORS.request },
            { key: "errors", label: "Erros", color: COLORS.error },
          ].map(({ key, label, color }) => (
            <button key={key} onClick={() => toggleSeries(key)}
              className={`flex items-center gap-1.5 text-[10px] transition-opacity ${hiddenSeries.has(key) ? "opacity-30" : "opacity-100"}`}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={stats.hourlyData}>
            <defs>
              <linearGradient id="gradRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.request} stopOpacity={0.15} />
                <stop offset="95%" stopColor={COLORS.request} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradErrors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.error} stopOpacity={0.15} />
                <stop offset="95%" stopColor={COLORS.error} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 12%)" />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(220, 10%, 50%)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(220, 10%, 50%)' }} />
            <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(220, 14%, 7%)', border: '1px solid hsl(220, 12%, 12%)', borderRadius: '8px', fontSize: '11px' }} />
            {!hiddenSeries.has("requests") && (
              <Area type="monotone" dataKey="requests" name="Requisições" stroke={COLORS.request} fill="url(#gradRequests)" strokeWidth={2} />
            )}
            {!hiddenSeries.has("errors") && (
              <Area type="monotone" dataKey="errors" name="Erros" stroke={COLORS.error} fill="url(#gradErrors)" strokeWidth={1.5} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Errors per hour chart */}
      <div className="border rounded-lg p-4 bg-card mb-8 animate-fade-up" style={{ animationDelay: '700ms' }}>
        <span className="text-[10px] uppercase tracking-widest text-destructive font-medium">Erros por Hora</span>
        <ResponsiveContainer width="100%" height={180} className="mt-3">
          <AreaChart data={stats.hourlyData}>
            <defs>
              <linearGradient id="gradErrorsOnly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.error} stopOpacity={0.2} />
                <stop offset="95%" stopColor={COLORS.error} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 12%)" />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(220, 10%, 50%)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(220, 10%, 50%)' }} />
            <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(220, 14%, 7%)', border: '1px solid hsl(220, 12%, 12%)', borderRadius: '8px', fontSize: '11px' }} />
            <Area type="monotone" dataKey="errors" name="Erros" stroke={COLORS.error} fill="url(#gradErrorsOnly)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Feed + Providers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 animate-fade-up" style={{ animationDelay: '800ms' }}>
          <RecentActivityFeed />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: '850ms' }}>
          <ProviderHealth />
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
};

export default DashboardOverview;
