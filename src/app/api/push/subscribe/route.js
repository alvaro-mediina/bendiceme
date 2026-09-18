import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
    try {
        const body = await request.json();

        const { youthId, subscription } = body;

        if (
            !youthId ||
            !subscription?.endpoint ||
            !subscription?.keys?.p256dh ||
            !subscription?.keys?.auth
        ) {
            return NextResponse.json(
                {
                    error: "Datos de suscripción inválidos.",
                },
                {
                    status: 400,
                },
            );
        }

        const { error } = await supabaseAdmin.from("push_subscriptions").upsert(
            {
                youth_id: youthId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
            {
                onConflict: "endpoint",
            },
        );

        if (error) {
            console.error("Error guardando push subscription:", error);

            return NextResponse.json(
                {
                    error: "No se pudo guardar la suscripción.",
                },
                {
                    status: 500,
                },
            );
        }

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error("Error procesando push subscription:", error);

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
