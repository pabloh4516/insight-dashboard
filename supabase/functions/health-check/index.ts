import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HEALTH_URL = 'https://api.sellxpay.com.br/api/v1/health';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const token = Deno.env.get('GATEWAY_HEALTH_TOKEN');
  if (!token) {
    return new Response(JSON.stringify({
      isUp: false, status: null, statusCode: null, checks: null,
      error: 'GATEWAY_HEALTH_TOKEN not configured',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // Get project_id from request body
  let projectId: string | null = null;
  try {
    const body = await req.json();
    projectId = body?.project_id ?? null;
  } catch { /* no body */ }

  let result: { isUp: boolean; status: string | null; statusCode: number | null; checks: unknown };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(HEALTH_URL, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const statusCode = response.status;
    let body: Record<string, unknown> = {};
    try { body = await response.json(); } catch { await response.text(); }

    const status = (body.status as string) ?? null;
    const isUp = statusCode === 200 && status !== 'down';

    result = { isUp, status, statusCode, checks: body.checks ?? null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    result = { isUp: false, status: null, statusCode: null, checks: null };

    if (projectId) await persistHealthCheck(projectId, result);

    return new Response(JSON.stringify({ ...result, error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (projectId) await persistHealthCheck(projectId, result);

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

async function persistHealthCheck(
  projectId: string,
  result: { isUp: boolean; status: string | null; statusCode: number | null; checks: unknown }
) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, serviceRoleKey);

    await sb.from('health_check_log').insert({
      project_id: projectId,
      is_up: result.isUp,
      status: result.status,
      status_code: result.statusCode,
      checks: result.checks,
    });
  } catch (e) {
    console.error('Failed to persist health check:', e);
  }
}
