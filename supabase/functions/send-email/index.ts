// Versendet E-Mails ueber den IONOS-Postausgangsserver.
// Ersetzt die frueher genutzte SendEmail-Integration von Base44.
//
// Benoetigte Secrets (in Supabase unter Edge Functions -> Secrets):
//   SMTP_HOST  z. B. smtp.ionos.de
//   SMTP_PORT  465
//   SMTP_USER  vollstaendige E-Mail-Adresse des Postfachs
//   SMTP_PASS  Passwort des Postfachs
//   MAIL_FROM  Absenderadresse, MUSS auf der eigenen Domain liegen
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { to, subject, body } = await req.json();

    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: "Empfaenger und Betreff sind erforderlich." }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get("SMTP_HOST") ?? "smtp.ionos.de",
        port: Number(Deno.env.get("SMTP_PORT") ?? 465),
        tls: true,
        auth: {
          username: Deno.env.get("SMTP_USER")!,
          password: Deno.env.get("SMTP_PASS")!,
        },
      },
    });

    await client.send({
      from: Deno.env.get("MAIL_FROM") ?? Deno.env.get("SMTP_USER")!,
      to,
      subject,
      content: body ?? "",
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[send-email]", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
