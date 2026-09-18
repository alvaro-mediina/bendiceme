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

function getNextSunday() {
    const today = new Date();

    const nextSunday = new Date(today);

    const daysUntilSunday = (7 - today.getDay()) % 7 || 7;

    nextSunday.setDate(today.getDate() + daysUntilSunday);

    return formatLocalDate(nextSunday);
}

export async function POST() {
    try {
        const sundayDate = getNextSunday();

        const { data: sunday, error: sundayError } = await supabaseAdmin
            .from("sundays")
            .select("id, date")
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
                .eq("type", "sunday_reminder")
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
                assignment.role === "bless" ? "Bendecir" : "Repartir";

            const preparationText = assignment.prepares
                ? " y preparar la Santa Cena"
                : "";

            const payload = JSON.stringify({
                title: "🌿 BendiceMe",
                body: `Este domingo te toca ${roleText.toLowerCase()}${preparationText}.`,
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
                type: "sunday_reminder",
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
