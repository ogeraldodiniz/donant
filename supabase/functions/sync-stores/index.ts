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
  domain?: string;
  url?: string;
  logo_url?: string;
  status?: string;
  published?: boolean;
  network_description?: string;
  network_program_id?: string | number;
  categories?: Array<{ name?: string; id?: number }> | string[];
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

async function getMycToken(apiUrl: string): Promise<string> {
  const username = Deno.env.get("MYCASHBACKS_USERNAME")!;
  const password = Deno.env.get("MYCASHBACKS_PASSWORD")!;
  const appId = Deno.env.get("MYCASHBACKS_APP_ID")!;

  const authUrl = `${apiUrl}/api/auth`;
  console.log(`Auth URL: ${authUrl}`);

  const payload = {
    user_name: username,
    password: password,
    application_id: appId,
  };
  console.log("Auth payload:", JSON.stringify({ user_name: username, application_id: appId }));

  const res = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`MyCashbacks auth failed [${res.status}]: ${body}`);
  }

  const data = await res.json();
  return data.token;
}

async function fetchAllPrograms(apiUrl: string, token: string): Promise<MycProgram[]> {
  const allPrograms: MycProgram[] = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const fullUrl = `${apiUrl}/api/programs/search`;
    console.log(`Fetching programs (offset=${offset}) from ${fullUrl}...`);
    const res = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-myc-access-token": token,
        "x-myc-ambiente": "10",
      },
      body: JSON.stringify({
        query: {},
        limit,
        offset,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Programs fetch failed [${res.status}]: ${body}`);
    }

    const result = await res.json();
    if (offset === 0) {
      const sample = Array.isArray(result.data) ? result.data[0] : null;
      console.log("SAMPLE PROGRAM RAW:", JSON.stringify(sample));
      console.log("META:", JSON.stringify(result.meta));
    }
    const programs: MycProgram[] = Array.isArray(result.data)
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

async function fetchAllCashbackContracts(apiUrl: string, token: string): Promise<MycCashbackContract[]> {
  const allContracts: MycCashbackContract[] = [];
  let offset = 0;
  const limit = 1000;
  const fullUrl = `${apiUrl}/api/application_cashback_contracts/search`;

  while (true) {
    console.log(`Fetching cashback contracts (offset=${offset}) from ${fullUrl}...`);
    const res = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-myc-access-token": token,
        "x-myc-ambiente": "10",
      },
      body: JSON.stringify({ query: {}, limit, offset }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.warn(`Contracts fetch failed [${res.status}]: ${body.substring(0, 200)}`);
      break;
    }

    const result = await res.json();
    if (offset === 0) {
      const sample = Array.isArray(result.data) ? result.data[0] : null;
      console.log("SAMPLE CONTRACT RAW:", JSON.stringify(sample));
    }
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

    const apiUrl = Deno.env.get("MYCASHBACKS_API_URL")!.replace(/\/+$/, "");
    const requiredVars = ["MYCASHBACKS_USERNAME", "MYCASHBACKS_PASSWORD", "MYCASHBACKS_APP_ID"];
    for (const v of requiredVars) {
      if (!Deno.env.get(v)) {
        throw new Error(`Missing environment variable: ${v}`);
      }
    }

    console.log(`API Base URL: ${apiUrl}`);
    console.log("Authenticating with MyCashbacks API...");
    const token = await getMycToken(apiUrl);
    console.log("Authenticated. Fetching data...");

    const [programs, contracts] = await Promise.all([
      fetchAllPrograms(apiUrl, token),
      fetchAllCashbackContracts(apiUrl, token),
    ]);

    console.log(`Fetched ${programs.length} programs, ${contracts.length} cashback contracts`);

    // Build map: program_id -> best cashback rate
    const cashbackMap = new Map<number, number>();
    for (const c of contracts) {
      if (!c.fk_program_id) continue;
      const rate = extractCashbackRate(c);
      const existing = cashbackMap.get(c.fk_program_id) ?? 0;
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

      const websiteUrl = prog.url || (prog.domain ? `https://${prog.domain}` : null);

      const category = (() => {
        if (prog.categories && Array.isArray(prog.categories) && prog.categories.length > 0) {
          const first = prog.categories[0];
          return typeof first === "string" ? first : first?.name || null;
        }
        return prog.network_description || null;
      })();

      const cashbackRate = cashbackMap.get(prog.id) ?? 0;

      const storeData: Record<string, unknown> = {
        mycashbacks_store_id: String(prog.id),
        name,
        slug: slugify(name),
        logo_url: prog.logo_url || null,
        website_url: websiteUrl,
        category,
      };

      if (cashbackRate > 0) {
        storeData.cashback_rate = Math.round(cashbackRate * 100) / 100;
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
