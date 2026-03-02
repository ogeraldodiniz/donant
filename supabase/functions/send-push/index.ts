import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// -----------------------------------------------------------------------------
// Web Push helpers: base64UrlToUint8Array, importVapidKeys, uint8ToBase64Url, createJWT, encryptPayload, sendWebPush
// -----------------------------------------------------------------------------

function base64UrlToUint8Array(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob(b64 + pad);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function importVapidKeys(publicKeyB64: string, privateKeyB64: string) {
  const pubRaw = base64UrlToUint8Array(publicKeyB64);
  const privRaw = base64UrlToUint8Array(privateKeyB64);

  const publicKey = await crypto.subtle.importKey(
    "raw", pubRaw, { name: "ECDSA", namedCurve: "P-256" }, true, []
  );

  // VAPID private keys are 32-byte raw EC scalars — wrap into PKCS#8 for crypto.subtle
  let pkcs8Key: ArrayBuffer;
  if (privRaw.length === 32) {
    // PKCS#8 wrapper for a P-256 EC private key (raw 32-byte scalar)
    const pkcs8Header = new Uint8Array([
      0x30, 0x41, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07,
      0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08,
      0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, 0x04,
      0x27, 0x30, 0x25, 0x02, 0x01, 0x01, 0x04, 0x20,
    ]);
    const pkcs8 = new Uint8Array(pkcs8Header.length + 32);
    pkcs8.set(pkcs8Header, 0);
    pkcs8.set(privRaw, pkcs8Header.length);
    pkcs8Key = pkcs8.buffer;
  } else {
    pkcs8Key = privRaw.buffer;
  }

  const privateKey = await crypto.subtle.importKey(
    "pkcs8", pkcs8Key, { name: "ECDSA", namedCurve: "P-256" }, true, ["sign"]
  );
  const publicKeyECDH = await crypto.subtle.importKey(
    "raw", pubRaw, { name: "ECDH", namedCurve: "P-256" }, true, []
  );
  return { publicKey, privateKey, publicKeyECDH, pubRaw };
}

function uint8ToBase64Url(arr: Uint8Array): string {
  let binary = "";
  for (const byte of arr) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createJWT(
  audience: string, subject: string, privateKey: CryptoKey, pubRaw: Uint8Array
) {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + 12 * 3600, sub: subject };
  const enc = new TextEncoder();
  const headerB64 = uint8ToBase64Url(enc.encode(JSON.stringify(header)));
  const payloadB64 = uint8ToBase64Url(enc.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" }, privateKey, enc.encode(unsignedToken)
  );
  const sigBytes = new Uint8Array(signature);
  let r: Uint8Array, s: Uint8Array;
  if (sigBytes.length === 64) {
    r = sigBytes.slice(0, 32);
    s = sigBytes.slice(32);
  } else {
    const rLen = sigBytes[3];
    const rStart = 4;
    const rBytes = sigBytes.slice(rStart, rStart + rLen);
    const sLen = sigBytes[rStart + rLen + 1];
    const sStart = rStart + rLen + 2;
    const sBytes = sigBytes.slice(sStart, sStart + sLen);
    r = rBytes.length > 32 ? rBytes.slice(rBytes.length - 32) : rBytes;
    s = sBytes.length > 32 ? sBytes.slice(sBytes.length - 32) : sBytes;
    if (r.length < 32) { const p = new Uint8Array(32); p.set(r, 32 - r.length); r = p; }
    if (s.length < 32) { const p = new Uint8Array(32); p.set(s, 32 - s.length); s = p; }
  }
  const rawSig = new Uint8Array(64);
  rawSig.set(r, 0);
  rawSig.set(s, 32);
  return `${unsignedToken}.${uint8ToBase64Url(rawSig)}`;
}

async function encryptPayload(
  payload: string, p256dhB64: string, authB64: string,
  localPublicKeyECDH: CryptoKey, serverPubRaw: Uint8Array
) {
  const clientPubRaw = base64UrlToUint8Array(p256dhB64);
  const authSecret = base64UrlToUint8Array(authB64);
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]
  );
  const clientPubKey = await crypto.subtle.importKey(
    "raw", clientPubRaw, { name: "ECDH", namedCurve: "P-256" }, true, []
  );
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: clientPubKey }, localKeyPair.privateKey, 256
    )
  );
  const localPubRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", localKeyPair.publicKey)
  );
  const enc = new TextEncoder();

  async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array) {
    const key = await crypto.subtle.importKey("raw", salt, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return new Uint8Array(await crypto.subtle.sign("HMAC", key, ikm));
  }
  async function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number) {
    const key = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const infoAndOne = new Uint8Array(info.length + 1);
    infoAndOne.set(info);
    infoAndOne[info.length] = 1;
    const output = new Uint8Array(await crypto.subtle.sign("HMAC", key, infoAndOne));
    return output.slice(0, length);
  }
  function concatUint8(...arrays: Uint8Array[]) {
    const totalLen = arrays.reduce((sum, a) => sum + a.length, 0);
    const result = new Uint8Array(totalLen);
    let offset = 0;
    for (const a of arrays) { result.set(a, offset); offset += a.length; }
    return result;
  }
  function createInfo(type: string, clientPublic: Uint8Array, serverPublic: Uint8Array) {
    const typeEnc = enc.encode(type);
    const label = enc.encode("Content-Encoding: ");
    const webpush = enc.encode("\0P-256\0");
    const clientLen = new Uint8Array(2);
    clientLen[0] = 0; clientLen[1] = clientPublic.length;
    const serverLen = new Uint8Array(2);
    serverLen[0] = 0; serverLen[1] = serverPublic.length;
    return concatUint8(label, typeEnc, enc.encode("\0"), webpush, clientLen, clientPublic, serverLen, serverPublic);
  }

  const authInfo = enc.encode("Content-Encoding: auth\0");
  const prk = await hkdfExtract(authSecret, sharedSecret);
  const ikm = await hkdfExpand(prk, authInfo, 32);
  const keyInfo = createInfo("aesgcm", clientPubRaw, localPubRaw);
  const nonceInfo = createInfo("nonce", clientPubRaw, localPubRaw);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const contentPrk2 = await hkdfExtract(salt, ikm);
  const contentKey = await hkdfExpand(contentPrk2, keyInfo, 16);
  const nonce = await hkdfExpand(contentPrk2, nonceInfo, 12);

  const payloadBytes = enc.encode(payload);
  const padded = new Uint8Array(2 + payloadBytes.length);
  padded[0] = 0;
  padded[1] = 0;
  padded.set(payloadBytes, 2);

  const cryptoKey = await crypto.subtle.importKey("raw", contentKey, { name: "AES-GCM" }, false, ["encrypt"]);
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, cryptoKey, padded)
  );
  return { encrypted, salt, localPubRaw };
}

async function sendWebPush(
  endpoint: string, p256dh: string, authKey: string, payload: object,
  vapidPublicKey: string, vapidPrivateKey: string, vapidSubject: string
) {
  const { privateKey, publicKeyECDH, pubRaw } = await importVapidKeys(vapidPublicKey, vapidPrivateKey);
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const jwt = await createJWT(audience, vapidSubject, privateKey, pubRaw);
  const vapidAuth = `vapid t=${jwt}, k=${uint8ToBase64Url(pubRaw)}`;
  const payloadStr = JSON.stringify(payload);
  const { encrypted, salt, localPubRaw } = await encryptPayload(
    payloadStr, p256dh, authKey, publicKeyECDH, pubRaw
  );
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: vapidAuth,
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aesgcm",
      Encryption: `salt=${uint8ToBase64Url(salt)}`,
      "Crypto-Key": `dh=${uint8ToBase64Url(localPubRaw)};p256ecdsa=${uint8ToBase64Url(pubRaw)}`,
      TTL: "86400",
      Urgency: "normal",
    },
    body: encrypted,
  });
  return response;
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
