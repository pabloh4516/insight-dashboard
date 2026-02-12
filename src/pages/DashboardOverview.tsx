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
      request: 0,
      client_request: 0,
      job: 0,
      exception: 0,
      log: 0,
      query: 0,
      mail: 0,
      event: 0,
      cache: 0,
      command: 0,
    };

    allEntries.forEach(e => {
      typeCounts[e.type]++;
    });

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
        <div className="border rounded-lg p-4 bg-card glow-red">
          <div className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-1">Taxa de Erro</div>
          <div className="text-xl font-display font-bold text-neon-red">{stats.errorRate}%</div>
        </div>
        <div className="border rounded-lg p-4 bg-card glow-magenta">
          <div className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-1">Consultas Lentas</div>
          <div className="text-xl font-display font-bold text-neon-magenta">{stats.slowQueries}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card glow-red">
        <div className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-1">Tarefas com Falha</div>
          <div className="text-xl font-display font-bold text-neon-red">{counts.failedJobs}</div>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-card glow-cyan mb-6">
        <div className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-4">Atividade — Últimas 24h</div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220 25% 7%)',
                border: '1px solid hsl(var(--neon-cyan) / 0.3)',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono',
              }}
            />
            <Area type="monotone" dataKey="requests" name="Requisições" stroke="hsl(185 100% 50%)" fill="hsl(185 100% 50% / 0.1)" strokeWidth={2} />
            <Area type="monotone" dataKey="jobs" name="Tarefas" stroke="hsl(120 100% 55%)" fill="hsl(120 100% 55% / 0.05)" strokeWidth={1.5} />
            <Area type="monotone" dataKey="exceptions" name="Erros" stroke="hsl(0 100% 55%)" fill="hsl(0 100% 55% / 0.1)" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardOverview;
