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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // TODO: Replace with actual MyCashbacks API call
    // const MYCASHBACKS_API_KEY = Deno.env.get("MYCASHBACKS_API_KEY");
    // const MYCASHBACKS_API_URL = Deno.env.get("MYCASHBACKS_API_URL");
    //
    // const response = await fetch(`${MYCASHBACKS_API_URL}/stores`, {
    //   headers: { "Authorization": `Bearer ${MYCASHBACKS_API_KEY}` },
    // });
    // const apiStores = await response.json();
    //
    // For each store from the API:
    // - Upsert into stores table (match by mycashbacks_store_id)
    // - Preserve local is_active flag
    //
    // Example upsert pattern:
    // for (const store of apiStores) {
    //   await supabase.from("stores").upsert({
    //     mycashbacks_store_id: store.id,
    //     name: store.name,
    //     slug: store.slug,
    //     logo_url: store.logo_url,
    //     category: store.category,
    //     cashback_rate: store.cashback_rate,
    //     website_url: store.website_url,
    //     terms: store.terms,
    //   }, { onConflict: "mycashbacks_store_id" });
    // }

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Sync function ready. Configure MYCASHBACKS_API_KEY and MYCASHBACKS_API_URL to enable.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
