import { NextResponse } from "next/server";
import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabase-admin";

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
);

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getReminderSunday(type) {
    const today = new Date();

    if (type === "sunday") {
        return formatLocalDate(today);
    }

    const nextSunday = new Date(today);

    const daysUntilSunday = (7 - today.getDay()) % 7 || 7;

    nextSunday.setDate(today.getDate() + daysUntilSunday);

    return formatLocalDate(nextSunday);
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const allowedTypes = ["saturday", "sunday"];

    if (!allowedTypes.includes(type)) {
        return NextResponse.json(
            {
                error: "Tipo de recordatorio no válido.",
            },
            {
                status: 400,
            },
        );
    }
    const authHeader = request.headers.get("authorization");

    if (
        !process.env.CRON_SECRET ||
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return NextResponse.json(
            {
                error: "Unauthorized",
            },
            {
                status: 401,
            },
        );
    }

    try {
        const sundayDate = getReminderSunday(type);
        const logType =
            type === "sunday" ? "sunday_same_day_reminder" : "sunday_reminder";

        const { data: sunday, error: sundayError } = await supabaseAdmin
            .from("sundays")
            .select("id, date, enabled, disabled_reason")
            .eq("date", sundayDate)
            .maybeSingle();

        if (sundayError) {
            console.error("Error buscando domingo:", sundayError);

            return NextResponse.json(
                {
                    error: "No se pudo buscar el domingo.",
                },
                {
                    status: 500,
                },
            );
        }

        if (!sunday) {
            return NextResponse.json({
                success: true,
                message: "No hay domingo registrado.",
                sent: 0,
            });
        }

        if (!sunday.enabled) {
            return NextResponse.json({
                success: true,
                message: sunday.disabled_reason
                    ? `Domingo no disponible: ${sunday.disabled_reason}`
                    : "Domingo no disponible.",
                sent: 0,
            });
        }

        const { data: assignments, error: assignmentsError } =
            await supabaseAdmin
                .from("assignments")
                .select(
                    `
                id,
                youth_id,
                role,
                prepares,
                status,
                youth:youth (
                    name
                )
            `,
                )
                .eq("sunday_id", sunday.id)
                .in("status", ["pending", "confirmed"]);

        if (assignmentsError) {
            console.error("Error cargando asignaciones:", assignmentsError);

            return NextResponse.json(
                {
                    error: "No se pudieron cargar las asignaciones.",
                },
                {
                    status: 500,
                },
            );
        }

        let sent = 0;
        let skipped = 0;
        let failed = 0;

        for (const assignment of assignments ?? []) {
            const { data: previousNotification } = await supabaseAdmin
                .from("notification_log")
                .select("id")
                .eq("assignment_id", assignment.id)
                .eq("type", logType)
                .maybeSingle();

            if (previousNotification) {
                skipped++;
                continue;
            }

            const { data: subscriptions, error: subscriptionsError } =
                await supabaseAdmin
                    .from("push_subscriptions")
                    .select("endpoint, p256dh, auth")
                    .eq("youth_id", assignment.youth_id);

            if (subscriptionsError || !subscriptions?.length) {
                skipped++;
                continue;
            }

            const roleText =
                assignment.role === "bless" ? "bendecir" : "repartir";

            const preparationText = assignment.prepares
                ? " y preparar la Santa Cena"
                : "";

            const isSameDay = type === "sunday";

            const payload = JSON.stringify({
                title: isSameDay
                    ? "🙏 Hoy te toca servir"
                    : "⛪ Mañana te toca servir",

                body: isSameDay
                    ? `Recordá que hoy te toca ${roleText}${preparationText}.`
                    : `Mañana te toca ${roleText}${preparationText}.`,

                url: "/",
            });

            const results = await Promise.allSettled(
                subscriptions.map((subscription) =>
                    webpush.sendNotification(
                        {
                            endpoint: subscription.endpoint,
                            keys: {
                                p256dh: subscription.p256dh,
                                auth: subscription.auth,
                            },
                        },
                        payload,
                    ),
                ),
            );

            const successful = results.some(
                (result) => result.status === "fulfilled",
            );

            if (!successful) {
                failed++;
                continue;
            }

            await supabaseAdmin.from("notification_log").insert({
                youth_id: assignment.youth_id,
                assignment_id: assignment.id,
                type: logType,
            });

            sent++;
        }

        return NextResponse.json({
            success: true,
            sunday: sunday.date,
            sent,
            skipped,
            failed,
        });
    } catch (error) {
        console.error("Error enviando recordatorios:", error);

        return NextResponse.json(
            {
                error: "Error interno enviando recordatorios.",
            },
            {
                status: 500,
            },
        );
    }
}
