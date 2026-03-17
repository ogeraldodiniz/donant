import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// -----------------------------------------------------------------------------
// Web Push via npm:web-push (handles VAPID + encryption reliably)
// -----------------------------------------------------------------------------

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

    const { title, body, url, category, targetLocale, targetState, targetCity, targetUserIds, channels } = await req.json();
    if (!title) {
      return new Response(JSON.stringify({ error: "Título é obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const activeChannels: string[] = channels || ["web_push"];

    // If specific user IDs provided, use them directly; otherwise use location/locale filters
    let filteredIds: string[] | null = null;
    if (targetUserIds && Array.isArray(targetUserIds) && targetUserIds.length > 0) {
      filteredIds = targetUserIds;
    } else {
      filteredIds = await getFilteredUserIds(adminClient, targetLocale, targetState, targetCity);
    }

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
        const notifType = category === "promotion" ? "promotion" : category === "warning" ? "warning" : "general";
        const notifRows = userIds.map((uid: string) => ({
          user_id: uid, title, body: body || "", type: notifType as const,
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

    // ---- Email (via brevo-email function for branded HTML) ----
    if (activeChannels.includes("email")) {
      let profileQuery = adminClient.from("profiles").select("id, email, display_name, notify_email").eq("notify_email", true).not("email", "is", null);
      if (filteredIds) {
        profileQuery = profileQuery.in("id", filteredIds);
      }
      const { data: profiles } = await profileQuery;
      const emailProfiles = profiles || [];
      totalRecipients += emailProfiles.length;

      if (emailProfiles.length > 0) {
        const recipients = emailProfiles.map((p: any) => ({ email: p.email, name: p.display_name || undefined }));

        // Call brevo-email edge function internally
        const brevoKey = Deno.env.get("BREVO_API_KEY");
        const brevoSender = Deno.env.get("BREVO_SENDER_EMAIL") || "noreply@donactivo.com.br";
        const brevoSenderName = Deno.env.get("BREVO_SENDER_NAME") || "DonActivo";

        if (!brevoKey) {
          errors.push("email: BREVO_API_KEY não configurado");
        } else {
          // Build branded HTML inline (same template as brevo-email)
          const PRIMARY = "#1a9e4f";
          const PRIMARY_DARK = "#167a3d";
          const BG = "#f3f7f4";
          const TEXT_COLOR = "#1a2e1f";
          const MUTED = "#6b7c70";
          const BORDER = "#dce5de";

          const htmlContent = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"/><style>body{margin:0;padding:0;background:${BG};font-family:'Nunito',Arial,sans-serif;color:${TEXT_COLOR};}.container{max-width:580px;margin:0 auto;padding:32px 16px;}.card{background:#fff;border-radius:16px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,0.06);}.logo{width:48px;height:48px;background:${PRIMARY};border-radius:12px;color:#fff;font-size:28px;font-weight:900;text-align:center;line-height:48px;margin:0 auto 16px;}h1{font-size:22px;font-weight:900;margin:0 0 8px;}p{font-size:14px;line-height:1.6;color:${MUTED};margin:0 0 16px;}.btn{display:inline-block;padding:14px 28px;background:${PRIMARY};color:#fff!important;border-radius:12px;text-decoration:none;font-weight:800;font-size:14px;}.footer{text-align:center;padding:24px 16px;font-size:11px;color:${MUTED};}</style></head><body><div class="container"><div class="card"><div class="logo">D</div><h1>${title}</h1>${body ? `<p style="color:${TEXT_COLOR};font-size:15px;">${body}</p>` : ''}<div style="text-align:center;margin:24px 0"><a href="https://donactivo.com.br${url || '/notificacoes'}" class="btn">Ver mais</a></div></div><div class="footer">&copy; ${new Date().getFullYear()} DonActivo &mdash; Transformando compras em doações<br/><a href="https://donactivo.com.br" style="color:${PRIMARY};text-decoration:none;font-weight:700;">donactivo.com.br</a></div></div></body></html>`;

          const batchSize = 50;
          for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);
            const to = batch.map((r: any) => ({ email: r.email, name: r.name }));
            try {
              const res = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: { "api-key": brevoKey, "Content-Type": "application/json" },
                body: JSON.stringify({
                  sender: { name: brevoSenderName, email: brevoSender },
                  to,
                  subject: title,
                  htmlContent,
                }),
              });
              if (res.ok) { sent += batch.length; } else {
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
