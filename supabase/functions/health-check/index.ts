import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HEALTH_URL = 'https://app.sellxpay.com.br/api/v1/health';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(HEALTH_URL, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const isUp = response.status === 200;
    await response.text(); // consume body

    return new Response(JSON.stringify({ isUp, statusCode: response.status }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ isUp: false, statusCode: null, error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
