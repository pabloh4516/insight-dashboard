import {
  Globe, Send, Briefcase, AlertTriangle, FileText,
  Database, Mail, Zap, HardDrive, Terminal
} from "lucide-react";
import { StatusCard } from "@/components/StatusCard";
import { PageHeader } from "@/components/PageHeader";
import { stats, activityData, AnyEntry } from "@/data/mockData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LayoutDashboard } from "lucide-react";
import { useState, useMemo } from "react";
import { useRealtime } from "@/contexts/RealtimeContext";

const DashboardOverview = () => {
  const { liveEntries, isLive } = useRealtime();

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

  return (
    <div>
      <PageHeader title="Painel Geral" icon={LayoutDashboard} subtitle="Visão geral do sistema" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatusCard title="Requisições" value={counts.requests} icon={Globe} color="cyan" />
        <StatusCard title="Chamadas Ext." value={counts.clientRequests} icon={Send} color="cyan" />
        <StatusCard title="Tarefas" value={counts.jobs} icon={Briefcase} color="green" />
        <StatusCard title="Erros" value={counts.exceptions} icon={AlertTriangle} color="red" subtitle={`${stats.errorRate}% taxa de erro`} />
        <StatusCard title="Consultas" value={counts.queries} icon={Database} color="magenta" subtitle={`${stats.slowQueries} lentas`} />
        <StatusCard title="Registros" value={counts.logs} icon={FileText} color="yellow" />
        <StatusCard title="E-mails" value={counts.mails} icon={Mail} color="cyan" />
        <StatusCard title="Eventos" value={counts.events} icon={Zap} color="green" />
        <StatusCard title="Cache" value={counts.cache} icon={HardDrive} color="magenta" />
        <StatusCard title="Comandos" value={counts.commands} icon={Terminal} color="yellow" />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-medium">Taxa de Erro</div>
          <div className="text-xl font-semibold text-error">{stats.errorRate}%</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-medium">Consultas Lentas</div>
          <div className="text-xl font-semibold text-purple-400">{stats.slowQueries}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-medium">Tarefas com Falha</div>
          <div className="text-xl font-semibold text-error">{counts.failedJobs}</div>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-card mb-6">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 font-medium">Atividade — Últimas 24h</div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 16%)" />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(220 10% 50%)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(220 10% 50%)' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220 14% 9%)',
                border: '1px solid hsl(220 14% 16%)',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: 'Inter, system-ui',
              }}
            />
            <Area type="monotone" dataKey="requests" name="Requisições" stroke="hsl(217 91% 60%)" fill="hsl(217 91% 60% / 0.1)" strokeWidth={2} />
            <Area type="monotone" dataKey="jobs" name="Tarefas" stroke="hsl(142 71% 45%)" fill="hsl(142 71% 45% / 0.05)" strokeWidth={1.5} />
            <Area type="monotone" dataKey="exceptions" name="Erros" stroke="hsl(0 72% 51%)" fill="hsl(0 72% 51% / 0.1)" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardOverview;
