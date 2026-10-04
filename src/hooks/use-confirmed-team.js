"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function useConfirmedTeam(assignment) {
    const [confirmedTeam, setConfirmedTeam] = useState([]);

    const [loadingTeam, setLoadingTeam] = useState(false);

    useEffect(() => {
        const loadConfirmedTeam = async () => {
            if (!assignment?.sunday_id) {
                setConfirmedTeam([]);
                return;
            }

            setLoadingTeam(true);

            const { data, error } = await supabase
                .from("assignments")
                .select(
                    `
                        youth_id,
                        role,
                        prepares,
                        status,
                        youth:youth (
                            id,
                            name,
                            office
                        )
                    `,
                )
                .eq("sunday_id", assignment.sunday_id)
                .eq("status", "confirmed");

            if (error) {
                console.error("Error cargando equipo confirmado:", error);

                setConfirmedTeam([]);
                setLoadingTeam(false);
                return;
            }

            setConfirmedTeam(data ?? []);

            setLoadingTeam(false);
        };

        loadConfirmedTeam();
    }, [assignment?.sunday_id, assignment?.status]);

    const blessingTeam = useMemo(
        () => confirmedTeam.filter((member) => member.role === "bless"),
        [confirmedTeam],
    );

    const passingTeam = useMemo(
        () => confirmedTeam.filter((member) => member.role === "pass"),
        [confirmedTeam],
    );

    return {
        confirmedTeam,
        loadingTeam,
        blessingTeam,
        passingTeam,
    };
}
