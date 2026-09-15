"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import DateOption from "./date-option";
import { ensureAvailableSundays } from "@/lib/sundays";
import { supabase } from "@/lib/supabase";

export default function YouthHome({
    currentYouth,
    onSave,
    onViewAssignments,
}) {
    const [selected, setSelected] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [hadAvailability, setHadAvailability] = useState(false);
    const youthName = currentYouth.name.split(" ")[0];
    const [sundays, setSundays] = useState([]);
    const [activeMonth, setActiveMonth] = useState(null);
    const [initialSelected, setInitialSelected] = useState([]);

    
    const monthName = activeMonth
    ? activeMonth.toLocaleDateString(
          "es-AR",
          {
              month: "long",
          }
      )
    : "";

    const formattedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const now = new Date();

    const currentDate = [
        now.getFullYear(),
        String(
            now.getMonth() + 1
        ).padStart(2, "0"),
        String(
            now.getDate()
        ).padStart(2, "0"),
    ].join("-");

    const visibleSundays = sundays.filter(
        (sunday) =>
            sunday.date >= currentDate
    );

    const visibleSundayIds = visibleSundays.map(
        (sunday) => sunday.id
    );

    const currentVisibleSelected = selected
        .filter((id) =>
            visibleSundayIds.includes(id)
        )
        .sort((a, b) => a - b);

    const initialVisibleSelected = initialSelected
        .filter((id) =>
            visibleSundayIds.includes(id)
        )
        .sort((a, b) => a - b);

    const hasChanges =
        JSON.stringify(currentVisibleSelected) !==
        JSON.stringify(initialVisibleSelected);

    useEffect(() => {
        const loadData = async () => {
            setLoaded(false);
            setErrorMessage(null);

            try {
                const {
                    sundays: sundayData,
                    activeMonthDate,
                } = await ensureAvailableSundays();

                setSundays(sundayData ?? []);
                setActiveMonth(activeMonthDate);

                const {
                    data: availabilityData,
                    error: availabilityError,
                } = await supabase
                    .from("availability")
                    .select("sunday_id")
                    .eq(
                        "youth_id",
                        currentYouth.id
                    )
                    .eq("available", true);

                if (availabilityError) {
                    throw availabilityError;
                }
                const sundayIds =
                    availabilityData.map(
                        (item) => item.sunday_id
                    );

                setSelected(sundayIds);
                setInitialSelected(sundayIds);

                const now = new Date();

                const currentDate = [
                    now.getFullYear(),
                    String(
                        now.getMonth() + 1
                    ).padStart(2, "0"),
                    String(
                        now.getDate()
                    ).padStart(2, "0"),
                ].join("-");

                const visibleSundayIds =
                    (sundayData ?? [])
                        .filter(
                            (sunday) =>
                                sunday.date >= currentDate
                        )
                        .map(
                            (sunday) => sunday.id
                        );

                const hasCurrentAvailability =
                    sundayIds.some((id) =>
                        visibleSundayIds.includes(id)
                    );

                setHadAvailability(
                    hasCurrentAvailability
                );

            } catch (error) {
                console.error(error);

                setErrorMessage(
                    "No se pudieron cargar los domingos."
                );
            } finally {
                setLoaded(true);
            }
        };

        loadData();
    }, [currentYouth.id]);

    const toggleSunday = (id) => {
        setSelected((current) => {
            if (current.includes(id)) {
                return current.filter(
                    (item) => item !== id
                );
            }

            return [...current, id];
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setErrorMessage(null);

        const visibleSundayIds = visibleSundays.map(
            (sunday) => sunday.id
        );

        if (visibleSundayIds.length > 0) {
            const { error: deleteError } =
                await supabase
                    .from("availability")
                    .delete()
                    .eq(
                        "youth_id",
                        currentYouth.id
                    )
                    .in(
                        "sunday_id",
                        visibleSundayIds
                    );

            if (deleteError) {
                console.error(deleteError);

                setErrorMessage(
                    "No se pudo actualizar tu disponibilidad."
                );

                setSaving(false);
                return;
            }
        }

        const selectedVisibleSundays =
            selected.filter((sundayId) =>
                visibleSundayIds.includes(sundayId)
            );

        const newAvailability =
            selectedVisibleSundays.map(
                (sundayId) => ({
                    youth_id: currentYouth.id,
                    sunday_id: sundayId,
                    available: true,
                })
            );

        if (newAvailability.length > 0) {
            const { error: insertError } =
                await supabase
                    .from("availability")
                    .insert(newAvailability);

            if (insertError) {
                console.error(insertError);

                setErrorMessage(
                    "No se pudo guardar tu disponibilidad."
                );

                setSaving(false);
                return;
            }
        }

        setSaving(false);
        onSave();
    };

    if (!loaded) {
        return (
            <p className="text-sm text-muted-foreground">
                Cargando disponibilidad...
            </p>
        );
    }

    return (
        <section className="mx-auto w-full max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                Disponibilidad · {formattedMonth}
            </p>

            <div className="mt-3">
                <h1 className="text-3xl font-semibold tracking-tight">
                    Hola, {youthName}
                </h1>

                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700">
                        {currentYouth.office === "priest"
                            ? "Presbítero"
                            : "Maestro"}
                    </span>
                </div>
            </div>

            <p className="mt-2 text-muted-foreground">
                ¿En qué domingos podés servir?
            </p>

                
            <div className="mt-8 flex flex-col gap-3">
                {visibleSundays.map((sunday) => (
                    <DateOption
                        key={sunday.id}
                        {...sunday}
                        selected={selected.includes(
                            sunday.id
                        )}
                        onSelect={() =>
                            toggleSunday(sunday.id)
                        }
                    />
                ))}
            </div>

            {errorMessage && (
                <p className="mt-4 text-sm text-red-600">
                    {errorMessage}
                </p>
            )}

           <Button
                className="mt-8 h-12 w-full rounded-xl bg-green-600 text-white hover:bg-green-700"
                onClick={handleSave}
                disabled={saving || !hasChanges}
            >
                {saving
                    ? "Guardando..."
                    : hadAvailability
                    ? "Actualizar disponibilidad"
                    : "Guardar disponibilidad"}
            </Button>
            
            <Button
                variant="outline"
                className="mt-3 h-12 w-full rounded-xl"
                onClick={onViewAssignments}
            >
                Ver mis turnos
            </Button>
                        

            <p className="mt-3 text-center text-xs text-muted-foreground">
                Podés seleccionar más de un domingo.
            </p>
        </section>
    );
}