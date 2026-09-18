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
        const { youthId } = await request.json();

        if (!youthId) {
            return NextResponse.json(
                {
                    error: "Falta youthId.",
                },
                {
                    status: 400,
                },
            );
        }

        const { data: subscriptions, error } = await supabaseAdmin
            .from("push_subscriptions")
            .select(
                `
                endpoint,
                p256dh,
                auth
                `,
            )
            .eq("youth_id", youthId);

        if (error) {
            console.error("Error cargando suscripciones:", error);

            return NextResponse.json(
                {
                    error: "No se pudieron cargar las suscripciones.",
                },
                {
                    status: 500,
                },
            );
        }

        if (!subscriptions?.length) {
            return NextResponse.json(
                {
                    error: "Este joven no tiene suscripciones push.",
                },
                {
                    status: 404,
                },
            );
        }

        const payload = JSON.stringify({
            title: "🌿 BendiceMe",
            body: "Esta es una notificación de prueba.",
            url: "/",
        });

        const results = await Promise.allSettled(
            subscriptions.map((item) =>
                webpush.sendNotification(
                    {
                        endpoint: item.endpoint,
                        keys: {
                            p256dh: item.p256dh,
                            auth: item.auth,
                        },
                    },
                    payload,
                ),
            ),
        );

        const failed = results.filter((result) => result.status === "rejected");

        failed.forEach((result) => {
            console.error("Error enviando push:", result.reason);
        });

        return NextResponse.json({
            success: true,
            sent: results.length - failed.length,
            failed: failed.length,
        });
    } catch (error) {
        console.error("Error en push de prueba:", error);

        return NextResponse.json(
            {
                error: "Error interno.",
            },
            {
                status: 500,
            },
        );
    }
}
