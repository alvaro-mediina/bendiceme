import { createHash } from "node:crypto";

const timeZone = "America/Argentina/Cordoba";
const pageSize = 100;

export function getClassReminderSchedule(slot, now = new Date()) {
  if (!["morning", "evening"].includes(slot)) {
    throw new Error("Horario de recordatorio inválido.");
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const local = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const localDay = new Date(Date.UTC(
    Number(local.year),
    Number(local.month) - 1,
    Number(local.day),
  ));
  const hour = Number(local.hour);
  const inTimeWindow = slot === "morning"
    ? hour >= 9 && hour < 20
    : hour >= 20;

  if (localDay.getUTCDay() !== 6 || !inTimeWindow) return null;

  localDay.setUTCDate(localDay.getUTCDate() + 1);
  const sundayDate = localDay.toISOString().slice(0, 10);
  // Córdoba is UTC-3. Expire the push at local midnight, before Sunday.
  const expiresAt = new Date(sundayDate + "T00:00:00-03:00");
  const ttl = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

  return { sundayDate, ttl };
}

async function loadAllRows(createQuery) {
  const rows = [];
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await createQuery().range(offset, offset + pageSize - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) return rows;
  }
}

export async function sendClassReminders({ database, sendPush, slot, now = new Date() }) {
  const schedule = getClassReminderSchedule(slot, now);
  if (!schedule) {
    return { success: true, sent: 0, skipped: 0, failed: 0, message: "Fuera del horario de recordatorios del sábado." };
  }

  const classes = await loadAllRows(() => database
    .from("sunday_school_classes")
    .select("id, ward_id, date, topic, teacher_youth_id, teacher:youth(id, ward_id, user_id, active)")
    .eq("date", schedule.sundayDate)
    .not("teacher_youth_id", "is", null)
    .order("id"));

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of classes) {
    const teacher = item.teacher;
    if (!teacher?.active || !teacher.user_id ||
      String(teacher.ward_id) !== String(item.ward_id) ||
      String(teacher.id) !== String(item.teacher_youth_id)) {
      skipped += 1;
      continue;
    }

    const subscriptions = await loadAllRows(() => database
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("youth_id", teacher.id)
      .order("endpoint"));

    if (subscriptions.length === 0) {
      skipped += 1;
      continue;
    }

    const payload = JSON.stringify({
      title: slot === "morning" ? "📖 Mañana te toca enseñar" : "📖 Recordá tu clase de mañana",
      body: slot === "morning"
        ? `Tu clase de Escuela Dominical es sobre «${item.topic}».`
        : `Mañana das la clase «${item.topic}». Revisá las ayudas para prepararte.`,
      url: "/?view=school",
    });

    for (const subscription of subscriptions) {
      const endpointHash = createHash("sha256").update(subscription.endpoint).digest("hex");
      const { data: claimToken, error: claimError } = await database
        .rpc("claim_sunday_school_reminder", {
          p_class_id: item.id,
          p_ward_id: String(item.ward_id),
          p_youth_id: String(teacher.id),
          p_sunday_date: schedule.sundayDate,
          p_slot: slot,
          p_endpoint_hash: endpointHash,
        });
      if (claimError) throw claimError;
      if (!claimToken) {
        skipped += 1;
        continue;
      }

      try {
        await sendPush(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          payload,
          {
            TTL: schedule.ttl,
            timeout: 10000,
            topic: createHash("sha256")
              .update(`${item.id}:${teacher.id}:${schedule.sundayDate}:${slot}`)
              .digest("base64url").slice(0, 32),
          },
        );
      } catch (error) {
        failed += 1;
        console.error("Falló un recordatorio de clase:", error.statusCode ?? "Error de conexión");
        const { error: logError } = await database
          .from("sunday_school_reminder_log")
          .update({ status: "failed" })
          .eq("claim_token", claimToken);
        if (logError) throw logError;

        if (error.statusCode === 404 || error.statusCode === 410) {
          const { error: subscriptionError } = await database
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", subscription.endpoint)
            .eq("youth_id", teacher.id);
          if (subscriptionError) throw subscriptionError;
        }
        continue;
      }

      // If logging fails after delivery, keep the pending claim. Releasing it
      // immediately could deliver the same reminder again on the next retry.
      const { error: logError } = await database
        .from("sunday_school_reminder_log")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("claim_token", claimToken);
      if (logError) throw logError;
      sent += 1;
    }
  }

  return { success: failed === 0, sunday: schedule.sundayDate, sent, skipped, failed };
}
