"use client";

import { useEffect, useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import DateOption from "./date-option";
import BrandLogo from "../brand-logo";
import { getVisibleSundays } from "@/lib/sundays";
import { supabase } from "@/lib/supabase";
import { motion } from "motion/react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { UserRoundCog } from "lucide-react";
import { registerServiceWorker } from "@/lib/register-service-worker";
import { Bell } from "lucide-react";
import { subscribeToPush } from "@/lib/push";

export default function YouthHome({
    currentYouth,
    onSave,
    onViewAssignments,
    onChangeYouth,
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
    const [pushLoading, setPushLoading] = useState(false);
    const [pushEnabled, setPushEnabled] = useState(false);
    const [pushError, setPushError] = useState(null);
    
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

    const visibleSundayIds = visibleSundays
        .filter((sunday) => sunday.id !== null)
        .map((sunday) => sunday.id);

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
                    data: sundayData,
                    error: sundayError,
                } = await supabase
                    .from("sundays")
                    .select("id, date, enabled, disabled_reason")
                    .eq("active", true)
                    .in("date", visibleSundayDates)
                    .order("date", {
                        ascending: true,
                    });

                if (sundayError) {
                    throw sundayError;
                }

                const sundaysWithIds =
                    visibleSundayDates.map((date) => {
                        const databaseSunday =
                            sundayData.find(
                                (sunday) =>
                                    sunday.date === date
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
                    (availabilityData ?? []).map(
                        (item) =>
                            item.sunday_id
                    );

                setSelected(sundayIds);
                setInitialSelected(sundayIds);

                const visibleSundayIds = visibleSundays
                    .filter(
                        (sunday) =>
                            sunday.id !== null &&
                            sunday.enabled,
                    )
                    .map((sunday) => sunday.id);

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
    }, [
        currentYouth.id,
        visibleSundayDates,
        activeMonthDate,
    ]);

    useEffect(() => {
        const checkPushSubscription = async () => {
            if (
                !("serviceWorker" in navigator) ||
                !("PushManager" in window)
            ) {
                return;
            }

            try {
                const registration =
                    await navigator.serviceWorker.ready;

                const subscription =
                    await registration.pushManager.getSubscription();

                const pushYouthId = localStorage.getItem("bendiceme-push-youth-id");

                const belongsToCurrentYouth = pushYouthId === String(currentYouth.id);

                
                setPushEnabled(Boolean(subscription && belongsToCurrentYouth));
                
            } catch (error) {
                console.error(
                    "Error comprobando notificaciones:",
                    error,
                );
            }
        };

        checkPushSubscription();
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

        const visibleSundayIds =
            visibleSundays
                .filter(
                    (sunday) =>
                        sunday.id !== null
                )
                .map(
                    (sunday) =>
                        sunday.id
                );

        // 1. Si quitó disponibilidad y tenía
        // una asignación activa, pasa a declined.
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

            // 2. La disponibilidad existente
            // pasa a false.
            const { error: availabilityError } =
                await supabase
                    .from("availability")
                    .update({
                        available: false,
                    })
                    .eq(
                        "youth_id",
                        currentYouth.id
                    )
                    .in(
                        "sunday_id",
                        removedSundayIds
                    );

            if (availabilityError) {
                console.error(
                    availabilityError
                );

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

        if (selectedVisibleSundays.length > 0) {
            // 3. Averiguamos cuáles filas
            // ya existen.
            const {
                data: existingAvailability,
                error: existingError,
            } = await supabase
                .from("availability")
                .select("sunday_id")
                .eq(
                    "youth_id",
                    currentYouth.id
                )
                .in(
                    "sunday_id",
                    selectedVisibleSundays
                );

            if (existingError) {
                console.error(
                    existingError
                );

                setErrorMessage(
                    "No se pudo comprobar tu disponibilidad."
                );

                setSaving(false);
                return;
            }

            const existingSundayIds =
                (existingAvailability ?? []).map(
                    (item) =>
                        item.sunday_id
                );

            // 4. Si ya existían, simplemente
            // las reactivamos.
            if (existingSundayIds.length > 0) {
                const { error: updateError } =
                    await supabase
                        .from("availability")
                        .update({
                            available: true,
                        })
                        .eq(
                            "youth_id",
                            currentYouth.id
                        )
                        .in(
                            "sunday_id",
                            existingSundayIds
                        );

                if (updateError) {
                    console.error(
                        updateError
                    );

                    setErrorMessage(
                        "No se pudo actualizar tu disponibilidad."
                    );

                    setSaving(false);
                    return;
                }
            }

            // 5. Las que nunca existieron
            // se insertan.
            const newSundayIds =
                selectedVisibleSundays.filter(
                    (id) =>
                        !existingSundayIds.includes(
                            id
                        )
                );

            if (newSundayIds.length > 0) {
                const rows =
                    newSundayIds.map(
                        (sundayId) => ({
                            youth_id:
                                currentYouth.id,
                            sunday_id:
                                sundayId,
                            available: true,
                        })
                    );

                const { error: insertError } =
                    await supabase
                        .from("availability")
                        .insert(rows);

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
        }

        setSaving(false);
        onSave();
    };

    //Notificaciones web-push
    const handleEnableNotifications =
    async () => {
        setPushLoading(true);
        setPushError(null);

        try {
            await subscribeToPush(
                currentYouth.id,
            );

            setPushEnabled(true);
        } catch (error) {
            console.error(
                "Error activando notificaciones:",
                error,
            );

            setPushError(error.message);
        } finally {
            setPushLoading(false);
        }
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
                className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600 sm:mt-3"
            >
                Disponibilidad · {formattedMonth}
            </motion.p>


            <motion.div
                variants={fadeUp}
                className="mt-3 flex items-center justify-between gap-4"
            >
                <div>
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

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onChangeYouth}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-green-50 hover:text-green-700"
                >
                    <UserRoundCog className="size-4" />
                    Cambiar joven
                </motion.button>
            </motion.div>

            <div className="mt-6 rounded-2xl border bg-white p-4">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-50">
                        <Bell className="size-5 text-green-700" />
                    </div>

                    <div className="flex-1">
                        <h2 className="font-medium">
                            Recordatorios
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Recibí una notificación cuando se acerque uno de tus turnos.
                        </p>

                        {pushEnabled ? (
                            <p className="mt-3 text-sm font-medium text-green-700">
                                Notificaciones activadas
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={
                                    handleEnableNotifications
                                }
                                disabled={pushLoading}
                                className="mt-3 text-sm font-medium text-green-700 transition-colors hover:text-green-800 disabled:opacity-50"
                            >
                                {pushLoading
                                    ? "Activando..."
                                    : "Activar notificaciones"}
                            </button>
                        )}

                        {pushError && (
                            <p className="mt-2 text-sm text-red-600">
                                {pushError}
                            </p>
                        )}
                    </div>
                </div>
            </div>

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
                            sunday={sunday}
                            selected={selected.includes(sunday.id)}
                            disabled={!sunday.enabled}
                            disabledReason={sunday.disabled_reason}
                            onToggle={() => toggleSunday(sunday.id)}
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