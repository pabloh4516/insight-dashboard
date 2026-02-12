import {
  Globe, Send, Briefcase, AlertTriangle, FileText,
  Database, Mail, Zap, HardDrive, Terminal, LayoutDashboard, Clock, Server
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { stats, activityData, sparklineData, trendData, AnyEntry } from "@/data/mockData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useState, useMemo } from "react";
import { useRealtime } from "@/contexts/RealtimeContext";
import { SparklineCard } from "@/components/SparklineCard";
import { SystemHealthBar } from "@/components/SystemHealthBar";
import { RecentActivityFeed } from "@/components/RecentActivityFeed";
import { ProviderHealth } from "@/components/ProviderHealth";

const emerald = "hsl(160, 84%, 39%)";

const DashboardOverview = () => {
  const { liveEntries, isLive } = useRealtime();
  const [chartPeriod, setChartPeriod] = useState<"1h" | "6h" | "24h" | "7d">("24h");
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const counts = useMemo(() => {
    const allEntries = isLive ? liveEntries : [];
    const typeCounts: Record<string, number> = {
      request: 0, client_request: 0, job: 0, exception: 0, log: 0,
      query: 0, mail: 0, event: 0, cache: 0, command: 0,
    };
    allEntries.forEach(e => { typeCounts[e.type]++; });

    return {
      requests: stats.requests + typeCounts.request,
      clientRequests: stats.clientRequests + typeCounts.client_request,
      jobs: stats.jobs + typeCounts.job,
      exceptions: stats.exceptions + typeCounts.exception,
      logs: stats.logs + typeCounts.log,
      queries: stats.queries + typeCounts.query,
      mails: stats.mails + typeCounts.mail,
      events: stats.events + typeCounts.event,
      cache: stats.cache + typeCounts.cache,
      commands: stats.commands + typeCounts.command,
      failedJobs: (isLive ? liveEntries.filter((e: AnyEntry) => e.type === 'job' && 'status' in e && e.status === 'failed').length : 0),
    };
  }, [liveEntries, isLive]);

  const filteredChartData = useMemo(() => {
    const sliceMap = { "1h": 1, "6h": 6, "24h": 24, "7d": 24 };
    return activityData.slice(-sliceMap[chartPeriod]);
  }, [chartPeriod]);

  const avgRequests = useMemo(() => {
    const data = filteredChartData;
    return Math.round(data.reduce((sum, d) => sum + d.requests, 0) / data.length);
  }, [filteredChartData]);

  const toggleSeries = (dataKey: string) => {
    setHiddenSeries(prev => {
      const next = new Set(prev);
      if (next.has(dataKey)) next.delete(dataKey);
      else next.add(dataKey);
      return next;
    });
  };

  const periods = ["1h", "6h", "24h", "7d"] as const;

  return (
    <div>
      <PageHeader title="Painel Geral" icon={LayoutDashboard} subtitle="Visão geral do sistema" />

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 animate-fade-up">
          <SystemHealthBar />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-card card-hover animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Server className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Uptime</span>
            </div>
            <div className="text-xl font-bold font-mono text-foreground">99.2%</div>
            <span className="text-[10px] text-muted-foreground">últimos 30 dias</span>
          </div>
          <div className="border rounded-lg p-4 bg-card card-hover animate-fade-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Resp. Média</span>
            </div>
            <div className="text-xl font-bold font-mono text-foreground">245ms</div>
            <span className="text-[10px] text-primary">↓ 12ms vs ontem</span>
          </div>
        </div>
      </div>

      {/* Critical Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {[
          { title: "Requisições", value: counts.requests, icon: Globe, trend: trendData.requests, data: sparklineData.requests, color: emerald },
          { title: "Erros", value: counts.exceptions, icon: AlertTriangle, trend: trendData.exceptions, data: sparklineData.exceptions, color: "hsl(0, 72%, 51%)" },
          { title: "Tarefas", value: counts.jobs, icon: Briefcase, trend: trendData.jobs, data: sparklineData.jobs, color: "hsl(142, 71%, 45%)" },
          { title: "Consultas", value: counts.queries, icon: Database, trend: trendData.queries, data: sparklineData.queries, color: "hsl(262, 83%, 58%)" },
          { title: "Chamadas Ext.", value: counts.clientRequests, icon: Send, trend: trendData.clientRequests, data: sparklineData.clientRequests, color: emerald },
          { title: "Registros", value: counts.logs, icon: FileText, trend: trendData.logs, data: sparklineData.logs, color: "hsl(38, 92%, 50%)" },
        ].map((card, i) => (
          <div key={card.title} className="animate-fade-up" style={{ animationDelay: `${200 + i * 60}ms` }}>
            <SparklineCard title={card.title} value={card.value} icon={card.icon} trend={card.trend} sparkData={card.data} color={card.color} />
          </div>
        ))}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { title: "E-mails", value: counts.mails, icon: Mail, trend: trendData.mails, data: sparklineData.mails, color: emerald },
          { title: "Eventos", value: counts.events, icon: Zap, trend: trendData.events, data: sparklineData.events, color: "hsl(142, 71%, 45%)" },
          { title: "Cache", value: counts.cache, icon: HardDrive, trend: trendData.cache, data: sparklineData.cache, color: "hsl(262, 83%, 58%)" },
          { title: "Comandos", value: counts.commands, icon: Terminal, trend: trendData.commands, data: sparklineData.commands, color: "hsl(38, 92%, 50%)" },
        ].map((card, i) => (
          <div key={card.title} className="animate-fade-up" style={{ animationDelay: `${560 + i * 50}ms` }}>
            <SparklineCard title={card.title} value={card.value} icon={card.icon} trend={card.trend} sparkData={card.data} color={card.color} compact />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="border rounded-lg p-4 bg-card mb-8 animate-fade-up" style={{ animationDelay: '700ms' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Atividade</span>
          <div className="flex gap-1">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setChartPeriod(p)}
                className={`px-2.5 py-1 text-[10px] rounded-full font-medium transition-colors ${
                  chartPeriod === p
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mb-3">
          {[
            { key: "requests", label: "Requisições", color: emerald },
            { key: "jobs", label: "Tarefas", color: "hsl(142, 71%, 45%)" },
            { key: "exceptions", label: "Erros", color: "hsl(0, 72%, 51%)" },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => toggleSeries(key)}
              className={`flex items-center gap-1.5 text-[10px] transition-opacity ${
                hiddenSeries.has(key) ? "opacity-30" : "opacity-100"
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={filteredChartData}>
            <defs>
              <linearGradient id="gradRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={emerald} stopOpacity={0.15} />
                <stop offset="95%" stopColor={emerald} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradJobs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.1} />
                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradExceptions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.1} />
                <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 12% 12%)" />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(220 10% 50%)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(220 10% 50%)' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220 14% 7%)',
                border: '1px solid hsl(220 12% 12%)',
                borderRadius: '8px',
                fontSize: '11px',
              }}
            />
            <ReferenceLine y={avgRequests} stroke="hsl(220 10% 25%)" strokeDasharray="4 4" label={{ value: `média: ${avgRequests}`, position: "right", fontSize: 9, fill: "hsl(220 10% 40%)" }} />
            {!hiddenSeries.has("requests") && (
              <Area type="monotone" dataKey="requests" name="Requisições" stroke={emerald} fill="url(#gradRequests)" strokeWidth={2} />
            )}
            {!hiddenSeries.has("jobs") && (
              <Area type="monotone" dataKey="jobs" name="Tarefas" stroke="hsl(142, 71%, 45%)" fill="url(#gradJobs)" strokeWidth={1.5} />
            )}
            {!hiddenSeries.has("exceptions") && (
              <Area type="monotone" dataKey="exceptions" name="Erros" stroke="hsl(0, 72%, 51%)" fill="url(#gradExceptions)" strokeWidth={1.5} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Activity Feed + Providers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 animate-fade-up" style={{ animationDelay: '800ms' }}>
          <RecentActivityFeed />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: '850ms' }}>
          <ProviderHealth />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
