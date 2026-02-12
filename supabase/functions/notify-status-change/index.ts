import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { status, statusCode, checkedAt, project_id, test_email } = await req.json();

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const NOTIFICATION_EMAIL_FROM = Deno.env.get('NOTIFICATION_EMAIL_FROM') || 'alertas@resend.dev';

    if (!RESEND_API_KEY) {
      console.warn('Email notification skipped: RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ sent: false, reason: 'missing_resend_key' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If test_email is provided, send only to that address
    let recipients: string[] = [];

    if (test_email) {
      recipients = [test_email];
    } else {
      // Fetch active emails from notification_emails table
      if (project_id) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const sb = createClient(supabaseUrl, supabaseKey);

        const { data: rows } = await sb
          .from('notification_emails')
          .select('email')
          .eq('project_id', project_id)
          .eq('enabled', true);

        if (rows && rows.length > 0) {
          recipients = rows.map((r: { email: string }) => r.email);
        }
      }

      // Fallback to secret
      if (recipients.length === 0) {
        const fallback = Deno.env.get('NOTIFICATION_EMAIL_TO');
        if (fallback) recipients = [fallback];
      }
    }

    if (recipients.length === 0) {
      console.warn('No recipients configured');
      return new Response(JSON.stringify({ sent: false, reason: 'no_recipients' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isTest = status === 'TEST';
    const subject = isTest
      ? '🔔 Teste de notificação do Telescope'
      : status === 'DOWN'
        ? `🔴 ALERTA: Gateway OFFLINE (HTTP ${statusCode ?? 'N/A'})`
        : status === 'DEGRADED'
          ? `🟡 Gateway degradado`
          : `🟢 Gateway voltou ao normal`;

    const html = isTest
      ? `<h2>Teste de Notificação</h2><p>Este é um email de teste do seu painel Telescope.</p><p><strong>Verificado em:</strong> ${checkedAt}</p>`
      : `<h2>${subject}</h2><p><strong>Status:</strong> ${status}</p><p><strong>HTTP Code:</strong> ${statusCode ?? 'N/A'}</p><p><strong>Verificado em:</strong> ${checkedAt}</p><p>Este é um alerta automático do seu painel de monitoramento.</p>`;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: NOTIFICATION_EMAIL_FROM,
        to: recipients,
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

    return new Response(JSON.stringify({ sent: true, id: emailData.id, recipients: recipients.length }), {
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
