"use client";

import { useCallback, useEffect, useState } from "react";

import { ensureAvailableSundays, getVisibleSundays } from "@/lib/sundays";

import { supabase } from "@/lib/supabase";

export default function useAdvisorAvailability() {
    const [sundays, setSundays] = useState([]);
    const [selectedSundayId, setSelectedSundayId] = useState(null);

    const [availableYouth, setAvailableYouth] = useState([]);

    const [loadingSundays, setLoadingSundays] = useState(true);

    const [loadingYouth, setLoadingYouth] = useState(false);

    const [availabilityError, setAvailabilityError] = useState(null);

    const loadSundays = useCallback(async () => {
        setLoadingSundays(true);
        setAvailabilityError(null);

        try {
            await ensureAvailableSundays();

            const { dates } = getVisibleSundays();

            if (dates.length === 0) {
                setSundays([]);
                setSelectedSundayId(null);
                return;
            }

            const { data, error } = await supabase
                .from("sundays")
                .select("id, date, enabled, disabled_reason")
                .eq("active", true)
                .in("date", dates)
                .order("date", {
                    ascending: true,
                });

            if (error) {
                throw error;
            }

            const sundayList = data ?? [];

            setSundays(sundayList);

            const firstEnabledSunday = sundayList.find(
                (sunday) => sunday.enabled,
            );

            setSelectedSundayId(firstEnabledSunday?.id ?? null);
        } catch (error) {
            console.error("Error cargando domingos:", error);

            setAvailabilityError("No se pudieron cargar los domingos.");
        } finally {
            setLoadingSundays(false);
        }
    }, []);

    const loadAvailableYouth = useCallback(
        async ({ showLoading = true } = {}) => {
            if (!selectedSundayId) {
                setAvailableYouth([]);
                setLoadingYouth(false);
                return;
            }

            if (showLoading) {
                setLoadingYouth(true);
            }

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
        },
        [selectedSundayId],
    );

    useEffect(() => {
        loadSundays();
    }, [loadSundays]);

    useEffect(() => {
        loadAvailableYouth();
    }, [loadAvailableYouth]);

    useEffect(() => {
        if (!selectedSundayId) {
            return;
        }

        const channel = supabase
            .channel(`advisor-availability-${selectedSundayId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "availability",
                    filter: `sunday_id=eq.${selectedSundayId}`,
                },
                () => {
                    loadAvailableYouth({
                        showLoading: false,
                    });
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedSundayId, loadAvailableYouth]);

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
