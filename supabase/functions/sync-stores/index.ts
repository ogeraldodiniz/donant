import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MycProgram {
  id: number;
  name: string;
  display_name?: string;
  url?: string;
  logo_url?: string;
  status?: string;
  published?: boolean;
  network_description?: string;
  details?: Record<string, unknown>;
}

async function getMycToken(): Promise<string> {
  const apiUrl = Deno.env.get("MYCASHBACKS_API_URL")!.replace(/\/+$/, "");
  const username = Deno.env.get("MYCASHBACKS_USERNAME")!;
  const password = Deno.env.get("MYCASHBACKS_PASSWORD")!;
  const appId = Deno.env.get("MYCASHBACKS_APP_ID")!;

  const authUrl = `${apiUrl}/api/auth`;
  console.log("DEBUG authUrl =", authUrl, "| apiUrl =", apiUrl);

  const res = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_name: username,
      password: password,
      application_id: appId,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`MyCashbacks auth failed [${res.status}]: ${body}`);
  }

  const data = await res.json();
  console.log("Auth response keys:", Object.keys(data));
  console.log("Auth response:", JSON.stringify(data).substring(0, 500));
  return data.token;
}

async function fetchAllPrograms(token: string): Promise<MycProgram[]> {
  const apiUrl = Deno.env.get("MYCASHBACKS_API_URL")!;
  const allPrograms: MycProgram[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const res = await fetch(`${apiUrl}/api/programs/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-myc-access-token": token,
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        limit,
        offset,
        query: {},
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Programs search failed [${res.status}]: ${body}`);
    }

    const result = await res.json();
    const programs: MycProgram[] = result.data ?? [];
    allPrograms.push(...programs);

    const total = result.meta?.total ?? 0;
    offset += limit;
    if (offset >= total || programs.length === 0) break;
  }

  return allPrograms;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check required env vars
    const requiredVars = ["MYCASHBACKS_API_URL", "MYCASHBACKS_USERNAME", "MYCASHBACKS_PASSWORD", "MYCASHBACKS_APP_ID"];
    for (const v of requiredVars) {
      if (!Deno.env.get(v)) {
        throw new Error(`Missing environment variable: ${v}`);
      }
    }

    console.log("Authenticating with MyCashbacks API...");
    const token = await getMycToken();
    console.log("Authenticated. Fetching programs...");

    const programs = await fetchAllPrograms(token);
    console.log(`Fetched ${programs.length} programs from MyCashbacks`);

    let upserted = 0;
    let skipped = 0;

    for (const prog of programs) {
      const name = prog.display_name || prog.name;
      if (!name) { skipped++; continue; }

      const storeData = {
        mycashbacks_store_id: String(prog.id),
        name,
        slug: slugify(name),
        logo_url: prog.logo_url || null,
        website_url: prog.url || null,
        category: prog.network_description || null,
        // Don't overwrite cashback_rate or terms — those are managed locally or via contracts
      };

      const { error } = await supabase
        .from("stores")
        .upsert(storeData, { onConflict: "mycashbacks_store_id" });

      if (error) {
        console.error(`Error upserting store ${name}:`, error.message);
        skipped++;
      } else {
        upserted++;
      }
    }

    console.log(`Sync complete: ${upserted} upserted, ${skipped} skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        total_fetched: programs.length,
        upserted,
        skipped,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
