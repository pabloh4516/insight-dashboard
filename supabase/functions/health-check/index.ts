import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
      isUp: false,
      status: null,
      statusCode: null,
      checks: null,
      error: 'GATEWAY_HEALTH_TOKEN not configured',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(HEALTH_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const statusCode = response.status;

    let body: Record<string, unknown> = {};
    try {
      body = await response.json();
    } catch {
      await response.text();
    }

    const status = (body.status as string) ?? null;
    const isUp = statusCode === 200 && status !== 'down';

    return new Response(JSON.stringify({
      isUp,
      status,
      statusCode,
      checks: body.checks ?? null,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      isUp: false,
      status: null,
      statusCode: null,
      checks: null,
      error: message,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
