import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendClassReminders } from "@/lib/sunday-school-reminders";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request) {
  const authorization = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  const slot = new URL(request.url).searchParams.get("slot");
  if (!["morning", "evening"].includes(slot)) {
    return Response.json({ error: "Horario de recordatorio inválido." }, { status: 400 });
  }

  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );

    const result = await sendClassReminders({
      database: supabaseAdmin,
      sendPush: webpush.sendNotification.bind(webpush),
      slot,
    });
    return Response.json(result, { status: result.failed ? 500 : 200 });
  } catch (error) {
    console.error("Error enviando recordatorios de clases:", error.message);
    return Response.json({ error: "No se pudieron completar los recordatorios de clases." }, { status: 500 });
  }
}
