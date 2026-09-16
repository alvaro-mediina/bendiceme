"use client";

import BrandLogo from "../brand-logo";
import { motion } from "motion/react";

import {
    fadeUp,
    staggerContainer,
} from "@/lib/animations";

export default function RoleSelector({
    onYouth,
    onAdvisor,
}) {
    return (
        <motion.section
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="w-full max-w-xl"
        >
            <motion.div variants={fadeUp}>
                <BrandLogo />
            </motion.div>

            <motion.p
                variants={fadeUp}
                className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600"
            >
                Acceso
            </motion.p>

            <motion.h1
                variants={fadeUp}
                className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl"
            >
                ¿Cómo querés ingresar?
            </motion.h1>

            <motion.p
                variants={fadeUp}
                className="mt-2 text-muted-foreground"
            >
                Elegí el tipo de acceso que querés usar.
            </motion.p>

            <motion.div
                variants={staggerContainer}
                className="mt-8 grid gap-3"
            >
                <motion.button
                    variants={fadeUp}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onYouth}
                    className="rounded-2xl border bg-white p-5 text-left transition-colors hover:border-green-300"
                >
                    <p className="font-semibold">
                        Soy joven
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Marcá tu disponibilidad y revisá tus turnos.
                    </p>
                </motion.button>

                <motion.button
                    variants={fadeUp}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onAdvisor}
                    className="rounded-2xl border bg-white p-5 text-left transition-colors hover:border-green-300"
                >
                    <p className="font-semibold">
                        Soy asesor
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Organizá el equipo de la Santa Cena.
                    </p>
                </motion.button>
            </motion.div>
        </motion.section>
    );
}