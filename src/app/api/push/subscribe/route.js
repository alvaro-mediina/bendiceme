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

export async function DELETE(request) {
    try {
        const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
        if (!token) {
            return NextResponse.json({ error: "No hay una sesión válida." }, { status: 401 });
        }

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json({ error: "No hay una sesión válida." }, { status: 401 });
        }

        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles").select("role, ward_id").eq("user_id", user.id).maybeSingle();
        if (profileError) throw profileError;
        if (profile?.role !== "youth") {
            return NextResponse.json({ error: "Acceso no autorizado." }, { status: 403 });
        }

        const { data: youth, error: youthError } = await supabaseAdmin
            .from("youth").select("id").eq("user_id", user.id)
            .eq("ward_id", profile.ward_id).maybeSingle();
        if (youthError) throw youthError;
        if (!youth) {
            return NextResponse.json({ error: "No se encontró la cuenta del joven." }, { status: 403 });
        }

        const { endpoint } = await request.json();
        if (typeof endpoint !== "string" || !endpoint.trim()) {
            return NextResponse.json({ error: "Suscripción inválida." }, { status: 400 });
        }

        const { error } = await supabaseAdmin.from("push_subscriptions")
            .delete().eq("youth_id", youth.id).eq("endpoint", endpoint);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error eliminando suscripción del joven:", error);
        return NextResponse.json({ error: "No se pudo eliminar la suscripción." }, { status: 500 });
    }
}
