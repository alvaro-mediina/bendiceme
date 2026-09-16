"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export default function AdvisorTeamSummary({
    blessCount,
    passCount,
    prepareCount,
    teamIsValid,
    hasTeamChanges,
    savingTeam,
    saveMessage,
    availablePriests,
    availableYouthCount,
    onSave,
    showSaveButton = true,
}) {
    let warningMessage = null;

    if (availableYouthCount < 5) {
        warningMessage =
            `Solo hay ${availableYouthCount} jóvenes disponibles. Se necesitan 5 para completar el equipo.`;
    } else if (availablePriests < 2) {
        warningMessage =
            "No hay suficientes presbíteros disponibles para asignar 2 a bendecir.";
    } else if (!teamIsValid) {
        if (blessCount < 2) {
            const missing = 2 - blessCount;

            warningMessage =
                `Falta${missing > 1 ? "n" : ""} ${missing} ${
                    missing === 1
                        ? "joven"
                        : "jóvenes"
                } para bendecir.`;
        } else if (passCount < 3) {
            const missing = 3 - passCount;

            warningMessage =
                `Falta${missing > 1 ? "n" : ""} ${missing} ${
                    missing === 1
                        ? "joven"
                        : "jóvenes"
                } para repartir.`;
        } else if (prepareCount < 2) {
            const missing = 2 - prepareCount;

            warningMessage =
                `Falta${missing > 1 ? "n" : ""} ${missing} ${
                    missing === 1
                        ? "joven"
                        : "jóvenes"
                } para preparar la Santa Cena.`;
        }
    }

    return (
        <div
            className="rounded-2xl border bg-white p-5 text-center"
        >
            <div className="flex flex-col items-center">
                <h2 className="text-lg font-semibold">
                    Equipo
                </h2>

                <p
                    className={`mt-1 text-xs ${
                        teamIsValid
                            ? "text-green-700"
                            : "text-amber-700"
                    }`}
                >
                    {teamIsValid
                        ? "Equipo completo"
                        : "Equipo todavía incompleto"}
                </p>

                <span className="mt-3 text-2xl font-semibold tracking-tight">
                    {blessCount + passCount}/5
                </span>

                <span className="text-xs text-muted-foreground">
                    jóvenes asignados
                </span>
            </div>

            <div className="mx-auto mt-6 flex max-w-[220px] flex-col gap-4 text-left">
                <div className="flex items-center justify-between">
                    <span className="text-sm">
                        Bendecir
                    </span>

                    <span
                        className={
                            blessCount === 2
                                ? "text-sm font-semibold text-green-700"
                                : "text-sm font-semibold text-muted-foreground"
                        }
                    >
                        {blessCount}/2
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm">
                        Repartir
                    </span>

                    <span
                        className={
                            passCount === 3
                                ? "text-sm font-semibold text-green-700"
                                : "text-sm font-semibold text-muted-foreground"
                        }
                    >
                        {passCount}/3
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm">
                        Preparación
                    </span>

                    <span
                        className={
                            prepareCount >= 2
                                ? "text-sm font-semibold text-green-700"
                                : "text-sm font-semibold text-muted-foreground"
                        }
                    >
                        {prepareCount}/2
                    </span>
                </div>
            </div>

            {warningMessage && (
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 4,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="mx-auto mt-6 max-w-[240px] rounded-xl bg-amber-50 p-3 text-sm text-amber-800"
                >
                    {warningMessage}
                </motion.div>
            )}

            {showSaveButton && (
                <>
                    <motion.div
                        whileTap={
                            hasTeamChanges &&
                            !savingTeam
                                ? {
                                    scale: 0.98,
                                }
                                : undefined
                        }
                        className="mx-auto max-w-[240px]"
                    >
                        <Button
                            className="mt-6 h-12 w-full rounded-xl bg-green-600 text-white hover:bg-green-700"
                            disabled={
                                savingTeam ||
                                !hasTeamChanges
                            }
                            onClick={onSave}
                        >
                            {savingTeam
                                ? "Guardando..."
                                : hasTeamChanges
                                ? "Guardar cambios"
                                : "Equipo guardado"}
                        </Button>
                    </motion.div>

                    {saveMessage && (
                        <motion.p
                            initial={{
                                opacity: 0,
                                y: 4,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            className="mt-3 text-center text-sm font-medium text-green-700"
                        >
                            {saveMessage}
                        </motion.p>
                    )}
                </>
            )}
        </div>
    );
}