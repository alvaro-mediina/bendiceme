"use client";

import { useEffect, useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import DateOption from "./date-option";
import BrandLogo from "../brand-logo";
import { ensureAvailableSundays, getVisibleSundays } from "@/lib/sundays";
import { supabase } from "@/lib/supabase";
import { motion } from "motion/react";
import { fadeUp, staggerContainer } from "@/lib/animations";

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
    const [initialSelected, setInitialSelected] = useState([]);
    const {
        dates: visibleSundayDates,
        activeMonthDate,
    } = useMemo(
        () => getVisibleSundays(),
        []
    );
    const [sundays, setSundays] = useState(
        () =>
            visibleSundayDates.map(
                (date) => ({
                    date,
                    id: null,
                })
            )
    );

    const [activeMonth, setActiveMonth] = useState(activeMonthDate);
    
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

    const removedSundayIds =
        initialSelected.filter(
            (id) =>
                visibleSundayIds.includes(id) &&
                !selected.includes(id)
        );
    

   useEffect(() => {
        const loadData = async () => {
            setLoaded(false);
            setErrorMessage(null);

            try {
                const {
                    sundays: sundayData,
                } = await ensureAvailableSundays();

                const sundaysWithIds =
                    visibleSundayDates.map((date) => {
                        const databaseSunday =
                            sundayData.find(
                                (sunday) =>
                                    sunday.date === date
                            );

                        return {
                            date,
                            id:
                                databaseSunday?.id ??
                                null,
                        };
                    });

                setSundays(sundaysWithIds);
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
                        (item) =>
                            item.sunday_id
                    );

                setSelected(sundayIds);
                setInitialSelected(sundayIds);

                const visibleSundayIds =
                    sundaysWithIds
                        .filter(
                            (sunday) =>
                                sunday.id !== null
                        )
                        .map(
                            (sunday) =>
                                sunday.id
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
    }, [ currentYouth.id ]);

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

        // Si quitó disponibilidad de un domingo
        // donde tenía una asignación activa,
        // esa asignación pasa a declined.
        if (removedSundayIds.length > 0) {
            const { error: assignmentError } =
                await supabase
                    .from("assignments")
                    .update({
                        status: "declined",
                    })
                    .eq(
                        "youth_id",
                        currentYouth.id
                    )
                    .in(
                        "sunday_id",
                        removedSundayIds
                    )
                    .in("status", [
                        "pending",
                        "confirmed",
                    ]);

            if (assignmentError) {
                console.error(
                    assignmentError
                );

                setErrorMessage(
                    "No se pudo actualizar tu asignación."
                );

                setSaving(false);
                return;
            }
        }

        // Borra la disponibilidad actual
        // únicamente para los domingos visibles.
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
                visibleSundayIds.includes(
                    sundayId
                )
            );

        const newAvailability =
            selectedVisibleSundays.map(
                (sundayId) => ({
                    youth_id:
                        currentYouth.id,
                    sunday_id:
                        sundayId,
                    available: true,
                })
            );

        if (newAvailability.length > 0) {
            const { error: insertError } =
                await supabase
                    .from("availability")
                    .insert(
                        newAvailability
                    );

            if (insertError) {
                console.error(
                    insertError
                );

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


    return (
        <motion.section
            className="mx-auto w-full max-w-xl"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
        >
            
            <motion.div variants={fadeUp}>
                <BrandLogo />
            </motion.div>

            <motion.p
                variants={fadeUp}
                className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-green-600 sm:mt-3"
            >
                Disponibilidad · {formattedMonth}
            </motion.p>


            <motion.div variants={fadeUp} className="mt-3">
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
            </motion.div>

            <motion.p variants={fadeUp} className="mt-5 text-muted-foreground">
                ¿En qué domingos podés servir?
            </motion.p>

                
            <motion.div
                variants={staggerContainer}
                className="mt-5 flex flex-col gap-3"
            >
                {sundays.map((sunday) => (
                    <motion.div
                        key={sunday.date}
                        variants={fadeUp}
                        whileTap={{
                            scale: 0.98,
                        }}
                    >
                        <DateOption
                            {...sunday}
                            selected={
                                sunday.id
                                    ? selected.includes(sunday.id)
                                    : false
                            }
                            onSelect={() => {
                                if (!sunday.id) return;

                                toggleSunday(sunday.id);
                            }}
                        />
                    </motion.div>
                ))}
            </motion.div>

            {errorMessage && (
                <p className="mt-4 text-sm text-red-600">
                    {errorMessage}
                </p>
            )}

            <motion.div 
                variants={fadeUp}
                whileTap={{scale: .98,}}
            >
                <Button
                        className="mt-8 h-12 w-full rounded-xl bg-green-600 text-white hover:bg-green-700"
                        onClick={handleSave}
                        disabled={!loaded || saving || !hasChanges}
                    >
                        {saving
                            ? "Guardando..."
                            : hadAvailability
                            ? "Actualizar disponibilidad"
                            : "Guardar disponibilidad"}
                </Button>
            </motion.div>
            <motion.div 
                variants={fadeUp}
                whileTap={{scale:.98,}}
            >            
                <Button
                    variant="outline"
                    className="mt-3 h-12 w-full rounded-xl"
                    onClick={onViewAssignments}
                    disabled={!loaded}
                >
                    Ver mis turnos
                </Button>
            </motion.div>

            
            <motion.p variants={fadeUp} className="mt-3 text-center text-xs text-muted-foreground">
                Podés seleccionar más de un domingo.
            </motion.p>

            <motion.p variants={fadeUp} className="mt-1 text-center text-xs text-muted-foreground">
                Tu disponibilidad no garantiza una asignación.
            </motion.p>
        </motion.section>
    );
}