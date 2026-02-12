import {
  Globe, Send, Briefcase, AlertTriangle, FileText,
  Database, Mail, Zap, HardDrive, Terminal, LayoutDashboard, Clock, Server
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { stats, activityData, sparklineData, trendData, AnyEntry } from "@/data/mockData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { useState, useMemo } from "react";
import { useRealtime } from "@/contexts/RealtimeContext";
import { SparklineCard } from "@/components/SparklineCard";
import { SystemHealthBar } from "@/components/SystemHealthBar";
import { RecentActivityFeed } from "@/components/RecentActivityFeed";
import { ProviderHealth } from "@/components/ProviderHealth";

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

      {/* Hero Section: System Health + Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
        <div className="lg:col-span-2">
          <SystemHealthBar />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-1.5 mb-1">
              <Server className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Uptime</span>
            </div>
            <div className="text-xl font-semibold font-mono text-foreground">99.2%</div>
            <span className="text-[10px] text-muted-foreground">últimos 30 dias</span>
          </div>
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Resp. Média</span>
            </div>
            <div className="text-xl font-semibold font-mono text-foreground">245ms</div>
            <span className="text-[10px] text-success">↓ 12ms vs ontem</span>
          </div>
        </div>
      </div>

      {/* Critical Metrics with Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <SparklineCard title="Requisições" value={counts.requests} icon={Globe} trend={trendData.requests} sparkData={sparklineData.requests} color="hsl(217, 91%, 60%)" />
        <SparklineCard title="Erros" value={counts.exceptions} icon={AlertTriangle} trend={trendData.exceptions} sparkData={sparklineData.exceptions} color="hsl(0, 72%, 51%)" />
        <SparklineCard title="Tarefas" value={counts.jobs} icon={Briefcase} trend={trendData.jobs} sparkData={sparklineData.jobs} color="hsl(142, 71%, 45%)" />
        <SparklineCard title="Consultas" value={counts.queries} icon={Database} trend={trendData.queries} sparkData={sparklineData.queries} color="hsl(262, 83%, 58%)" />
        <SparklineCard title="Chamadas Ext." value={counts.clientRequests} icon={Send} trend={trendData.clientRequests} sparkData={sparklineData.clientRequests} color="hsl(217, 91%, 60%)" />
        <SparklineCard title="Registros" value={counts.logs} icon={FileText} trend={trendData.logs} sparkData={sparklineData.logs} color="hsl(38, 92%, 50%)" />
      </div>

      {/* Secondary Metrics (compact) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        <SparklineCard title="E-mails" value={counts.mails} icon={Mail} trend={trendData.mails} sparkData={sparklineData.mails} color="hsl(217, 91%, 60%)" compact />
        <SparklineCard title="Eventos" value={counts.events} icon={Zap} trend={trendData.events} sparkData={sparklineData.events} color="hsl(142, 71%, 45%)" compact />
        <SparklineCard title="Cache" value={counts.cache} icon={HardDrive} trend={trendData.cache} sparkData={sparklineData.cache} color="hsl(262, 83%, 58%)" compact />
        <SparklineCard title="Comandos" value={counts.commands} icon={Terminal} trend={trendData.commands} sparkData={sparklineData.commands} color="hsl(38, 92%, 50%)" compact />
      </div>

      {/* Enhanced Chart */}
      <div className="border rounded-lg p-4 bg-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Atividade</span>
          <div className="flex gap-1">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setChartPeriod(p)}
                className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors ${
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

        {/* Interactive Legend */}
        <div className="flex gap-4 mb-3">
          {[
            { key: "requests", label: "Requisições", color: "hsl(217, 91%, 60%)" },
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
                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
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
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 16%)" />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(220 10% 50%)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(220 10% 50%)' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220 14% 9%)',
                border: '1px solid hsl(220 14% 16%)',
                borderRadius: '6px',
                fontSize: '11px',
              }}
            />
            <ReferenceLine y={avgRequests} stroke="hsl(220 10% 30%)" strokeDasharray="4 4" label={{ value: `média: ${avgRequests}`, position: "right", fontSize: 9, fill: "hsl(220 10% 40%)" }} />
            {!hiddenSeries.has("requests") && (
              <Area type="monotone" dataKey="requests" name="Requisições" stroke="hsl(217, 91%, 60%)" fill="url(#gradRequests)" strokeWidth={2} />
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

      {/* Activity Feed + Provider Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <RecentActivityFeed />
        </div>
        <ProviderHealth />
      </div>
    </div>
  );
};

export default DashboardOverview;
