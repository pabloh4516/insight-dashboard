import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const HEALTH_URL = 'https://api.sellxpay.com.br/api/v1/health';
const REMINDER_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

serve(async (_req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const healthToken = Deno.env.get('GATEWAY_HEALTH_TOKEN');

  if (!healthToken) {
    console.error('GATEWAY_HEALTH_TOKEN not configured');
    return new Response(JSON.stringify({ error: 'missing token' }), { status: 500 });
  }

  const sb = createClient(supabaseUrl, serviceRoleKey);

  // Fetch all projects
  const { data: projects, error: projErr } = await sb.from('projects').select('id');
  if (projErr || !projects || projects.length === 0) {
    console.log('No projects found or error:', projErr?.message);
    return new Response(JSON.stringify({ checked: 0 }));
  }

  const now = new Date();
  const nowIso = now.toISOString();
  let checked = 0;

  // Call the health endpoint once (it's the same gateway for all projects)
  let healthResult: { isUp: boolean; status: string | null; statusCode: number | null; checks: unknown };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(HEALTH_URL, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${healthToken}`, 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const statusCode = response.status;
    let body: Record<string, unknown> = {};
    try { body = await response.json(); } catch { await response.text(); }

    const status = (body.status as string) ?? null;
    const isUp = statusCode === 200 && status !== 'down';

    healthResult = { isUp, status, statusCode, checks: body.checks ?? null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Health check fetch failed:', message);
    healthResult = { isUp: false, status: null, statusCode: null, checks: null };
  }

  const currentStatus = healthResult.status ?? (healthResult.isUp ? 'operational' : 'down');

  for (const project of projects) {
    const projectId = project.id;
    checked++;

    // Persist health check log
    await sb.from('health_check_log').insert({
      project_id: projectId,
      is_up: healthResult.isUp,
      status: healthResult.status,
      status_code: healthResult.statusCode,
      checks: healthResult.checks,
    });

    // Get or create tracker
    const { data: tracker } = await sb
      .from('health_status_tracker')
      .select('*')
      .eq('project_id', projectId)
      .single();

    const previousStatus = tracker?.last_status ?? 'operational';
    const lastNotifiedAt = tracker?.last_notified_at ? new Date(tracker.last_notified_at) : null;

    let shouldNotify = false;
    let notifyReason = '';

    // Status changed
    if (currentStatus !== previousStatus) {
      shouldNotify = true;
      notifyReason = `status_change: ${previousStatus} -> ${currentStatus}`;
    }
    // Still down/degraded and 1h since last notification
    else if (
      (currentStatus === 'down' || currentStatus === 'degraded') &&
      (!lastNotifiedAt || (now.getTime() - lastNotifiedAt.getTime()) >= REMINDER_INTERVAL_MS)
    ) {
      shouldNotify = true;
      notifyReason = `reminder: still ${currentStatus}`;
    }

    if (shouldNotify) {
      console.log(`Notifying for project ${projectId}: ${notifyReason}`);

      const notifyStatus = currentStatus === 'down' ? 'DOWN'
        : currentStatus === 'degraded' ? 'DEGRADED'
        : 'OPERATIONAL';

      // Call notify-status-change edge function
      try {
        const notifyUrl = `${supabaseUrl}/functions/v1/notify-status-change`;
        const notifyRes = await fetch(notifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            status: notifyStatus,
            statusCode: healthResult.statusCode,
            checkedAt: nowIso,
            project_id: projectId,
          }),
        });
        const notifyData = await notifyRes.json();
        console.log(`Notify result for ${projectId}:`, notifyData);
      } catch (e) {
        console.error(`Failed to notify for ${projectId}:`, e);
      }

      // Upsert tracker
      await sb.from('health_status_tracker').upsert({
        project_id: projectId,
        last_status: currentStatus,
        last_notified_at: nowIso,
        updated_at: nowIso,
      }, { onConflict: 'project_id' });
    } else {
      // Update tracker status without changing last_notified_at
      await sb.from('health_status_tracker').upsert({
        project_id: projectId,
        last_status: currentStatus,
        updated_at: nowIso,
        ...(tracker?.last_notified_at ? { last_notified_at: tracker.last_notified_at } : {}),
      }, { onConflict: 'project_id' });
    }
  }

  return new Response(JSON.stringify({ checked, status: currentStatus, timestamp: nowIso }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
