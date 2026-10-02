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
        const { youthId, sundayId } = await request.json();

        if (!youthId || !sundayId) {
            return NextResponse.json(
                {
                    error: "Datos incompletos.",
                },
                {
                    status: 400,
                },
            );
        }

        const { data: confirmedYouth, error: confirmedYouthError } =
            await supabaseAdmin
                .from("assignments")
                .select(
                    `
                youth_id,
                role,
                status,
                youth:youth (
                    name
                )
            `,
                )
                .eq("youth_id", youthId)
                .eq("sunday_id", sundayId)
                .maybeSingle();

        if (confirmedYouthError) {
            throw confirmedYouthError;
        }

        if (!confirmedYouth || confirmedYouth.status !== "confirmed") {
            return NextResponse.json(
                {
                    error: "El joven todavía no confirmó su asignación.",
                },
                {
                    status: 409,
                },
            );
        }

        const { data: teamMembers, error: teamError } = await supabaseAdmin
            .from("assignments")
            .select(
                `
                youth_id,
                status
            `,
            )
            .eq("sunday_id", sundayId)
            .eq("status", "confirmed")
            .neq("youth_id", youthId);

        if (teamError) {
            throw teamError;
        }

        if (!teamMembers?.length) {
            return NextResponse.json({
                success: true,
                sent: 0,
            });
        }

        const recipientYouthIds = teamMembers.map((member) => member.youth_id);

        const { data: subscriptions, error: subscriptionsError } =
            await supabaseAdmin
                .from("push_subscriptions")
                .select("id, youth_id, endpoint, p256dh, auth")
                .in("youth_id", recipientYouthIds);

        if (subscriptionsError) {
            throw subscriptionsError;
        }

        if (!subscriptions?.length) {
            return NextResponse.json({
                success: true,
                sent: 0,
            });
        }

        const firstName =
            confirmedYouth.youth?.name?.split(" ")[0] ?? "Un joven";

        const roleText =
            confirmedYouth.role === "bless" ? "bendecir" : "repartir";

        const payload = JSON.stringify({
            title: "👥 Se sumó alguien a tu equipo",
            body: `${firstName} confirmó que va a ${roleText} este domingo.`,
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

                sent++;
            } catch (error) {
                failed++;

                console.error("Error notificando al equipo:", error);

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
        console.error("Error notificando al equipo:", error);

        return NextResponse.json(
            {
                error: "No se pudo notificar al equipo.",
            },
            {
                status: 500,
            },
        );
    }
}
