import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HealthCheckState {
  isUp: boolean | null; // null = not checked yet
  statusCode: number | null;
  lastCheckedAt: string | null;
  error: string | null;
}

const POLL_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

export function useHealthCheck() {
  const [state, setState] = useState<HealthCheckState>({
    isUp: null,
    statusCode: null,
    lastCheckedAt: null,
    error: null,
  });
  const prevIsUp = useRef<boolean | null>(null);

  const check = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('health-check');
      if (error) {
        setState({ isUp: false, statusCode: null, lastCheckedAt: new Date().toISOString(), error: error.message });
        return;
      }
      const isUp = data?.isUp === true;
      const statusCode = data?.statusCode ?? null;
      setState({ isUp, statusCode, lastCheckedAt: new Date().toISOString(), error: null });

      // Notify on status change: was UP, now DOWN
      if (prevIsUp.current === true && !isUp) {
        try {
          await supabase.functions.invoke('notify-status-change', {
            body: { status: 'DOWN', statusCode, checkedAt: new Date().toISOString() },
          });
        } catch { /* best effort */ }
      }
      prevIsUp.current = isUp;
    } catch (err) {
      setState({ isUp: false, statusCode: null, lastCheckedAt: new Date().toISOString(), error: String(err) });
    }
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [check]);

  return state;
}
