import { NextResponse } from "next/server";
import webpush from "web-push";

import { supabaseAdmin } from "@/lib/supabase-admin";

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
);

export async function POST(request) {
    try {
        const { type, youthId, sundayId } = await request.json();

        if (!type || !youthId || !sundayId) {
            return NextResponse.json(
                {
                    error: "Datos incompletos.",
                },
                {
                    status: 400,
                },
            );
        }

        if (type !== "assignment_created") {
            return NextResponse.json(
                {
                    error: "Tipo de evento no válido.",
                },
                {
                    status: 400,
                },
            );
        }

        const { data: assignment, error: assignmentError } = await supabaseAdmin
            .from("assignments")
            .select(
                `
                role,
                prepares,
                status,
                sunday:sundays (
                    date
                )
            `,
            )
            .eq("youth_id", youthId)
            .eq("sunday_id", sundayId)
            .maybeSingle();

        if (assignmentError) {
            throw assignmentError;
        }

        if (!assignment) {
            return NextResponse.json(
                {
                    error: "No existe una asignación para ese domingo.",
                },
                {
                    status: 404,
                },
            );
        }

        if (assignment.status !== "pending") {
            return NextResponse.json(
                {
                    error: "La asignación no está pendiente de confirmación.",
                },
                {
                    status: 409,
                },
            );
        }

        if (!assignment.sunday?.date) {
            return NextResponse.json(
                {
                    error: "No se encontró la fecha del domingo.",
                },
                {
                    status: 404,
                },
            );
        }

        const { data: subscriptions, error: subscriptionsError } =
            await supabaseAdmin
                .from("push_subscriptions")
                .select("id, endpoint, p256dh, auth")
                .eq("youth_id", youthId);

        if (subscriptionsError) {
            throw subscriptionsError;
        }

        if (!subscriptions?.length) {
            return NextResponse.json({
                success: true,
                sent: 0,
            });
        }

        const sundayDate = new Date(`${assignment.sunday.date}T00:00:00`);

        const formattedSunday = sundayDate.toLocaleDateString("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });

        const role = assignment.role === "bless" ? "bendecir" : "repartir";

        const responsibility = assignment.prepares
            ? `${role} y preparar la Santa Cena`
            : role;

        const payload = JSON.stringify({
            title: "📌 Tenés una asignación",
            body: `Te toca ${responsibility} el ${formattedSunday}.`,
            url: "/",
        });

        let sent = 0;
        let failed = 0;

        for (const subscription of subscriptions) {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: subscription.p256dh,
                            auth: subscription.auth,
                        },
                    },
                    payload,
                );

                sent += 1;
            } catch (error) {
                failed += 1;

                console.error("Error enviando push al joven:", error);

                if (error.statusCode === 404 || error.statusCode === 410) {
                    await supabaseAdmin
                        .from("push_subscriptions")
                        .delete()
                        .eq("id", subscription.id);
                }
            }
        }

        return NextResponse.json({
            success: true,
            sent,
            failed,
        });
    } catch (error) {
        console.error("Error notificando al joven:", error);

        return NextResponse.json(
            {
                error: "No se pudo enviar la notificación.",
            },
            {
                status: 500,
            },
        );
    }
}
