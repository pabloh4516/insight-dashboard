import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { status, statusCode, checkedAt } = await req.json();

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const NOTIFICATION_EMAIL_TO = Deno.env.get('NOTIFICATION_EMAIL_TO');
    const NOTIFICATION_EMAIL_FROM = Deno.env.get('NOTIFICATION_EMAIL_FROM') || 'alertas@resend.dev';

    if (!RESEND_API_KEY || !NOTIFICATION_EMAIL_TO) {
      console.warn('Email notification skipped: RESEND_API_KEY or NOTIFICATION_EMAIL_TO not configured');
      return new Response(JSON.stringify({ sent: false, reason: 'missing_config' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subject = status === 'DOWN'
      ? `🔴 ALERTA: Gateway OFFLINE (HTTP ${statusCode ?? 'N/A'})`
      : `🟢 Gateway voltou ao normal`;

    const html = `
      <h2>${subject}</h2>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>HTTP Code:</strong> ${statusCode ?? 'N/A'}</p>
      <p><strong>Verificado em:</strong> ${checkedAt}</p>
      <p>Este é um alerta automático do seu painel de monitoramento.</p>
    `;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: NOTIFICATION_EMAIL_FROM,
        to: [NOTIFICATION_EMAIL_TO],
        subject,
        html,
      }),
    });

    const emailData = await emailRes.json();

    if (!emailRes.ok) {
      console.error('Resend API error:', emailData);
      return new Response(JSON.stringify({ sent: false, error: emailData }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ sent: true, id: emailData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Notification error:', message);
    return new Response(JSON.stringify({ sent: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
