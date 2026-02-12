import {
  Globe, Send, Briefcase, AlertTriangle, FileText,
  Database, Mail, Zap, HardDrive, Terminal
} from "lucide-react";
import { StatusCard } from "@/components/StatusCard";
import { PageHeader } from "@/components/PageHeader";
import { stats, activityData } from "@/data/mockData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LayoutDashboard } from "lucide-react";

const DashboardOverview = () => {
  return (
    <div>
      <PageHeader title="Painel Geral" icon={LayoutDashboard} subtitle="Visão geral do sistema" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatusCard title="Requisições" value={stats.requests} icon={Globe} color="cyan" />
        <StatusCard title="Chamadas Ext." value={stats.clientRequests} icon={Send} color="cyan" />
        <StatusCard title="Tarefas" value={stats.jobs} icon={Briefcase} color="green" />
        <StatusCard title="Erros" value={stats.exceptions} icon={AlertTriangle} color="red" subtitle={`${stats.errorRate}% taxa de erro`} />
        <StatusCard title="Consultas" value={stats.queries} icon={Database} color="magenta" subtitle={`${stats.slowQueries} lentas`} />
        <StatusCard title="Registros" value={stats.logs} icon={FileText} color="yellow" />
        <StatusCard title="E-mails" value={stats.mails} icon={Mail} color="cyan" />
        <StatusCard title="Eventos" value={stats.events} icon={Zap} color="green" />
        <StatusCard title="Cache" value={stats.cache} icon={HardDrive} color="magenta" />
        <StatusCard title="Comandos" value={stats.commands} icon={Terminal} color="yellow" />
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
          <div className="text-xl font-display font-bold text-neon-red">{stats.failedJobs}</div>
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
