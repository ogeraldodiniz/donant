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
  network_program_id?: string;
  type?: string;
  ext_visibility?: boolean;
  fk_network_account_id?: number;
  details?: Record<string, unknown>;
}

interface MycCashbackContract {
  id: number;
  fk_program_id?: number;
  share_type?: string;
  share?: number;
  starting?: string;
  ending?: string;
  status?: string;
}

async function getMycToken(): Promise<string> {
  const apiUrl = Deno.env.get("MYCASHBACKS_API_URL")!.replace(/\/+$/, "");
  const username = Deno.env.get("MYCASHBACKS_USERNAME")!;
  const password = Deno.env.get("MYCASHBACKS_PASSWORD")!;
  const appId = Deno.env.get("MYCASHBACKS_APP_ID")!;

  const authUrl = `${apiUrl}/api/auth`;

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
  return data.token;
}

function getBaseUrl(): string {
  const rawUrl = Deno.env.get("MYCASHBACKS_API_URL")!.replace(/\/+$/, "");
  const parsed = new URL(rawUrl);
  return `${parsed.protocol}//${parsed.host}`;
}

async function fetchAllPrograms(token: string): Promise<MycProgram[]> {
  const baseUrl = getBaseUrl();
  const allPrograms: MycProgram[] = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const fullUrl = `${baseUrl}/v1/publisher/programs/search`;
    console.log(`Fetching programs (offset=${offset})...`);
    const res = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-myc-access-token": token,
      },
      body: JSON.stringify({
        query: { network_countries: { _eq: "BR" } },
        allowlistOnly: false,
        limit,
        offset,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Programs fetch failed [${res.status}]: ${body}`);
    }

    const result = await res.json();
    const programs: MycProgram[] = Array.isArray(result.programs)
      ? result.programs
      : Array.isArray(result.data)
        ? result.data
        : Array.isArray(result)
          ? result
          : [];
    allPrograms.push(...programs);

    if (programs.length < limit) break;
    offset += limit;
  }

  return allPrograms;
}

async function fetchAllCashbackContracts(token: string): Promise<MycCashbackContract[]> {
  const baseUrl = getBaseUrl();
  const allContracts: MycCashbackContract[] = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    // Try multiple endpoint patterns
    const endpoints = [
      `${baseUrl}/v1/publisher/application_cashback_contracts/search`,
      `${baseUrl}/api/application_cashback_contracts/search`,
      `${baseUrl}/v1/application_cashback_contracts/search`,
    ];
    let fullUrl = endpoints[0];
    let res: Response | null = null;

    for (const ep of endpoints) {
      console.log(`Trying contracts endpoint: ${ep}`);
      const attempt = await fetch(ep, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-myc-access-token": token,
        },
        body: JSON.stringify({ query: {}, limit, offset }),
      });
      if (attempt.ok) {
        fullUrl = ep;
        res = attempt;
        console.log(`Contracts endpoint found: ${ep}`);
        break;
      }
      const errBody = await attempt.text();
      console.warn(`Endpoint ${ep} failed [${attempt.status}]: ${errBody.substring(0, 200)}`);
    }

    if (!res) {
      console.warn("No working contracts endpoint found");
      return allContracts;
    }
    console.log(`Fetching cashback contracts (offset=${offset})...`);
    const res = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-myc-access-token": token,
      },
      body: JSON.stringify({ query: {}, limit, offset }),
    });

    if (!res.ok) {
      const body = await res.text();
      // If contracts endpoint is not accessible, log and return empty
      console.warn(`Cashback contracts fetch failed [${res.status}]: ${body}`);
      return allContracts;
    }

    const result = await res.json();
    const contracts: MycCashbackContract[] = Array.isArray(result.data)
      ? result.data
      : Array.isArray(result)
        ? result
        : [];
    allContracts.push(...contracts);

    if (contracts.length < limit) break;
    offset += limit;
  }

  return allContracts;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractCashbackRate(contract: MycCashbackContract): number {
  const share = contract.share ?? 0;
  switch (contract.share_type) {
    case "factor_cashback":
    case "factor_commission":
      // These are typically percentage multipliers (e.g., 0.05 = 5%)
      return share > 1 ? share : share * 100;
    case "fix":
    case "factor_value":
      return share;
    case "full_commission":
      return 100;
    default:
      return share;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requiredVars = ["MYCASHBACKS_API_URL", "MYCASHBACKS_USERNAME", "MYCASHBACKS_PASSWORD", "MYCASHBACKS_APP_ID"];
    for (const v of requiredVars) {
      if (!Deno.env.get(v)) {
        throw new Error(`Missing environment variable: ${v}`);
      }
    }

    console.log("Authenticating with MyCashbacks API...");
    const token = await getMycToken();
    console.log("Authenticated. Fetching data...");

    // Fetch programs and contracts in parallel
    const [programs, contracts] = await Promise.all([
      fetchAllPrograms(token),
      fetchAllCashbackContracts(token),
    ]);

    console.log(`Fetched ${programs.length} programs, ${contracts.length} cashback contracts`);

    // Build a map: program_id -> best cashback rate
    const cashbackMap = new Map<number, number>();
    for (const c of contracts) {
      if (!c.fk_program_id) continue;
      const rate = extractCashbackRate(c);
      const existing = cashbackMap.get(c.fk_program_id) ?? 0;
      // Keep the highest rate for each program
      if (rate > existing) {
        cashbackMap.set(c.fk_program_id, rate);
      }
    }

    console.log(`Mapped cashback rates for ${cashbackMap.size} programs`);

    let upserted = 0;
    let skipped = 0;

    for (const prog of programs) {
      const name = prog.display_name || prog.name;
      if (!name) { skipped++; continue; }

      // Extract description from details if available
      const details = prog.details || {};
      const description = (details.short_description || details.description || details.long_description || "") as string;

      const cashbackRate = cashbackMap.get(prog.id) ?? 0;

      const storeData: Record<string, unknown> = {
        mycashbacks_store_id: String(prog.id),
        name,
        slug: slugify(name),
        logo_url: prog.logo_url || null,
        website_url: prog.url || null,
        category: prog.network_description || null,
      };

      // Only set cashback_rate if we got a value from contracts (don't overwrite manually set rates with 0)
      if (cashbackRate > 0) {
        storeData.cashback_rate = Math.round(cashbackRate * 100) / 100;
      }

      // Store description in terms if we have one and terms is empty
      if (description) {
        storeData.terms = description;
      }

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

    console.log(`Sync complete: ${upserted} upserted, ${skipped} skipped, ${cashbackMap.size} with cashback rates`);

    return new Response(
      JSON.stringify({
        success: true,
        total_programs: programs.length,
        total_contracts: contracts.length,
        programs_with_cashback: cashbackMap.size,
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
