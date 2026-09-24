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

        const allowedTypes = [
            "youth_available",
            "youth_unavailable",
            "assignment_confirmed",
            "assignment_declined",
        ];

        if (!allowedTypes.includes(type)) {
            return NextResponse.json(
                {
                    error: "Tipo de evento no válido.",
                },
                {
                    status: 400,
                },
            );
        }

        // Comprobamos que el joven realmente
        // esté disponible para ese domingo.
        if (type === "youth_available" || type === "youth_unavailable") {
            const { data: availability, error: availabilityError } =
                await supabaseAdmin
                    .from("availability")
                    .select("available")
                    .eq("youth_id", youthId)
                    .eq("sunday_id", sundayId)
                    .maybeSingle();

            if (availabilityError) {
                throw availabilityError;
            }

            if (!availability) {
                return NextResponse.json(
                    {
                        error: "No existe disponibilidad para ese domingo.",
                    },
                    {
                        status: 404,
                    },
                );
            }

            if (type === "youth_available" && availability.available !== true) {
                return NextResponse.json(
                    {
                        error: "El joven no está disponible para ese domingo.",
                    },
                    {
                        status: 409,
                    },
                );
            }

            if (
                type === "youth_unavailable" &&
                availability.available !== false
            ) {
                return NextResponse.json(
                    {
                        error: "El joven todavía figura disponible para ese domingo.",
                    },
                    {
                        status: 409,
                    },
                );
            }
        }

        if (type === "assignment_confirmed" || type === "assignment_declined") {
            const { data: assignment, error: assignmentError } =
                await supabaseAdmin
                    .from("assignments")
                    .select("status")
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

            if (
                type === "assignment_confirmed" &&
                assignment.status !== "confirmed"
            ) {
                return NextResponse.json(
                    {
                        error: "La asignación todavía no está confirmada.",
                    },
                    {
                        status: 409,
                    },
                );
            }

            if (
                type === "assignment_declined" &&
                assignment.status !== "declined"
            ) {
                return NextResponse.json(
                    {
                        error: "La asignación todavía no está rechazada.",
                    },
                    {
                        status: 409,
                    },
                );
            }
        }

        const { data: youth, error: youthError } = await supabaseAdmin
            .from("youth")
            .select("name")
            .eq("id", youthId)
            .single();

        if (youthError) {
            throw youthError;
        }

        const { data: sunday, error: sundayError } = await supabaseAdmin
            .from("sundays")
            .select("date")
            .eq("id", sundayId)
            .single();

        if (sundayError) {
            throw sundayError;
        }

        const { data: subscriptions, error: subscriptionsError } =
            await supabaseAdmin
                .from("advisor_push_subscriptions")
                .select("id, endpoint, p256dh, auth");

        if (subscriptionsError) {
            throw subscriptionsError;
        }

        if (!subscriptions?.length) {
            return NextResponse.json({
                success: true,
                sent: 0,
            });
        }

        const sundayDate = new Date(`${sunday.date}T00:00:00`);

        const formattedSunday = sundayDate.toLocaleDateString("es-AR", {
            day: "numeric",
            month: "long",
        });

        let title;
        let body;
        const youthName = youth.name.split(" ")[0];
        switch (type) {
            case "youth_available":
                title = "🙋 Nueva disponibilidad";
                body = `${youthName} está disponible para el domingo ${formattedSunday}.`;
                break;

            case "youth_unavailable":
                title = "⚠️ Cambio de disponibilidad";
                body = `${youthName} ya no está disponible para el domingo ${formattedSunday}.`;
                break;

            case "assignment_confirmed":
                title = "✅ Asignación confirmada";
                body = `${youthName} confirmó su asignación para el domingo ${formattedSunday}.`;
                break;

            case "assignment_declined":
                title = "❌ Asignación rechazada";
                body = `${youthName} rechazó su asignación para el domingo ${formattedSunday}.`;
                break;
        }

        const payload = JSON.stringify({
            title,
            body,
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
                console.error("Error enviando push al asesor:", error);

                // Suscripción vencida o eliminada.
                if (error.statusCode === 404 || error.statusCode === 410) {
                    await supabaseAdmin
                        .from("advisor_push_subscriptions")
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
        console.error("Error notificando al asesor:", error);

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
