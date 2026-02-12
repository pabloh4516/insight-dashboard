import {
  LayoutDashboard, CreditCard, ArrowDownToLine, AlertTriangle, Zap, TestTube, DollarSign, Activity, Clock, Server
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageHeader } from "@/components/PageHeader";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState, useMemo } from "react";
import { SparklineCard } from "@/components/SparklineCard";
import { SystemHealthBar } from "@/components/SystemHealthBar";
import { RecentActivityFeed } from "@/components/RecentActivityFeed";
import { ProviderHealth } from "@/components/ProviderHealth";
import { useGatewayStats } from "@/hooks/useGatewayStats";

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const periods = ["1h", "6h", "24h", "7d"] as const;
type PeriodKey = typeof periods[number];

const COLORS = {
  payment: "hsl(160, 84%, 39%)",
  withdrawal: "hsl(38, 92%, 50%)",
  error: "hsl(0, 72%, 51%)",
  test: "hsl(220, 10%, 50%)",
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

  // Sparkline data from hourly
  const paymentSparkline = useMemo(() => stats.hourlyData.map(h => h.payments), [stats.hourlyData]);
  const withdrawalSparkline = useMemo(() => stats.hourlyData.map(h => h.withdrawals), [stats.hourlyData]);
  const amountSparkline = useMemo(() => stats.hourlyData.map(h => h.paymentAmount), [stats.hourlyData]);

  const pieData = useMemo(() => [
    { name: 'Pagamentos', value: stats.paymentsToday, color: COLORS.payment },
    { name: 'Saques', value: stats.withdrawalsToday, color: COLORS.withdrawal },
  ].filter(d => d.value > 0), [stats.paymentsToday, stats.withdrawalsToday]);

  return (
    <div>
      <PageHeader title="Painel Geral" icon={LayoutDashboard} subtitle="Gateway de Pagamento — Monitoramento em tempo real" />

      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 animate-fade-up">
          <SystemHealthBar />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-card card-hover animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Recebido Hoje</span>
            </div>
            <div className="text-lg font-bold font-mono text-foreground">{formatBRL(stats.totalReceivedToday)}</div>
          </div>
          <div className="border rounded-lg p-4 bg-card card-hover animate-fade-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowDownToLine className="h-3.5 w-3.5 text-warning" />
              <span className="text-[10px] uppercase tracking-widest text-warning font-medium">Sacado Hoje</span>
            </div>
            <div className="text-lg font-bold font-mono text-foreground">{formatBRL(stats.totalWithdrawnToday)}</div>
          </div>
        </div>
      </div>

      {/* Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <SparklineCard title="Pagamentos Hoje" value={stats.paymentsToday} icon={CreditCard} trend={0} sparkData={paymentSparkline.length > 1 ? paymentSparkline : [0, 0]} color={COLORS.payment} />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: '260ms' }}>
          <SparklineCard title="Saques Hoje" value={stats.withdrawalsToday} icon={ArrowDownToLine} trend={0} sparkData={withdrawalSparkline.length > 1 ? withdrawalSparkline : [0, 0]} color={COLORS.withdrawal} />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: '320ms' }}>
          <SparklineCard title="Valor Recebido" value={stats.totalReceivedToday} icon={DollarSign} trend={0} sparkData={amountSparkline.length > 1 ? amountSparkline : [0, 0]} color={COLORS.payment} />
        </div>
      </div>

      {/* Secondary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { title: "Total Eventos", value: stats.totalEvents, icon: Zap, color: COLORS.payment },
          { title: "Testes", value: stats.testsToday, icon: TestTube, color: COLORS.test },
          { title: "Adquirentes", value: stats.acquirerStats.length, icon: Server, color: COLORS.payment },
        ].map((card, i) => (
          <div key={card.title} className="animate-fade-up" style={{ animationDelay: `${400 + i * 50}ms` }}>
            <SparklineCard title={card.title} value={card.value} icon={card.icon} trend={0} sparkData={[0, 0]} color={card.color} compact />
          </div>
        ))}
        {/* Error card - expandable */}
        <div className="animate-fade-up" style={{ animationDelay: '550ms' }}>
          {stats.errorsToday > 0 ? (
            <div className="border rounded-lg p-3 bg-destructive/5 border-destructive/20">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                <span className="text-[10px] uppercase tracking-widest text-destructive font-medium">Erros Hoje</span>
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

      {/* Volume Chart */}
      <div className="border rounded-lg p-4 bg-card mb-5 animate-fade-up" style={{ animationDelay: '600ms' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Volume por Hora</span>
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
            { key: "payments", label: "Pagamentos", color: COLORS.payment },
            { key: "withdrawals", label: "Saques", color: COLORS.withdrawal },
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
              <linearGradient id="gradPayments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.payment} stopOpacity={0.15} />
                <stop offset="95%" stopColor={COLORS.payment} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradWithdrawals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.withdrawal} stopOpacity={0.15} />
                <stop offset="95%" stopColor={COLORS.withdrawal} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 12%)" />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(220, 10%, 50%)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(220, 10%, 50%)' }} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(220, 14%, 7%)', border: '1px solid hsl(220, 12%, 12%)', borderRadius: '8px', fontSize: '11px' }} />
            {!hiddenSeries.has("payments") && (
              <Area type="monotone" dataKey="payments" name="Pagamentos" stroke={COLORS.payment} fill="url(#gradPayments)" strokeWidth={2} />
            )}
            {!hiddenSeries.has("withdrawals") && (
              <Area type="monotone" dataKey="withdrawals" name="Saques" stroke={COLORS.withdrawal} fill="url(#gradWithdrawals)" strokeWidth={1.5} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative + Proportion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 border rounded-lg p-4 bg-card animate-fade-up" style={{ animationDelay: '700ms' }}>
          <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Valor Acumulado (R$)</span>
          <ResponsiveContainer width="100%" height={200} className="mt-3">
            <AreaChart data={stats.cumulativeData}>
              <defs>
                <linearGradient id="gradCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.payment} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS.payment} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 12%)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(220, 10%, 50%)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(220, 10%, 50%)' }} tickFormatter={(v) => `R$${v}`} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(220, 14%, 7%)', border: '1px solid hsl(220, 12%, 12%)', borderRadius: '8px', fontSize: '11px' }} formatter={(value: number) => [formatBRL(value), 'Total']} />
              <Area type="monotone" dataKey="total" stroke={COLORS.payment} fill="url(#gradCumulative)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="border rounded-lg p-4 bg-card animate-fade-up" style={{ animationDelay: '750ms' }}>
          <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Proporção</span>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200} className="mt-3">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(220, 14%, 7%)', border: '1px solid hsl(220, 12%, 12%)', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-xs">Sem dados</div>
          )}
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
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
  );
};

export default DashboardOverview;
