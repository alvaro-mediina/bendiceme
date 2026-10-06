"use client";

import { motion } from "motion/react";

import { fadeUp, staggerContainer } from "@/lib/animations";
import PageHeader from "../page-header";

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
            <PageHeader
                eyebrow="Mis turnos"
                onBack={onBack}
            />

            <motion.h1
                variants={fadeUp}
                className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl"
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