import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BREVO_API = "https://api.brevo.com/v3";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const brevoKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoKey) {
      return new Response(JSON.stringify({ error: "BREVO_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, email, attributes } = await req.json();
    // action: "create_or_update" | "delete"
    // attributes: { FIRSTNAME, PHONE, CITY, STATE, GENDER, BIRTHDATE, NGO_ID, LOCALE }

    const brevoHeaders = {
      "api-key": brevoKey,
      "Content-Type": "application/json",
    };

    if (action === "delete") {
      if (!email) {
        return new Response(JSON.stringify({ error: "email required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const res = await fetch(`${BREVO_API}/contacts/${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: brevoHeaders,
      });
      // 204 = success, 404 = already gone
      if (res.ok || res.status === 204 || res.status === 404) {
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const txt = await res.text();
      return new Response(JSON.stringify({ error: txt }), {
        status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: create or update
    if (!email) {
      return new Response(JSON.stringify({ error: "email required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch(`${BREVO_API}/contacts`, {
      method: "POST",
      headers: brevoHeaders,
      body: JSON.stringify({
        email,
        attributes: attributes || {},
        updateEnabled: true, // updates if contact already exists
      }),
    });

    if (res.ok || res.status === 201 || res.status === 204) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const txt = await res.text();
    console.error("[brevo-sync] Error:", res.status, txt);
    return new Response(JSON.stringify({ error: txt }), {
      status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[brevo-sync] Exception:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
