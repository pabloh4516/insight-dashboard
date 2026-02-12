import { useMemo } from 'react';
import { useSupabaseEvents, DbEvent } from '@/hooks/useSupabaseEvents';
import { useProject } from '@/contexts/ProjectContext';
import { startOfDay, startOfHour, format, subDays, subHours } from 'date-fns';

function getMetaField(event: DbEvent, field: string): unknown {
  const meta = event.meta as Record<string, unknown> | null;
  return meta?.[field] ?? null;
}

function getAcquirer(event: DbEvent): string | null {
  const acq = getMetaField(event, 'acquirer');
  return typeof acq === 'string' ? acq : null;
}

export interface HourlyDataPoint {
  hour: string;
  requests: number;
  errors: number;
}

export interface AcquirerStat {
  name: string;
  count: number;
  successRate: number;
  totalAmount: number;
  avgLatencyMs: number;
}

export interface GatewayStats {
  requestsToday: number;
  jobsToday: number;
  jobSuccessRate: number;
  securityAlertsToday: number;
  errorsToday: number;
  totalEvents: number;
  hourlyData: HourlyDataPoint[];
  acquirerStats: AcquirerStat[];
  recentErrors: DbEvent[];
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

    const requestsToday = todayEvents.filter(e => e.type === 'request').length;
    const jobsToday = todayEvents.filter(e => e.type === 'job').length;
    const jobsSuccessToday = todayEvents.filter(e => e.type === 'job' && e.status === 'success').length;
    const jobSuccessRate = jobsToday > 0 ? (jobsSuccessToday / jobsToday) * 100 : 0;
    const securityAlertsToday = todayEvents.filter(e => e.type === 'security').length;
    const errorsToday = todayEvents.filter(e => e.status === 'error').length;

    // Hourly data: requests and errors
    const hourMap = new Map<string, HourlyDataPoint>();
    for (const e of events) {
      const hourKey = format(startOfHour(new Date(e.created_at)), 'HH:mm');
      if (!hourMap.has(hourKey)) {
        hourMap.set(hourKey, { hour: hourKey, requests: 0, errors: 0 });
      }
      const point = hourMap.get(hourKey)!;
      if (e.type === 'request') point.requests++;
      if (e.status === 'error') point.errors++;
    }
    const hourlyData = Array.from(hourMap.values()).sort((a, b) => a.hour.localeCompare(b.hour));

    // Acquirer stats
    const acqMap = new Map<string, { count: number; success: number; totalAmount: number; totalLatency: number; latencyCount: number }>();
    for (const e of events) {
      const acq = getAcquirer(e);
      if (!acq) continue;
      if (!acqMap.has(acq)) acqMap.set(acq, { count: 0, success: 0, totalAmount: 0, totalLatency: 0, latencyCount: 0 });
      const stat = acqMap.get(acq)!;
      stat.count++;
      if (e.status === 'success') stat.success++;
      const amount = getMetaField(e, 'amount');
      if (typeof amount === 'number') stat.totalAmount += amount;
      const latency = getMetaField(e, 'response_time_ms');
      if (typeof latency === 'number') {
        stat.totalLatency += latency;
        stat.latencyCount++;
      }
    }
    const acquirerStats: AcquirerStat[] = Array.from(acqMap.entries()).map(([name, s]) => ({
      name,
      count: s.count,
      successRate: s.count > 0 ? (s.success / s.count) * 100 : 0,
      totalAmount: s.totalAmount,
      avgLatencyMs: s.latencyCount > 0 ? s.totalLatency / s.latencyCount : 0,
    }));

    const recentErrors = events.filter(e => e.status === 'error').slice(0, 5);

    return {
      requestsToday,
      jobsToday,
      jobSuccessRate,
      securityAlertsToday,
      errorsToday,
      totalEvents: events.length,
      hourlyData,
      acquirerStats,
      recentErrors,
      recentEvents: events.slice(0, 10),
      allEvents: events,
      isLoading,
      refetch,
    };
  }, [events, isLoading, refetch]);
}
