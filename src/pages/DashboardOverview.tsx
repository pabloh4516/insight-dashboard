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
      <PageHeader title="Dashboard" icon={LayoutDashboard} subtitle="System monitoring overview" />

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatusCard title="Requests" value={stats.requests} icon={Globe} color="cyan" />
        <StatusCard title="Client Req." value={stats.clientRequests} icon={Send} color="cyan" />
        <StatusCard title="Jobs" value={stats.jobs} icon={Briefcase} color="green" />
        <StatusCard title="Exceptions" value={stats.exceptions} icon={AlertTriangle} color="red" subtitle={`${stats.errorRate}% error rate`} />
        <StatusCard title="Queries" value={stats.queries} icon={Database} color="magenta" subtitle={`${stats.slowQueries} slow`} />
        <StatusCard title="Logs" value={stats.logs} icon={FileText} color="yellow" />
        <StatusCard title="Mail" value={stats.mails} icon={Mail} color="cyan" />
        <StatusCard title="Events" value={stats.events} icon={Zap} color="green" />
        <StatusCard title="Cache" value={stats.cache} icon={HardDrive} color="magenta" />
        <StatusCard title="Commands" value={stats.commands} icon={Terminal} color="yellow" />
      </div>

      {/* Health Indicators */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="border rounded-lg p-4 bg-card glow-red">
          <div className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-1">Error Rate</div>
          <div className="text-xl font-display font-bold text-neon-red">{stats.errorRate}%</div>
        </div>
        <div className="border rounded-lg p-4 bg-card glow-magenta">
          <div className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-1">Slow Queries</div>
          <div className="text-xl font-display font-bold text-neon-magenta">{stats.slowQueries}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card glow-red">
          <div className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-1">Failed Jobs</div>
          <div className="text-xl font-display font-bold text-neon-red">{stats.failedJobs}</div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="border rounded-lg p-4 bg-card glow-cyan mb-6">
        <div className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-4">Activity — Last 24h</div>
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
            <Area type="monotone" dataKey="requests" stroke="hsl(185 100% 50%)" fill="hsl(185 100% 50% / 0.1)" strokeWidth={2} />
            <Area type="monotone" dataKey="jobs" stroke="hsl(120 100% 55%)" fill="hsl(120 100% 55% / 0.05)" strokeWidth={1.5} />
            <Area type="monotone" dataKey="exceptions" stroke="hsl(0 100% 55%)" fill="hsl(0 100% 55% / 0.1)" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardOverview;
