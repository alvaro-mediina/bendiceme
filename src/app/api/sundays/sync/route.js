import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
    try {
        const { dates } = await request.json();

        if (!Array.isArray(dates) || dates.length === 0) {
            return NextResponse.json(
                {
                    error: "No se recibieron fechas.",
                },
                {
                    status: 400,
                },
            );
        }

        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                {
                    error: "No autorizado.",
                },
                {
                    status: 401,
                },
            );
        }

        const accessToken = authHeader.replace("Bearer ", "");

        const {
            data: { user },
            error: userError,
        } = await supabaseAdmin.auth.getUser(accessToken);

        if (userError || !user) {
            return NextResponse.json(
                {
                    error: "Sesión inválida.",
                },
                {
                    status: 401,
                },
            );
        }

        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("ward_id")
            .eq("user_id", user.id)
            .single();

        if (profileError || !profile?.ward_id) {
            return NextResponse.json(
                {
                    error: "No se encontró el barrio del usuario.",
                },
                {
                    status: 403,
                },
            );
        }

        const wardId = profile.ward_id;

        const rows = dates.map((date) => ({
            ward_id: wardId,
            date,
            active: true,
        }));

        const { data, error } = await supabaseAdmin
            .from("sundays")
            .upsert(rows, {
                onConflict: "ward_id,date",
            })
            .select("id, ward_id, date, active, enabled, disabled_reason");

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            sundays: data ?? [],
        });
    } catch (error) {
        console.error("Error sincronizando domingos:", error);

        return NextResponse.json(
            {
                error: "No se pudieron sincronizar los domingos.",
            },
            {
                status: 500,
            },
        );
    }
}
