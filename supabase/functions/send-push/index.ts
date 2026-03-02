import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// -----------------------------------------------------------------------------
// Web Push (RFC 8291 — aes128gcm)
// -----------------------------------------------------------------------------

function b64url(arr: Uint8Array): string {
  let b = "";
  for (const byte of arr) b += String.fromCharCode(byte);
  return btoa(b).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob(b64 + pad);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const len = arrays.reduce((s, a) => s + a.length, 0);
  const r = new Uint8Array(len);
  let off = 0;
  for (const a of arrays) { r.set(a, off); off += a.length; }
  return r;
}

const te = new TextEncoder();

// HMAC-SHA-256 based HKDF
async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", salt, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, ikm));
}

async function hkdfExpand(prk: Uint8Array, info: Uint8Array, len: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const t = new Uint8Array(info.length + 1);
  t.set(info); t[info.length] = 1;
  const out = new Uint8Array(await crypto.subtle.sign("HMAC", key, t));
  return out.slice(0, len);
}

// Build info for aes128gcm per RFC 8188 / 8291
function buildInfo(label: string, context: Uint8Array): Uint8Array {
  const header = te.encode("Content-Encoding: ");
  const labelBytes = te.encode(label);
  const nul = new Uint8Array([0]);
  return concat(header, labelBytes, nul, context);
}

// VAPID JWT (ES256)
async function createVapidJwt(
  audience: string, subject: string,
  privateKeyJwk: JsonWebKey, pubRaw: Uint8Array
): Promise<string> {
  const privateKey = await crypto.subtle.importKey(
    "jwk", privateKeyJwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]
  );
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + 12 * 3600, sub: subject };
  const h = b64url(te.encode(JSON.stringify(header)));
  const p = b64url(te.encode(JSON.stringify(payload)));
  const unsigned = `${h}.${p}`;
  const sig = new Uint8Array(
    await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privateKey, te.encode(unsigned))
  );
  // DER → raw r||s (64 bytes)
  let r: Uint8Array, s: Uint8Array;
  if (sig.length === 64) {
    r = sig.slice(0, 32); s = sig.slice(32);
  } else {
    const rLen = sig[3]; const rStart = 4;
    const rB = sig.slice(rStart, rStart + rLen);
    const sLen = sig[rStart + rLen + 1]; const sStart = rStart + rLen + 2;
    const sB = sig.slice(sStart, sStart + sLen);
    r = rB.length > 32 ? rB.slice(rB.length - 32) : rB;
    s = sB.length > 32 ? sB.slice(sB.length - 32) : sB;
    if (r.length < 32) { const p2 = new Uint8Array(32); p2.set(r, 32 - r.length); r = p2; }
    if (s.length < 32) { const p2 = new Uint8Array(32); p2.set(s, 32 - s.length); s = p2; }
  }
  const rawSig = new Uint8Array(64);
  rawSig.set(r, 0); rawSig.set(s, 32);
  return `${unsigned}.${b64url(rawSig)}`;
}

