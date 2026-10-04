"use client";

import { motion } from "motion/react";

import YouthAssignmentsHeader from "./youth-assignments-header";
import { fadeUp, staggerContainer } from "@/lib/animations";

export default function AssignmentEmptyState({
    onBack,
}) {
    return (
        <motion.section
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mx-auto w-full max-w-xl"
        >
            <YouthAssignmentsHeader
                onBack={onBack}
                backClassName="mb-5 mt-8"
            />

            <motion.h1
                variants={fadeUp}
                className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
            >
                Todavía no tenés turnos asignados
            </motion.h1>

            <motion.p
                variants={fadeUp}
                className="mt-2 text-muted-foreground"
            >
                Cuando el asesor te asigne un domingo,
                aparecerá acá.
            </motion.p>
        </motion.section>
    );
}