"use client";

import { motion } from "motion/react";
import { CircleAlert } from "lucide-react";

import PageHeader from "../page-header";
import { scaleIn, staggerContainer } from "@/lib/animations";

export default function AssignmentDeclinedState({
    formattedDate,
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

            <motion.div
                variants={scaleIn}
                className="mt-6"
            >
                <div className="grid size-12 place-items-center rounded-full bg-red-100 text-red-700">
                    <CircleAlert className="size-6" />
                </div>

                <h1 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Entonces no estás disponible.
                </h1>

                <p className="mt-2 text-muted-foreground">
                    Avisaste que no vas a poder servir el{" "}
                    <span className="font-medium text-foreground">
                        {formattedDate}
                    </span>
                    .
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                    El asesor verá que ya no estás disponible
                    para ese domingo.
                </p>
            </motion.div>
        </motion.section>
    );
}