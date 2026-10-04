"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import DateOption from "./date-option";
import BrandLogo from "../brand-logo";
import { motion } from "motion/react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { UserRoundCog } from "lucide-react";
import { Bell } from "lucide-react";
import { subscribeToPush } from "@/lib/push";
import DateOptionSkeleton from "./date-option-skeleton";
import useYouthAvailability from "@/hooks/use-youth-availability";

export default function YouthHome({
    currentYouth,
    onSave,
    onViewAssignments,
    onChangeYouth,
}) {
        const {
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
    } = useYouthAvailability(
        currentYouth
    );
    
    const youthName = currentYouth.name.split(" ")[0];

    const [pushLoading, setPushLoading] = useState(false);
    const [pushEnabled, setPushEnabled] = useState(false);
    const [pushError, setPushError] = useState(null);
    

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

    const handleSave = async () => {
    const success =
        await saveAvailability();

    if (success) {
        onSave();
    }
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
                    whileTap={
                        saving
                            ? undefined
                            : { scale: 0.98 }
                    }
                    type="button"
                    onClick={onChangeYouth}
                    disabled={saving}
                    className={`
                        flex items-center gap-2 rounded-lg px-2.5 py-1.5
                        text-sm transition-colors
                        ${
                            saving
                                ? "cursor-not-allowed text-muted-foreground/50"
                                : "text-muted-foreground hover:bg-green-50 hover:text-green-700"
                        }
                    `}
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
                                onClick={handleEnableNotifications}
                                disabled={pushLoading || saving}
                                className="mt-3 text-sm font-medium text-green-700 transition-colors hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-50"
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

            {
                !loaded ? (
                    <div className="mt-5 flex flex-col gap-3">
                        {visibleSundays.map((sunday) => (
                            <DateOptionSkeleton
                                key={sunday.date}
                            />
                        ))}
                    </div>

                ): (
                    <motion.div
                variants={staggerContainer}
                className="mt-5 flex flex-col gap-3"
            >
                {visibleSundays.map((sunday) => (
                    <motion.div
                        key={sunday.date}
                        variants={fadeUp}
                        whileTap={
                            saving
                                ? undefined
                                : { scale: 0.98 }
                        }
                        className={
                            saving
                                ? "pointer-events-none opacity-60"
                                : ""
                        }
                    >
                        <DateOption
                            sunday={sunday}
                            selected={
                                sunday.id !== null &&
                                selected.includes(sunday.id)
                            }
                            disabled={
                                sunday.id === null ||
                                !sunday.enabled
                            }
                            disabledReason={
                                sunday.id === null
                                    ? "Domingo no disponible"
                                    : sunday.disabled_reason
                            }
                            onToggle={() => {
                                if (
                                    saving ||
                                    sunday.id === null ||
                                    !sunday.enabled
                                ) {
                                    return;
                                }

                                toggleSunday(sunday.id);
                            }}
                        />
                    </motion.div>
                ))}
            </motion.div>
                )
            }
            

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
                    disabled={!loaded || saving}
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