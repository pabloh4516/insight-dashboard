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

  // Validate each event
  const validTypes = ["request", "error", "job", "email", "webhook_in", "webhook_out", "login"];
  const validStatuses = ["success", "warning", "error"];

  const rows = eventsArray.map((evt) => {
    if (!validTypes.includes(evt.type)) {
      throw new Error(`Invalid type: ${evt.type}`);
    }
    if (!validStatuses.includes(evt.status)) {
      throw new Error(`Invalid status: ${evt.status}`);
    }
    return {
      project_id: project.id,
      type: evt.type,
      status: evt.status,
      summary: evt.summary?.slice(0, 1000) || null,
      meta: evt.meta || null,
    };
  });

  try {
    // Validate rows before insert
    for (const row of rows) {
      if (!row.type || !row.status) {
        throw new Error("Each event must have type and status");
      }
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

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
