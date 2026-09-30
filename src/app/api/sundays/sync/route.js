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

        const rows = dates.map((date) => ({
            date,
            active: true,
        }));

        const { data, error } = await supabaseAdmin
            .from("sundays")
            .upsert(rows, {
                onConflict: "date",
            })
            .select("id, date, active, enabled, disabled_reason");

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
