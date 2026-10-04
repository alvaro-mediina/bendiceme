"use client";

import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";
import ConfirmedTeam from "./confirmed-team";

export default function AssignmentCard({
    assignment,
    formattedDate,
    roleLabel,
    isConfirmed,
    isPending,
    updating,
    errorMessage,
    updateStatus,
    loadingTeam,
    confirmedTeam,
    blessingTeam,
    passingTeam,
    currentYouthId,
}) {
    return (
        <motion.article
            variants={fadeUp}
            className="mt-4 rounded-2xl border bg-white p-4 shadow-sm sm:mt-8 sm:p-5"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Próximo turno
                    </p>

                    <p className="mt-2 text-lg font-semibold capitalize">
                        {formattedDate}
                    </p>
                </div>

                <span
                    className={`
                        rounded-full px-3 py-1
                        text-xs font-medium
                        ${
                            isConfirmed
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                        }
                    `}
                >
                    {isConfirmed
                        ? "Confirmado"
                        : "Pendiente"}
                </span>
            </div>

            <div className="my-4 border-t sm:my-5" />

            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tu asignación
                </p>

                <p className="mt-2 text-xl font-semibold">
                    {roleLabel}
                </p>
            </div>

            {assignment.prepares && (
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 6,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.2,
                    }}
                    className="mt-4 rounded-xl bg-green-50 p-4"
                >
                    <p className="text-sm font-medium text-green-800">
                        También preparás la Santa Cena
                    </p>

                    <p className="mt-1 text-xs text-green-700">
                        Formás parte del equipo que prepara
                        antes de la reunión.
                    </p>
                </motion.div>
            )}

            <div className="my-5 border-t" />

            <ConfirmedTeam
                loadingTeam={loadingTeam}
                confirmedTeam={confirmedTeam}
                blessingTeam={blessingTeam}
                passingTeam={passingTeam}
                currentYouthId={currentYouthId}
            />

            {errorMessage && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-sm text-red-600"
                >
                    {errorMessage}
                </motion.p>
            )}

            <AnimatePresence mode="wait">
                {isPending && (
                    <motion.div
                        key="pending"
                        initial={{
                            opacity: 0,
                            y: 8,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            y: -8,
                        }}
                        transition={{
                            duration: 0.2,
                        }}
                        className="mt-6 flex gap-3"
                    >
                        <motion.div
                            className="flex-1"
                            whileTap={{
                                scale: 0.98,
                            }}
                        >
                            <Button
                                variant="outline"
                                className="h-11 w-full rounded-xl"
                                disabled={updating}
                                onClick={() =>
                                    updateStatus(
                                        "declined"
                                    )
                                }
                            >
                                No puedo
                            </Button>
                        </motion.div>

                        <motion.div
                            className="flex-1"
                            whileTap={{
                                scale: 0.98,
                            }}
                        >
                            <Button
                                className="h-11 w-full rounded-xl bg-green-600 text-white hover:bg-green-700"
                                disabled={updating}
                                onClick={() =>
                                    updateStatus(
                                        "confirmed"
                                    )
                                }
                            >
                                {updating
                                    ? "Guardando..."
                                    : "Confirmar"}
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.article>
    );
}