async function sendWebPush(
  endpoint: string, p256dh: string, authKey: string, payload: object,
  vapidPublicKey: string, vapidPrivateKey: string, vapidSubject: string
) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  try {
    const result = await webpush.sendNotification(
      {
        endpoint,
        keys: {
          p256dh,
          auth: authKey,
        },
      },
      JSON.stringify(payload),
      {
        TTL: 86400,
        urgency: "normal",
        contentEncoding: "aes128gcm",
      }
    );

    return new Response(result.body || "", { status: result.statusCode || 201 });
  } catch (err: any) {
    if (typeof err?.statusCode === "number") {
      return new Response(err?.body || err?.message || "push error", { status: err.statusCode });
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Helper: get filtered user IDs based on locale, state, city
// ---------------------------------------------------------------------------
async function getFilteredUserIds(
  adminClient: any,
  targetLocale?: string,
  targetState?: string,
  targetCity?: string
): Promise<string[] | null> {
  // null means "no filter" (all users)
  const needsFilter = targetLocale || targetState || targetCity;
  if (!needsFilter) return null;

  let query = adminClient.from("profiles").select("id");
  if (targetLocale === "pt" || targetLocale === "es") {
    query = query.eq("locale", targetLocale);
  }
  if (targetState) {
    query = query.eq("state", targetState);
  }
  if (targetCity) {
    query = query.eq("city", targetCity);
  }

  const { data } = await query;
  return (data || []).map((p: { id: string }) => p.id);
}

// Main handler ---------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles").select("role")
      .eq("user_id", user.id).eq("role", "admin");

    if (!roleData || roleData.length === 0) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { title, body, url, targetLocale, targetState, targetCity, channels } = await req.json();
    if (!title) {
      return new Response(JSON.stringify({ error: "Título é obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const activeChannels: string[] = channels || ["web_push"];

    // Get filtered user IDs
    const filteredIds = await getFilteredUserIds(adminClient, targetLocale, targetState, targetCity);

    // If filter returned empty array, no recipients
    if (filteredIds && filteredIds.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, failed: 0, total: 0, errors: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];
    let totalRecipients = 0;

    // ---- Web Push ----
    if (activeChannels.includes("web_push")) {
      let subQuery = adminClient.from("push_subscriptions").select("*");
      if (filteredIds) {
        subQuery = subQuery.in("user_id", filteredIds);
      }
      const { data: subs, error: subsErr } = await subQuery;
      if (subsErr) throw subsErr;

      const pushSubs = subs || [];
      totalRecipients += pushSubs.length;

      // Insert in-app notifications
      const userIds = [...new Set(pushSubs.map((s: any) => s.user_id).filter(Boolean))] as string[];
      if (userIds.length > 0) {
        const notifRows = userIds.map((uid: string) => ({
          user_id: uid, title, body: body || "", type: "general" as const,
        }));
        await adminClient.from("notifications").insert(notifRows);
      }

      const vapidPublicKey = "BJkEEqX8DmY0AkSp1ffwvMTqrQdE852M4KmYhI2z2mwSGCbKWCEVvRCjQrgwZfoeZo3IemSUgalu43tTJUOrCwk";
      const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
      const vapidSubject = Deno.env.get("VAPID_SUBJECT")!;

      console.log(`[send-push] VAPID subject: ${vapidSubject}`);
      console.log(`[send-push] Processing ${pushSubs.length} push subscriptions`);

      for (const sub of pushSubs) {
        try {
          console.log(`[send-push] Sending to endpoint: ${sub.endpoint.slice(0, 80)}...`);
          console.log(`[send-push] p256dh length: ${sub.p256dh?.length}, auth_key length: ${sub.auth_key?.length}`);
          const res = await sendWebPush(
            sub.endpoint, sub.p256dh, sub.auth_key,
            { title, body: body || "", url: url || "/notificacoes" },
            vapidPublicKey, vapidPrivateKey, vapidSubject
          );
          console.log(`[send-push] Response status: ${res.status}`);
          if (res.ok || res.status === 201) {
            sent++;
            console.log(`[send-push] ✅ Push sent successfully`);
          } else {
            failed++;
            const text = await res.text();
            console.log(`[send-push] ❌ Push failed: ${res.status} - ${text.slice(0, 200)}`);
            errors.push(`push ${res.status}: ${text.slice(0, 100)}`);
            if (res.status === 404 || res.status === 410) {
              console.log(`[send-push] Removing stale subscription`);
              await adminClient.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
            }
          }
        } catch (e) {
          failed++;
          console.log(`[send-push] ❌ Push exception: ${String(e)}`);
          errors.push(`push: ${String(e).slice(0, 100)}`);
        }
      }
    }

    // ---- WhatsApp (Z-API) ----
    if (activeChannels.includes("whatsapp")) {
      const zapiInstanceId = Deno.env.get("ZAPI_INSTANCE_ID");
      const zapiToken = Deno.env.get("ZAPI_TOKEN");
      const zapiClientToken = Deno.env.get("ZAPI_CLIENT_TOKEN");

      if (!zapiInstanceId || !zapiToken) {
        errors.push("whatsapp: Z-API não configurado (secrets ZAPI_INSTANCE_ID e ZAPI_TOKEN necessários)");
      } else {
        let profileQuery = adminClient.from("profiles").select("id, phone, notify_whatsapp").eq("notify_whatsapp", true).not("phone", "is", null);
        if (filteredIds) {
          profileQuery = profileQuery.in("id", filteredIds);
        }
        const { data: profiles } = await profileQuery;
        const waProfiles = profiles || [];
        totalRecipients += waProfiles.length;

        for (const p of waProfiles) {
          try {
            const phone = (p.phone || "").replace(/\D/g, "");
            if (!phone) { failed++; continue; }
            const res = await fetch(`https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/send-text`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(zapiClientToken ? { "Client-Token": zapiClientToken } : {}),
              },
              body: JSON.stringify({ phone, message: `*${title}*\n${body || ""}` }),
            });
            if (res.ok) { sent++; } else { failed++; errors.push(`wa ${res.status}`); }
          } catch (e) {
            failed++;
            errors.push(`wa: ${String(e).slice(0, 80)}`);
          }
        }
      }
    }

    // ---- Email (Brevo) ----
    if (activeChannels.includes("email")) {
      const brevoKey = Deno.env.get("BREVO_API_KEY");
      const brevoSender = Deno.env.get("BREVO_SENDER_EMAIL") || "noreply@goodcause.com.br";
      const brevoSenderName = Deno.env.get("BREVO_SENDER_NAME") || "GoodCause";

      if (!brevoKey) {
        errors.push("email: Brevo não configurado (secret BREVO_API_KEY necessário)");
      } else {
        let profileQuery = adminClient.from("profiles").select("id, email, notify_email").eq("notify_email", true).not("email", "is", null);
        if (filteredIds) {
          profileQuery = profileQuery.in("id", filteredIds);
        }
        const { data: profiles } = await profileQuery;
        const emailProfiles = profiles || [];
        totalRecipients += emailProfiles.length;

        // Send in batches of 50
        const batchSize = 50;
        for (let i = 0; i < emailProfiles.length; i += batchSize) {
          const batch = emailProfiles.slice(i, i + batchSize);
          const to = batch.map((p: any) => ({ email: p.email }));
          try {
            const res = await fetch("https://api.brevo.com/v3/smtp/email", {
              method: "POST",
              headers: {
                "api-key": brevoKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sender: { name: brevoSenderName, email: brevoSender },
                to,
                subject: title,
                htmlContent: `<h2>${title}</h2><p>${body || ""}</p>`,
              }),
            });
            if (res.ok) {
              sent += batch.length;
            } else {
              failed += batch.length;
              const txt = await res.text();
              errors.push(`email ${res.status}: ${txt.slice(0, 100)}`);
            }
          } catch (e) {
            failed += batch.length;
            errors.push(`email: ${String(e).slice(0, 80)}`);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ sent, failed, total: totalRecipients, errors: errors.slice(0, 10) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
