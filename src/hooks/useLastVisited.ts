import { useCallback, useState } from 'react';

const STORAGE_KEY = 'telescope_last_visited';

type LastVisitedMap = Record<string, string>;

function loadMap(): LastVisitedMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMap(map: LastVisitedMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function useLastVisited() {
  const [map, setMap] = useState<LastVisitedMap>(loadMap);

  const markVisited = useCallback((eventType: string) => {
    const now = new Date().toISOString();
    setMap(prev => {
      const next = { ...prev, [eventType]: now };
      saveMap(next);
      return next;
    });
  }, []);

  const getLastVisited = useCallback((eventType: string): string | null => {
    return map[eventType] ?? null;
  }, [map]);

  return { markVisited, getLastVisited };
}

// Map routes to event types
export const routeToEventType: Record<string, string> = {
  '/': 'total',
  '/events': 'payment',
  '/requests': 'request',
  '/exceptions': 'exception',
  '/queries': 'query',
  '/jobs': 'job',
  '/mails': 'email',
  '/cache': 'cache',
  '/commands': 'command',
  '/security': 'security',
  '/logins': 'login',
  '/config-changes': 'config_change',
  '/webhooks-in': 'webhook_in',
  '/webhooks-out': 'webhook_out',
  '/acquirer-switch': 'acquirer_switch',
};
