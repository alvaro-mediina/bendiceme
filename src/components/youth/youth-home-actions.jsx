"use client";

import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";

export default function YouthHomeActions({
    loaded,
    saving,
    hasChanges,
    hadAvailability,
    onSave,
    onViewAssignments,
}) {
    return (
        <>
            <motion.div
                variants={fadeUp}
                whileTap={
                    saving
                        ? undefined
                        : { scale: 0.98 }
                }
            >
                <Button
                    className="mt-8 h-12 w-full rounded-xl bg-green-600 text-white hover:bg-green-700"
                    onClick={onSave}
                    disabled={
                        !loaded ||
                        saving ||
                        !hasChanges
                    }
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
                whileTap={
                    saving
                        ? undefined
                        : { scale: 0.98 }
                }
            >
                <Button
                    variant="outline"
                    className="mt-3 h-12 w-full rounded-xl"
                    onClick={onViewAssignments}
                    disabled={
                        !loaded ||
                        saving
                    }
                >
                    Ver mis turnos
                </Button>
            </motion.div>

            <motion.p
                variants={fadeUp}
                className="mt-3 text-center text-xs text-muted-foreground"
            >
                Podés seleccionar más de un domingo.
            </motion.p>

            <motion.p
                variants={fadeUp}
                className="mt-1 text-center text-xs text-muted-foreground"
            >
                Tu disponibilidad no garantiza una asignación.
            </motion.p>
        </>
    );
}