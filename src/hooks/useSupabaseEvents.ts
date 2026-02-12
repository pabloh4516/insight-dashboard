import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DbEvent {
  id: string;
  project_id: string;
  type: string;
  status: string;
  summary: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}

interface UseSupabaseEventsOptions {
  projectId: string | null;
  type?: string;
  status?: string;
  search?: string;
  from?: string;
  to?: string;
}

export const useSupabaseEvents = (options: UseSupabaseEventsOptions) => {
  const { projectId, type, status, search, from, to } = options;
  const [liveEvents, setLiveEvents] = useState<DbEvent[]>([]);

  const query = useQuery({
    queryKey: ['events', projectId, type, status, search, from, to],
    queryFn: async () => {
      if (!projectId) return [];
      let q = supabase
        .from('events')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(500);

      if (type) q = q.eq('type', type);
      if (status) q = q.eq('status', status);
      if (search) q = q.ilike('summary', `%${search}%`);
      if (from) q = q.gte('created_at', from);
      if (to) q = q.lte('created_at', to);

      const { data, error } = await q;
      if (error) throw error;
      return data as DbEvent[];
    },
    enabled: !!projectId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!projectId) return;
    setLiveEvents([]);

    const channel = supabase
      .channel(`events-realtime-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const newEvent = payload.new as DbEvent;
          setLiveEvents(prev => [newEvent, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const allEvents = [...liveEvents, ...(query.data ?? [])];
  // Deduplicate by id
  const seen = new Set<string>();
  const dedupedEvents = allEvents.filter(e => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  const refetch = useCallback(() => {
    query.refetch();
  }, [query]);

  return {
    events: dedupedEvents,
    liveEvents,
    isLoading: query.isLoading,
    refetch,
  };
};

export const useEventCounts = (projectId: string | null) => {
  return useQuery({
    queryKey: ['event-counts', projectId],
    queryFn: async () => {
      if (!projectId) return {};
      const types = ['request', 'exception', 'query', 'job', 'email', 'cache', 'command', 'error', 'webhook_in', 'webhook_out', 'login', 'payment', 'withdrawal', 'test'];
      const counts: Record<string, number> = {};

      for (const t of types) {
        const { count } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', projectId)
          .eq('type', t);
        counts[t] = count ?? 0;
      }

      // Total
      const { count: total } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);
      counts.total = total ?? 0;

      // Errors
      const { count: errors } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .eq('status', 'error');
      counts.errors = errors ?? 0;

      return counts;
    },
    enabled: !!projectId,
    refetchInterval: 30000,
  });
};
