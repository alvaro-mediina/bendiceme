import { createHash } from "node:crypto";
import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function notifySundaySchoolAssignment({ classId, wardId, youthId }) {
  const { data: youth, error: youthError } = await supabaseAdmin
    .from("youth")
    .select("id, user_id")
    .eq("id", youthId)
    .eq("ward_id", wardId)
    .eq("active", true)
    .maybeSingle();
  if (youthError) throw youthError;
  if (!youth?.user_id) return { sent: 0, failed: 0 };

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("user_id")
    .eq("user_id", youth.user_id)
    .eq("ward_id", wardId)
    .eq("role", "youth")
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile) return { sent: 0, failed: 0 };

  const { data: subscriptions, error: subscriptionError } = await supabaseAdmin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("youth_id", youth.id);
  if (subscriptionError) throw subscriptionError;
  if (!subscriptions?.length) return { sent: 0, failed: 0 };

  // Recheck after loading the account and devices: another advisor may have
  // reassigned or deleted the class while these queries were running.
  const { data: currentClass, error: classError } = await supabaseAdmin
    .from("sunday_school_classes")
    .select("id, date, topic")
    .eq("id", classId)
    .eq("ward_id", wardId)
    .eq("teacher_youth_id", youth.id)
    .maybeSingle();
  if (classError) throw classError;
  if (!currentClass) return { sent: 0, failed: 0 };

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  const formattedDate = new Date(currentClass.date + "T00:00:00")
    .toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  const payload = JSON.stringify({
    title: "Se te asignó una clase",
    body: `Te toca enseñar el ${formattedDate}. Tema: ${currentClass.topic}.`,
    url: "/?view=school",
  });
  const topic = createHash("sha256")
    .update(`class-assigned:${classId}:${youth.id}`)
    .digest("base64url")
    .slice(0, 32);
  let sent = 0;
  let failed = 0;

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        payload,
        { TTL: 86400, timeout: 10000, topic },
      );
      sent += 1;
    } catch (error) {
      failed += 1;
      console.error("Falló el aviso de clase asignada:", error.statusCode ?? "Error de conexión");
      if (error.statusCode === 404 || error.statusCode === 410) {
        const { error: deleteError } = await supabaseAdmin
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", subscription.endpoint)
          .eq("youth_id", youth.id);
        if (deleteError) {
          console.error("No se pudo eliminar una suscripción vencida:", deleteError.message);
        }
      }
    }
  }

  return { sent, failed };
}
