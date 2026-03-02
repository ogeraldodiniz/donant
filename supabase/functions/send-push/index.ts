import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Web Push helpers ----------------------------------------------------------

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
    "raw",
    pubRaw,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    []
  );

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privRaw,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign"]
  );

  // Also import public as ECDH for key agreement
  const publicKeyECDH = await crypto.subtle.importKey(
    "raw",
    pubRaw,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );

  return { publicKey, privateKey, publicKeyECDH, pubRaw };
}

function uint8ToBase64Url(arr: Uint8Array): string {
  let binary = "";
  for (const byte of arr) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createJWT(
  audience: string,
  subject: string,
  privateKey: CryptoKey,
  pubRaw: Uint8Array
) {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + 12 * 3600, sub: subject };

  const enc = new TextEncoder();
  const headerB64 = uint8ToBase64Url(enc.encode(JSON.stringify(header)));
  const payloadB64 = uint8ToBase64Url(enc.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    enc.encode(unsignedToken)
  );

  // Convert DER to raw r||s (64 bytes)
  const sigBytes = new Uint8Array(signature);
  let r: Uint8Array, s: Uint8Array;
  if (sigBytes.length === 64) {
    r = sigBytes.slice(0, 32);
    s = sigBytes.slice(32);
  } else {
    // DER format
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
  payload: string,
  p256dhB64: string,
  authB64: string,
  localPublicKeyECDH: CryptoKey,
  serverPubRaw: Uint8Array
) {
  const clientPubRaw = base64UrlToUint8Array(p256dhB64);
  const authSecret = base64UrlToUint8Array(authB64);

  // Generate local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  const clientPubKey = await crypto.subtle.importKey(
    "raw",
    clientPubRaw,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );

  // Shared secret via ECDH
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: clientPubKey },
      localKeyPair.privateKey,
      256
    )
  );

  const localPubRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", localKeyPair.publicKey)
  );

  const enc = new TextEncoder();

  // HKDF helpers
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

  // IKM from auth
  const authInfo = enc.encode("Content-Encoding: auth\0");
  const prk = await hkdfExtract(authSecret, sharedSecret);
  const ikm = await hkdfExpand(prk, authInfo, 32);

  // Key and nonce
  const keyInfo = createInfo("aesgcm", clientPubRaw, localPubRaw);
  const nonceInfo = createInfo("nonce", clientPubRaw, localPubRaw);

  const contentPrk = await hkdfExtract(authSecret, ikm);
  // Actually we need to use the salt for content encryption
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const contentPrk2 = await hkdfExtract(salt, ikm);
  const contentKey = await hkdfExpand(contentPrk2, keyInfo, 16);
  const nonce = await hkdfExpand(contentPrk2, nonceInfo, 12);

  // Pad payload
  const payloadBytes = enc.encode(payload);
  const paddingLen = 0;
  const padded = new Uint8Array(2 + paddingLen + payloadBytes.length);
  padded[0] = 0;
  padded[1] = 0;
  padded.set(payloadBytes, 2 + paddingLen);

  const cryptoKey = await crypto.subtle.importKey("raw", contentKey, { name: "AES-GCM" }, false, ["encrypt"]);
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, cryptoKey, padded)
  );

  return { encrypted, salt, localPubRaw };
}

async function sendWebPush(
  endpoint: string,
  p256dh: string,
  authKey: string,
  payload: object,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
) {
  const { privateKey, publicKeyECDH, pubRaw } = await importVapidKeys(vapidPublicKey, vapidPrivateKey);

  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const jwt = await createJWT(audience, vapidSubject, privateKey, pubRaw);
  const vapidAuth = `vapid t=${jwt}, k=${uint8ToBase64Url(pubRaw)}`;

  const payloadStr = JSON.stringify(payload);

  // Use aesgcm encryption
  const { encrypted, salt, localPubRaw } = await encryptPayload(
    payloadStr,
    p256dh,
    authKey,
    publicKeyECDH,
    pubRaw
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

// Main handler ---------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate admin
    const authHeader = req.headers.get("authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (!roleData || roleData.length === 0) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { title, body, url } = await req.json();
    if (!title) {
      return new Response(JSON.stringify({ error: "Título é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const vapidPublicKey = "BJkEEqX8DmY0AkSp1ffwvMTqrQdE852M4KmYhI2z2mwSGCbKWCEVvRCjQrgwZfoeZo3IemSUgalu43tTJUOrCwk";
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const vapidSubject = Deno.env.get("VAPID_SUBJECT")!;

    // Get all subscriptions
    const { data: subs, error: subsErr } = await adminClient
      .from("push_subscriptions")
      .select("*");

    if (subsErr) throw subsErr;

    // Get distinct user_ids to insert notifications
    const userIds = [...new Set((subs || []).map((s: { user_id: string | null }) => s.user_id).filter(Boolean))] as string[];

    // Insert in-app notifications for each user
    if (userIds.length > 0) {
      const notifRows = userIds.map((uid: string) => ({
        user_id: uid,
        title,
        body: body || "",
        type: "general" as const,
      }));
      await adminClient.from("notifications").insert(notifRows);
    }

    // Send push to each subscription
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const sub of (subs || [])) {
      try {
        const res = await sendWebPush(
          sub.endpoint,
          sub.p256dh,
          sub.auth_key,
          { title, body: body || "", url: url || "/notificacoes" },
          vapidPublicKey,
          vapidPrivateKey,
          vapidSubject
        );
        if (res.ok || res.status === 201) {
          sent++;
        } else {
          failed++;
          const text = await res.text();
          errors.push(`${res.status}: ${text.slice(0, 100)}`);
          // Remove expired/invalid subscriptions
          if (res.status === 404 || res.status === 410) {
            await adminClient.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          }
        }
      } catch (e) {
        failed++;
        errors.push(String(e).slice(0, 100));
      }
    }

    return new Response(
      JSON.stringify({ sent, failed, total: (subs || []).length, errors: errors.slice(0, 5) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
