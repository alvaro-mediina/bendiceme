"use client";

import { motion } from "motion/react";
import { ChevronLeft } from "lucide-react";

import BrandLogo from "../brand-logo";
import { fadeUp } from "@/lib/animations";

export default function YouthAssignmentsHeader({
    onBack,
    showTitle = true,
    backClassName = "mb-8",
}) {
    return (
        <>
            <motion.div variants={fadeUp}>
                <BrandLogo />
            </motion.div>

            <motion.button
                variants={fadeUp}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onBack}
                className={`${backClassName} flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground`}
            >
                <ChevronLeft className="size-4" />
                Volver
            </motion.button>

            {showTitle && (
                <motion.p
                    variants={fadeUp}
                    className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600"
                >
                    Mis turnos
                </motion.p>
            )}
        </>
    );
}