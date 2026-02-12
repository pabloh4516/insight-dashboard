import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HealthChecks {
  database: { status: string; latency_ms: number } | null;
  redis: { status: string; latency_ms: number } | null;
  queue: { status: string; failed_jobs: number } | null;
  lastTransaction: { minutes_ago: number } | null;
  acquirers: Array<{ name: string; failure_rate: number }>;
}

export interface HealthCheckState {
  isUp: boolean | null;
  status: 'operational' | 'degraded' | 'down' | null;
  statusCode: number | null;
  lastCheckedAt: string | null;
  error: string | null;
  checks: HealthChecks | null;
}

const POLL_INTERVAL_MS = 2 * 60 * 1000;

function parseChecks(raw: Record<string, unknown> | null): HealthChecks | null {
  if (!raw) return null;
  const db = raw.database as Record<string, unknown> | undefined;
  const redis = raw.redis as Record<string, unknown> | undefined;
  const queue = raw.queue as Record<string, unknown> | undefined;
  const lastTx = raw.last_transaction as Record<string, unknown> | undefined;
  const acqs = raw.acquirers as Array<Record<string, unknown>> | undefined;

  return {
    database: db ? { status: String(db.status ?? ''), latency_ms: Number(db.latency_ms ?? 0) } : null,
    redis: redis ? { status: String(redis.status ?? ''), latency_ms: Number(redis.latency_ms ?? 0) } : null,
    queue: queue ? { status: String(queue.status ?? ''), failed_jobs: Number(queue.failed_jobs ?? 0) } : null,
    lastTransaction: lastTx ? { minutes_ago: Number(lastTx.minutes_ago ?? 0) } : null,
    acquirers: Array.isArray(acqs)
      ? acqs.map(a => ({ name: String(a.name ?? ''), failure_rate: Number(a.failure_rate ?? 0) }))
      : [],
  };
}

export function useHealthCheck() {
  const [state, setState] = useState<HealthCheckState>({
    isUp: null,
    status: null,
    statusCode: null,
    lastCheckedAt: null,
    error: null,
    checks: null,
  });
  const prevStatus = useRef<string | null>(null);

  const check = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('health-check');
      if (error) {
        setState({ isUp: false, status: null, statusCode: null, lastCheckedAt: new Date().toISOString(), error: error.message, checks: null });
        notifyIfNeeded(null);
        return;
      }
      const isUp = data?.isUp === true;
      const status = (['operational', 'degraded', 'down'].includes(data?.status) ? data.status : null) as HealthCheckState['status'];
      const statusCode = data?.statusCode ?? null;
      const checks = parseChecks(data?.checks ?? null);

      setState({ isUp, status, statusCode, lastCheckedAt: new Date().toISOString(), error: null, checks });
      notifyIfNeeded(status);
    } catch (err) {
      setState({ isUp: false, status: null, statusCode: null, lastCheckedAt: new Date().toISOString(), error: String(err), checks: null });
      notifyIfNeeded(null);
    }
  }, []);

  function notifyIfNeeded(newStatus: string | null) {
    const wasOk = prevStatus.current === 'operational';
    const isDown = newStatus === 'down' || newStatus === null;
    if (wasOk && isDown) {
      supabase.functions.invoke('notify-status-change', {
        body: { status: 'DOWN', statusCode: null, checkedAt: new Date().toISOString() },
      }).catch(() => {});
    }
    prevStatus.current = newStatus;
  }

  useEffect(() => {
    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [check]);

  return state;
}
