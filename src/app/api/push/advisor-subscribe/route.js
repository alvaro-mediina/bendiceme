import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
    try {
        const { userId, subscription } = await request.json();

        if (
            !userId ||
            !subscription?.endpoint ||
            !subscription?.keys?.p256dh ||
            !subscription?.keys?.auth
        ) {
            return NextResponse.json(
                {
                    error: "Datos incompletos.",
                },
                {
                    status: 400,
                },
            );
        }

        const { error } = await supabaseAdmin
            .from("advisor_push_subscriptions")
            .upsert(
                {
                    user_id: userId,
                    endpoint: subscription.endpoint,
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                },
                {
                    onConflict: "endpoint",
                },
            );

        if (error) {
            console.error(error);

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
        console.error(error);

        return NextResponse.json(
            {
                error: "Error interno del servidor.",
            },
            {
                status: 500,
            },
        );
    }
}
