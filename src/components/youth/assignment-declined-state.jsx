"use client";

import { motion } from "motion/react";
import { CircleAlert } from "lucide-react";

import YouthAssignmentsHeader from "./youth-assignments-header";
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
            <YouthAssignmentsHeader
                onBack={onBack}
                backClassName="mb-3 mt-3"
            />

            <motion.div
                variants={scaleIn}
                className="mt-8"
            >
                <div className="grid size-12 place-items-center rounded-full bg-red-100 text-red-700">
                    <CircleAlert className="size-6" />
                </div>

                <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Entonces NO ESTÁS DISPONIBLE.
                </h1>

                <p className="mt-3 text-muted-foreground">
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