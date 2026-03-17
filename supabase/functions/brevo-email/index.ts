const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BREVO_API = "https://api.brevo.com/v3";

// Brand colors from the project's design system
const BRAND = {
  primary: "#1a9e4f",       // hsl(145, 72%, 40%)
  primaryDark: "#167a3d",   // hsl(145, 65%, 30%)
  accent: "#f59e0b",        // hsl(35, 95%, 55%)
  bg: "#f3f7f4",            // hsl(140, 15%, 97%)
  cardBg: "#ffffff",
  text: "#1a2e1f",          // hsl(150, 15%, 10%)
  muted: "#6b7c70",         // hsl(150, 8%, 45%)
  border: "#dce5de",        // hsl(140, 10%, 88%)
  font: "'Nunito', Arial, sans-serif",
};

function baseLayout(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>DonActivo</title>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
<style>
  body { margin:0; padding:0; background:${BRAND.bg}; font-family:${BRAND.font}; color:${BRAND.text}; }
  .container { max-width:580px; margin:0 auto; padding:32px 16px; }
  .card { background:${BRAND.cardBg}; border-radius:16px; padding:32px; box-shadow:0 2px 12px rgba(0,0,0,0.06); }
  .logo { width:48px; height:48px; background:${BRAND.primary}; border-radius:12px; color:#fff; font-size:28px; font-weight:900; text-align:center; line-height:48px; margin:0 auto 16px; }
  h1 { font-size:22px; font-weight:900; color:${BRAND.text}; margin:0 0 8px; }
  h2 { font-size:18px; font-weight:800; color:${BRAND.text}; margin:0 0 8px; }
  p { font-size:14px; line-height:1.6; color:${BRAND.muted}; margin:0 0 16px; }
  .btn { display:inline-block; padding:14px 28px; background:${BRAND.primary}; color:#fff!important; border-radius:12px; text-decoration:none; font-weight:800; font-size:14px; }
  .btn:hover { background:${BRAND.primaryDark}; }
  .footer { text-align:center; padding:24px 16px; font-size:11px; color:${BRAND.muted}; }
  .divider { border:none; border-top:1px solid ${BRAND.border}; margin:24px 0; }
  ${preheader ? '.preheader { display:none!important; visibility:hidden; mso-hide:all; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; }' : ''}
</style>
</head>
<body>
${preheader ? `<span class="preheader">${preheader}</span>` : ''}
<div class="container">
  <div class="card">
    <div class="logo">D</div>
    ${content}
  </div>
  <div class="footer">
    &copy; ${new Date().getFullYear()} DonActivo &mdash; Transformando compras em doações<br/>
    <a href="https://donactivo.com.br" style="color:${BRAND.primary};text-decoration:none;font-weight:700;">donactivo.com.br</a>
  </div>
</div>
</body>
</html>`;
}

function welcomeHtml(name: string): string {
  return baseLayout(`
    <h1>Bem-vindo ao DonActivo! 🎉</h1>
    <p>Olá <strong style="color:${BRAND.text}">${name}</strong>, que bom ter você aqui!</p>
    <p>A partir de agora, cada compra que você fizer em nossas lojas parceiras gera cashback que é <strong style="color:${BRAND.primary}">doado automaticamente</strong> para a ONG que você escolher. Simples assim!</p>
    <hr class="divider"/>
    <h2>Como funciona?</h2>
    <p>1️⃣ Escolha sua ONG favorita<br/>
    2️⃣ Compre nas lojas parceiras pelo DonActivo<br/>
    3️⃣ O cashback vira doação automática 💚</p>
    <div style="text-align:center;margin:24px 0">
      <a href="https://donactivo.com.br/lojas" class="btn">Explorar lojas parceiras</a>
    </div>
    <p style="font-size:12px;text-align:center;">Faça a diferença sem gastar nada a mais!</p>
  `, "Bem-vindo ao DonActivo! Transforme suas compras em doações.");
}

function pushNotificationHtml(title: string, body: string, url: string): string {
  return baseLayout(`
    <h1>${title}</h1>
    ${body ? `<p style="color:${BRAND.text};font-size:15px;">${body}</p>` : ''}
    <div style="text-align:center;margin:24px 0">
      <a href="https://donactivo.com.br${url || '/notificacoes'}" class="btn">Ver mais</a>
    </div>
  `, title);
}

function newsHtml(title: string, summary: string, slug: string, coverUrl?: string): string {
  return baseLayout(`
    ${coverUrl ? `<img src="${coverUrl}" alt="${title}" style="width:100%;border-radius:12px;margin-bottom:16px;"/>` : ''}
    <h1>${title}</h1>
    ${summary ? `<p style="color:${BRAND.text};font-size:15px;">${summary}</p>` : ''}
    <div style="text-align:center;margin:24px 0">
      <a href="https://donactivo.com.br/noticias/${slug}" class="btn">Ler notícia completa</a>
    </div>
  `, `Nova notícia: ${title}`);
}

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

    const senderEmail = Deno.env.get("BREVO_SENDER_EMAIL") || "noreply@donactivo.com.br";
    const senderName = Deno.env.get("BREVO_SENDER_NAME") || "DonActivo";

    const { type, to, data } = await req.json();
    // type: "welcome" | "push" | "news"
    // to: [{ email, name? }] or { email, name? }
    // data: depends on type

    const recipients = Array.isArray(to) ? to : [to];
    if (!recipients.length || !recipients[0]?.email) {
      return new Response(JSON.stringify({ error: "recipients required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let subject = "";
    let htmlContent = "";

    switch (type) {
      case "welcome":
        subject = "Bem-vindo ao DonActivo! 🎉";
        htmlContent = welcomeHtml(data?.name || "");
        break;
      case "push":
        subject = data?.title || "Nova notificação";
        htmlContent = pushNotificationHtml(data?.title || "", data?.body || "", data?.url || "/notificacoes");
        break;
      case "news":
        subject = `📰 ${data?.title || "Nova notícia"}`;
        htmlContent = newsHtml(data?.title || "", data?.summary || "", data?.slug || "", data?.cover_url);
        break;
      default:
        return new Response(JSON.stringify({ error: "invalid type" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Send in batches of 50
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];
    const batchSize = 50;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const toList = batch.map((r: any) => ({ email: r.email, name: r.name || undefined }));

      try {
        const res = await fetch(`${BREVO_API}/smtp/email`, {
          method: "POST",
          headers: { "api-key": brevoKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: toList,
            subject,
            htmlContent,
          }),
        });

        if (res.ok) {
          sent += batch.length;
        } else {
          failed += batch.length;
          const txt = await res.text();
          errors.push(`${res.status}: ${txt.slice(0, 200)}`);
        }
      } catch (e) {
        failed += batch.length;
        errors.push(String(e).slice(0, 200));
      }
    }

    return new Response(JSON.stringify({ sent, failed, errors: errors.slice(0, 5) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[brevo-email] Exception:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
