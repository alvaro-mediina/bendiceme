"use client";

import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";
import { getVisibleSundays } from "@/lib/sundays";
import { notifyAdvisor } from "@/lib/advisor-notifications";

export default function useYouthAvailability(currentYouth) {
    const [selected, setSelected] = useState([]);
    const [initialSelected, setInitialSelected] = useState([]);

    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);

    const [errorMessage, setErrorMessage] = useState(null);

    const [hadAvailability, setHadAvailability] = useState(false);

    const { dates: visibleSundayDates, activeMonthDate } = useMemo(
        () => getVisibleSundays(),
        [],
    );

    const [sundays, setSundays] = useState(() =>
        visibleSundayDates.map((date) => ({
            date,
            id: null,
        })),
    );

    const [activeMonth, setActiveMonth] = useState(activeMonthDate);

    const monthName = activeMonth
        ? activeMonth.toLocaleDateString("es-AR", {
              month: "long",
          })
        : "";

    const formattedMonth =
        monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const now = new Date();

    const currentDate = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
    ].join("-");

    const visibleSundays = sundays.filter((sunday) => {
        if (sunday.date > currentDate) {
            return true;
        }

        if (sunday.date < currentDate) {
            return false;
        }

        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const cutoffMinutes = 11 * 60 + 30;

        return currentMinutes < cutoffMinutes;
    });

    const visibleSundayIds = visibleSundays
        .filter((sunday) => sunday.id !== null && sunday.enabled)
        .map((sunday) => sunday.id);

    const currentVisibleSelected = selected
        .filter((id) => visibleSundayIds.includes(id))
        .sort((a, b) => a - b);

    const initialVisibleSelected = initialSelected
        .filter((id) => visibleSundayIds.includes(id))
        .sort((a, b) => a - b);

    const hasChanges =
        JSON.stringify(currentVisibleSelected) !==
        JSON.stringify(initialVisibleSelected);

    const removedSundayIds = initialSelected.filter(
        (id) => visibleSundayIds.includes(id) && !selected.includes(id),
    );

    useEffect(() => {
        const loadData = async () => {
            setLoaded(false);
            setErrorMessage(null);

            try {
                const response = await fetch("/api/sundays/sync", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        dates: visibleSundayDates,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error ??
                            "No se pudieron sincronizar los domingos.",
                    );
                }

                const sundayData = data.sundays ?? [];

                const sundaysWithIds = visibleSundayDates.map((date) => {
                    const databaseSunday = sundayData.find(
                        (sunday) => sunday.date === date,
                    );

                    return {
                        date,
                        id: databaseSunday?.id ?? null,
                        enabled: databaseSunday?.enabled ?? true,
                        disabled_reason:
                            databaseSunday?.disabled_reason ?? null,
                    };
                });

                setSundays(sundaysWithIds);

                setActiveMonth(activeMonthDate);

                const { data: availabilityData, error: availabilityError } =
                    await supabase
                        .from("availability")
                        .select("sunday_id")
                        .eq("youth_id", currentYouth.id)
                        .eq("available", true);

                if (availabilityError) {
                    throw availabilityError;
                }

                const sundayIds = (availabilityData ?? []).map(
                    (item) => item.sunday_id,
                );

                setSelected(sundayIds);

                setInitialSelected(sundayIds);

                const currentVisibleIds = sundaysWithIds
                    .filter((sunday) => {
                        if (!sunday.enabled || sunday.id === null) {
                            return false;
                        }

                        if (sunday.date > currentDate) {
                            return true;
                        }

                        if (sunday.date < currentDate) {
                            return false;
                        }

                        const currentMinutes =
                            now.getHours() * 60 + now.getMinutes();

                        const cutoffMinutes = 11 * 60 + 30;

                        return currentMinutes < cutoffMinutes;
                    })
                    .map((sunday) => sunday.id);

                const hasCurrentAvailability = sundayIds.some((id) =>
                    currentVisibleIds.includes(id),
                );

                setHadAvailability(hasCurrentAvailability);
            } catch (error) {
                console.error(error);

                setErrorMessage("No se pudieron cargar los domingos.");
            } finally {
                setLoaded(true);
            }
        };

        loadData();
    }, [currentYouth.id, visibleSundayDates, activeMonthDate]);

    const toggleSunday = (id) => {
        setSelected((current) => {
            if (current.includes(id)) {
                return current.filter((item) => item !== id);
            }

            return [...current, id];
        });
    };

    const saveAvailability = async () => {
        const selectedSnapshot = [...selected];

        setSaving(true);
        setErrorMessage(null);

        setSelected(selectedSnapshot);

        if (removedSundayIds.length > 0) {
            const { error: assignmentError } = await supabase
                .from("assignments")
                .update({
                    status: "declined",
                })
                .eq("youth_id", currentYouth.id)
                .in("sunday_id", removedSundayIds)
                .in("status", ["pending", "confirmed"]);

            if (assignmentError) {
                console.error(assignmentError);

                setErrorMessage("No se pudo actualizar tu asignación.");

                setSaving(false);
                return false;
            }

            const { error: availabilityError } = await supabase
                .from("availability")
                .update({
                    available: false,
                })
                .eq("youth_id", currentYouth.id)
                .in("sunday_id", removedSundayIds);

            if (availabilityError) {
                console.error(availabilityError);

                setErrorMessage("No se pudo actualizar tu disponibilidad.");

                setSaving(false);
                return false;
            }

            for (const sundayId of removedSundayIds) {
                try {
                    await notifyAdvisor({
                        type: "youth_unavailable",
                        youthId: currentYouth.id,
                        sundayId,
                    });
                } catch (error) {
                    console.error("No se pudo notificar al asesor:", error);
                }
            }
        }

        const selectedVisibleSundays = selectedSnapshot.filter((sundayId) =>
            visibleSundayIds.includes(sundayId),
        );

        if (selectedVisibleSundays.length > 0) {
            const { data: existingAvailability, error: existingError } =
                await supabase
                    .from("availability")
                    .select("sunday_id")
                    .eq("youth_id", currentYouth.id)
                    .in("sunday_id", selectedVisibleSundays);

            if (existingError) {
                console.error(existingError);

                setErrorMessage("No se pudo comprobar tu disponibilidad.");

                setSaving(false);
                return false;
            }

            const existingSundayIds = (existingAvailability ?? []).map(
                (item) => item.sunday_id,
            );

            if (existingSundayIds.length > 0) {
                const { error: updateError } = await supabase
                    .from("availability")
                    .update({
                        available: true,
                    })
                    .eq("youth_id", currentYouth.id)
                    .in("sunday_id", existingSundayIds);

                if (updateError) {
                    console.error(updateError);

                    setErrorMessage("No se pudo actualizar tu disponibilidad.");

                    setSaving(false);
                    return false;
                }

                for (const sundayId of existingSundayIds) {
                    try {
                        await notifyAdvisor({
                            type: "youth_available",
                            youthId: currentYouth.id,
                            sundayId,
                        });
                    } catch (error) {
                        console.error("No se pudo notificar al asesor:", error);
                    }
                }
            }

            const newSundayIds = selectedVisibleSundays.filter(
                (id) => !existingSundayIds.includes(id),
            );

            if (newSundayIds.length > 0) {
                const rows = newSundayIds.map((sundayId) => ({
                    youth_id: currentYouth.id,
                    sunday_id: sundayId,
                    available: true,
                }));

                const { error: insertError } = await supabase
                    .from("availability")
                    .insert(rows);

                if (insertError) {
                    console.error(insertError);

                    setErrorMessage("No se pudo guardar tu disponibilidad.");

                    setSaving(false);
                    return false;
                }

                for (const sundayId of newSundayIds) {
                    try {
                        await notifyAdvisor({
                            type: "youth_available",
                            youthId: currentYouth.id,
                            sundayId,
                        });
                    } catch (error) {
                        console.error("No se pudo notificar al asesor:", error);
                    }
                }
            }
        }

        setSelected(selectedSnapshot);

        setInitialSelected(selectedSnapshot);

        setSaving(false);

        return true;
    };

    return {
        selected,
        loaded,
        saving,
        errorMessage,
        hadAvailability,
        formattedMonth,
        visibleSundays,
        hasChanges,
        toggleSunday,
        saveAvailability,
    };
}
