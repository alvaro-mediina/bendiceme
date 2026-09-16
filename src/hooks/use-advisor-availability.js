"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function useAdvisorAvailability() {
    const [sundays, setSundays] = useState([]);
    const [selectedSundayId, setSelectedSundayId] = useState(null);

    const [availableYouth, setAvailableYouth] = useState([]);

    const [loadingSundays, setLoadingSundays] = useState(true);
    const [loadingYouth, setLoadingYouth] = useState(false);

    const [availabilityError, setAvailabilityError] = useState(null);

    useEffect(() => {
        const loadSundays = async () => {
            setLoadingSundays(true);
            setAvailabilityError(null);

            const now = new Date();

            const today = [
                now.getFullYear(),
                String(now.getMonth() + 1).padStart(2, "0"),
                String(now.getDate()).padStart(2, "0"),
            ].join("-");

            const { data, error } = await supabase
                .from("sundays")
                .select("id, date")
                .eq("active", true)
                .gte("date", today)
                .order("date", {
                    ascending: true,
                });

            if (error) {
                console.error("Error cargando domingos:", error);

                setAvailabilityError("No se pudieron cargar los domingos.");

                setLoadingSundays(false);
                return;
            }

            const sundayList = data ?? [];

            setSundays(sundayList);

            if (sundayList.length > 0) {
                setSelectedSundayId(sundayList[0].id);
            }

            setLoadingSundays(false);
        };

        loadSundays();
    }, []);

    useEffect(() => {
        if (!selectedSundayId) {
            setAvailableYouth([]);
            return;
        }

        const loadAvailableYouth = async () => {
            setLoadingYouth(true);
            setAvailabilityError(null);

            const { data, error } = await supabase
                .from("availability")
                .select(
                    `
                    youth_id,
                    youth:youth (
                        id,
                        name,
                        office,
                        active
                    )
                `,
                )
                .eq("sunday_id", selectedSundayId)
                .eq("available", true);

            if (error) {
                console.error("Error cargando jóvenes disponibles:", error);

                setAvailabilityError(
                    "No se pudieron cargar los jóvenes disponibles.",
                );

                setLoadingYouth(false);
                return;
            }

            const youthList = (data ?? [])
                .map((item) => item.youth)
                .filter((person) => person && person.active)
                .sort((a, b) => a.name.localeCompare(b.name));

            setAvailableYouth(youthList);
            setLoadingYouth(false);
        };

        loadAvailableYouth();
    }, [selectedSundayId]);

    return {
        sundays,
        selectedSundayId,
        setSelectedSundayId,

        availableYouth,

        loadingSundays,
        loadingYouth,

        availabilityError,
    };
}
