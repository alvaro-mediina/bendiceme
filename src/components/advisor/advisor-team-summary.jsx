"use client";

import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";

export default function AdvisorTeamSummary({
    blessCount,
    passCount,
    prepareCount,
    teamIsValid,
    hasTeamChanges,
    savingTeam,
    saveMessage,
    onSave,
}) {
    return (
        <>
            <motion.div
                variants={fadeUp}
                className="mt-8 rounded-2xl border bg-white p-4 sm:p-5"
            >
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold">
                        Equipo
                    </h2>

                    <span className="text-sm text-muted-foreground">
                        {blessCount + passCount}/5
                    </span>
                </div>

                <div className="mt-5 flex flex-col gap-4">
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
            </motion.div>

            <motion.div
                variants={fadeUp}
                whileTap={
                    teamIsValid &&
                    hasTeamChanges &&
                    !savingTeam
                        ? { scale: 0.98 }
                        : undefined
                }
            >
                <Button
                    className="mt-6 h-12 w-full rounded-xl bg-green-600 text-white hover:bg-green-700"
                    disabled={
                        !teamIsValid ||
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
    );
}