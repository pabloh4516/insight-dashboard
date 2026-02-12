import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing or invalid token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const apiToken = authHeader.replace("Bearer ", "");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Validate token
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("api_token", apiToken)
    .maybeSingle();

  if (projectError || !project) {
    return new Response(JSON.stringify({ error: "Invalid API token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { events?: Array<{ type: string; status: string; summary?: string; meta?: Record<string, unknown> }> };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const eventsArray = body.events;
  if (!Array.isArray(eventsArray) || eventsArray.length === 0) {
    return new Response(
      JSON.stringify({ error: "Body must contain a non-empty 'events' array" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Validate each event before processing
  const validStatuses = ["success", "warning", "error"];

  for (const evt of eventsArray) {
    if (!evt.type || typeof evt.type !== 'string' || evt.type.trim() === '') {
      return new Response(
        JSON.stringify({ error: "Each event must have a non-empty 'type' string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!evt.status || typeof evt.status !== 'string' || !validStatuses.includes(evt.status)) {
      return new Response(
        JSON.stringify({ error: `Invalid status: "${evt.status}". Must be one of: ${validStatuses.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  const rows = eventsArray.map((evt) => ({
    project_id: project.id,
    type: evt.type.trim(),
    status: evt.status,
    summary: evt.summary?.slice(0, 1000) || null,
    meta: evt.meta || null,
  }));

  const { error: insertError } = await supabase.from("events").insert(rows);

  if (insertError) {
    return new Response(
      JSON.stringify({ error: "Failed to insert events", detail: insertError.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({ success: true, count: rows.length }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
