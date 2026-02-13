import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/contexts/ProjectContext';
import { startOfHour, addHours } from 'date-fns';

export interface HealthCheckEntry {
  timestamp: string;
  status: 'operational' | 'degraded' | 'down' | null;
  isUp: boolean;
}

export interface HealthChecks {
  php: { status: string; version: string; memory_usage_mb: number; memory_limit: string } | null;
  database: { status: string; latency_ms: number; driver: string; connections: { active: number; max: number; percent: number } } | null;
  redis: { status: string; latency_ms: number } | null;
  queue: { status: string; pending_jobs: number; failed_jobs: number } | null;
  storage: { status: string; writable: boolean } | null;
  lastTransaction: { status: string; last_at: string | null; minutes_ago: number } | null;
  acquirers: Array<{ name: string; slug: string; status: string; transactions_24h: number; success_rate: number; failure_rate: number; last_transaction_at: string | null }>;
}

export interface HealthCheckState {
  isUp: boolean | null;
  status: 'operational' | 'degraded' | 'down' | null;
  statusCode: number | null;
  lastCheckedAt: string | null;
  error: string | null;
  checks: HealthChecks | null;
  history: HealthCheckEntry[];
}

const DEFAULT_POLL_INTERVAL_MS = 2 * 60 * 1000;
const MAX_HISTORY = 30;

function getHourBounds() {
  const now = new Date();
  const start = startOfHour(now);
  const end = addHours(start, 1);
  return { start, end };
}

function slotIndex(timestamp: string, hourStart: Date): number {
  const diff = new Date(timestamp).getTime() - hourStart.getTime();
  return Math.floor(diff / (2 * 60 * 1000));
}

function deduplicateBySlot(entries: HealthCheckEntry[], hourStart: Date): HealthCheckEntry[] {
  const slotMap = new Map<number, HealthCheckEntry>();
  for (const entry of entries) {
    const slot = slotIndex(entry.timestamp, hourStart);
    if (slot >= 0 && slot < 30) {
      slotMap.set(slot, entry); // keep latest (entries are ordered asc)
    }
  }
  // Return in slot order
  const result: HealthCheckEntry[] = [];
  for (let i = 0; i < 30; i++) {
    const e = slotMap.get(i);
    if (e) result.push(e);
  }
  return result;
}

function parseChecks(raw: Record<string, unknown> | null): HealthChecks | null {
  if (!raw) return null;
  const php = raw.php as Record<string, unknown> | undefined;
  const db = raw.database as Record<string, unknown> | undefined;
  const redis = raw.redis as Record<string, unknown> | undefined;
  const queue = raw.queue as Record<string, unknown> | undefined;
  const storage = raw.storage as Record<string, unknown> | undefined;
  const lastTx = raw.last_transaction as Record<string, unknown> | undefined;
  const acqs = raw.acquirers as Array<Record<string, unknown>> | undefined;
  const dbConns = db?.connections as Record<string, unknown> | undefined;

  return {
    php: php ? { status: String(php.status ?? ''), version: String(php.version ?? ''), memory_usage_mb: Number(php.memory_usage_mb ?? 0), memory_limit: String(php.memory_limit ?? '') } : null,
    database: db ? {
      status: String(db.status ?? ''),
      latency_ms: Number(db.latency_ms ?? 0),
      driver: String(db.driver ?? ''),
      connections: dbConns ? { active: Number(dbConns.active ?? 0), max: Number(dbConns.max ?? 0), percent: Number(dbConns.percent ?? 0) } : { active: 0, max: 0, percent: 0 },
    } : null,
    redis: redis ? { status: String(redis.status ?? ''), latency_ms: Number(redis.latency_ms ?? 0) } : null,
    queue: queue ? { status: String(queue.status ?? ''), pending_jobs: Number(queue.pending_jobs ?? 0), failed_jobs: Number(queue.failed_jobs ?? 0) } : null,
    storage: storage ? { status: String(storage.status ?? ''), writable: Boolean(storage.writable) } : null,
    lastTransaction: lastTx ? { status: String(lastTx.status ?? ''), last_at: lastTx.last_at ? String(lastTx.last_at) : null, minutes_ago: Number(lastTx.minutes_ago ?? 0) } : null,
    acquirers: Array.isArray(acqs)
      ? acqs.map(a => ({
          name: String(a.name ?? ''),
          slug: String(a.slug ?? ''),
          status: String(a.status ?? ''),
          transactions_24h: Number(a.transactions_24h ?? 0),
          success_rate: Number(a.success_rate ?? 0),
          failure_rate: Number(a.failure_rate ?? 0),
          last_transaction_at: a.last_transaction_at ? String(a.last_transaction_at) : null,
        }))
      : [],
  };
}

function playAlertSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'square';
    gain.gain.value = 0.15;
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch { /* ignore */ }
}

function sendBrowserNotification(title: string, body: string) {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(p => {
      if (p === 'granted') new Notification(title, { body, icon: '/favicon.ico' });
    });
  }
}

export function useHealthCheck() {
  const { selectedProject } = useProject();
  const projectId = selectedProject?.id ?? null;

  const pollIntervalMs = (selectedProject?.polling_interval_seconds ?? 120) * 1000;

  const [state, setState] = useState<HealthCheckState>({
    isUp: null, status: null, statusCode: null, lastCheckedAt: null, error: null, checks: null, history: [],
  });
  const prevStatus = useRef<string | null>(null);

  // Load persisted history on mount / project change
  useEffect(() => {
    if (!projectId) return;

    (async () => {
      const { start } = getHourBounds();

      const { data } = await supabase
        .from('health_check_log' as any)
        .select('checked_at, is_up, status')
        .eq('project_id', projectId)
        .gte('checked_at', start.toISOString())
        .order('checked_at', { ascending: true })
        .limit(100);

      if (data && data.length > 0) {
        const entries: HealthCheckEntry[] = (data as any[]).map(row => ({
          timestamp: row.checked_at,
          status: (['operational', 'degraded', 'down'].includes(row.status) ? row.status : null) as HealthCheckEntry['status'],
          isUp: row.is_up,
        }));
        setState(prev => ({ ...prev, history: deduplicateBySlot(entries, start) }));
      } else {
        setState(prev => ({ ...prev, history: [] }));
      }
    })();
  }, [projectId]);

  const check = useCallback(async () => {
    const now = new Date();
    const nowIso = now.toISOString();
    const { start } = getHourBounds();

    try {
      const { data, error } = await supabase.functions.invoke('health-check', {
        body: projectId ? { project_id: projectId } : {},
      });

      if (error) {
        const entry: HealthCheckEntry = { timestamp: nowIso, status: null, isUp: false };
        setState(prev => {
          const newHistory = deduplicateBySlot([...prev.history, entry], start);
          return { isUp: false, status: null, statusCode: null, lastCheckedAt: nowIso, error: error.message, checks: null, history: newHistory };
        });
        handleStatusChange(null);
        return;
      }

      const isUp = data?.isUp === true;
      const status = (['operational', 'degraded', 'down'].includes(data?.status) ? data.status : null) as HealthCheckState['status'];
      const statusCode = data?.statusCode ?? null;
      const checks = parseChecks(data?.checks ?? null);
      const entry: HealthCheckEntry = { timestamp: nowIso, status, isUp };

      setState(prev => {
        // If we crossed an hour boundary, reset history
        const prevEntries = prev.history.length > 0 && slotIndex(prev.history[0].timestamp, start) < 0 ? [] : prev.history;
        const newHistory = deduplicateBySlot([...prevEntries, entry], start);
        return { isUp, status, statusCode, lastCheckedAt: nowIso, error: null, checks, history: newHistory };
      });
      handleStatusChange(status);
    } catch (err) {
      const entry: HealthCheckEntry = { timestamp: nowIso, status: null, isUp: false };
      setState(prev => {
        const newHistory = deduplicateBySlot([...prev.history, entry], start);
        return { isUp: false, status: null, statusCode: null, lastCheckedAt: nowIso, error: String(err), checks: null, history: newHistory };
      });
      handleStatusChange(null);
    }
  }, [projectId]);

  function handleStatusChange(newStatus: string | null) {
    const wasOk = prevStatus.current === 'operational';
    const isDown = newStatus === 'down' || newStatus === null;
    const isDegraded = newStatus === 'degraded';

    if (wasOk && (isDown || isDegraded)) {
      const msg = isDown ? 'Gateway está OFFLINE!' : 'Gateway está degradado.';
      sendBrowserNotification('⚠️ Alerta do Gateway', msg);
      playAlertSound();
      // Email notifications are now handled by the backend cron job
    }
    prevStatus.current = newStatus;
  }

  useEffect(() => {
    check();
    const interval = setInterval(check, pollIntervalMs);
    const onVisibility = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onVisibility); };
  }, [check, pollIntervalMs]);

  return { ...state, recheckNow: check, pollIntervalMs };
}
