import { useMemo } from 'react';
import { useSupabaseEvents, DbEvent } from '@/hooks/useSupabaseEvents';
import { useProject } from '@/contexts/ProjectContext';
import { startOfDay, startOfHour, format, subDays, subHours } from 'date-fns';

function getMetaField(event: DbEvent, field: string): unknown {
  const meta = event.meta as Record<string, unknown> | null;
  return meta?.[field] ?? null;
}

function getAmount(event: DbEvent): number {
  const amount = getMetaField(event, 'amount');
  return typeof amount === 'number' ? amount : 0;
}

function getAcquirer(event: DbEvent): string | null {
  const acq = getMetaField(event, 'acquirer');
  return typeof acq === 'string' ? acq : null;
}

export interface HourlyDataPoint {
  hour: string;
  payments: number;
  withdrawals: number;
  paymentAmount: number;
  withdrawalAmount: number;
}

export interface AcquirerStat {
  name: string;
  count: number;
  successRate: number;
  totalAmount: number;
}

export interface GatewayStats {
  paymentsToday: number;
  withdrawalsToday: number;
  testsToday: number;
  errorsToday: number;
  totalReceivedToday: number;
  totalWithdrawnToday: number;
  totalEvents: number;
  hourlyData: HourlyDataPoint[];
  cumulativeData: { hour: string; total: number }[];
  acquirerStats: AcquirerStat[];
  recentEvents: DbEvent[];
  allEvents: DbEvent[];
  isLoading: boolean;
  refetch: () => void;
}

type PeriodKey = '1h' | '6h' | '24h' | '7d';

export function useGatewayStats(period: PeriodKey = '24h'): GatewayStats {
  const { selectedProject } = useProject();
  const projectId = selectedProject?.id ?? null;

  const from = useMemo(() => {
    const now = new Date();
    switch (period) {
      case '1h': return subHours(now, 1).toISOString();
      case '6h': return subHours(now, 6).toISOString();
      case '24h': return subHours(now, 24).toISOString();
      case '7d': return subDays(now, 7).toISOString();
    }
  }, [period]);

  const { events, isLoading, refetch } = useSupabaseEvents({ projectId, from });

  return useMemo(() => {
    const todayStart = startOfDay(new Date()).toISOString();
    const todayEvents = events.filter(e => e.created_at >= todayStart);

    const paymentsToday = todayEvents.filter(e => e.type === 'payment').length;
    const withdrawalsToday = todayEvents.filter(e => e.type === 'withdrawal').length;
    const testsToday = todayEvents.filter(e => e.type === 'test').length;
    const errorsToday = todayEvents.filter(e => e.status === 'error').length;

    const totalReceivedToday = todayEvents
      .filter(e => e.type === 'payment')
      .reduce((sum, e) => sum + getAmount(e), 0);

    const totalWithdrawnToday = todayEvents
      .filter(e => e.type === 'withdrawal')
      .reduce((sum, e) => sum + getAmount(e), 0);

    // Hourly data
    const hourMap = new Map<string, HourlyDataPoint>();
    for (const e of events) {
      const hourKey = format(startOfHour(new Date(e.created_at)), 'HH:mm');
      if (!hourMap.has(hourKey)) {
        hourMap.set(hourKey, { hour: hourKey, payments: 0, withdrawals: 0, paymentAmount: 0, withdrawalAmount: 0 });
      }
      const point = hourMap.get(hourKey)!;
      if (e.type === 'payment') {
        point.payments++;
        point.paymentAmount += getAmount(e);
      } else if (e.type === 'withdrawal') {
        point.withdrawals++;
        point.withdrawalAmount += getAmount(e);
      }
    }
    const hourlyData = Array.from(hourMap.values()).sort((a, b) => a.hour.localeCompare(b.hour));

    // Cumulative
    let cumTotal = 0;
    const cumulativeData = hourlyData.map(h => {
      cumTotal += h.paymentAmount;
      return { hour: h.hour, total: cumTotal };
    });

    // Acquirer stats
    const acqMap = new Map<string, { count: number; success: number; totalAmount: number }>();
    for (const e of events) {
      const acq = getAcquirer(e);
      if (!acq) continue;
      if (!acqMap.has(acq)) acqMap.set(acq, { count: 0, success: 0, totalAmount: 0 });
      const stat = acqMap.get(acq)!;
      stat.count++;
      if (e.status === 'success') stat.success++;
      stat.totalAmount += getAmount(e);
    }
    const acquirerStats: AcquirerStat[] = Array.from(acqMap.entries()).map(([name, s]) => ({
      name,
      count: s.count,
      successRate: s.count > 0 ? (s.success / s.count) * 100 : 0,
      totalAmount: s.totalAmount,
    }));

    return {
      paymentsToday,
      withdrawalsToday,
      testsToday,
      errorsToday,
      totalReceivedToday,
      totalWithdrawnToday,
      totalEvents: events.length,
      hourlyData,
      cumulativeData,
      acquirerStats,
      recentEvents: events.slice(0, 10),
      allEvents: events,
      isLoading,
      refetch,
    };
  }, [events, isLoading, refetch]);
}
