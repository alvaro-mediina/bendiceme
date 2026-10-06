"use client";

import PageHeader from "@/components/page-header";
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
            <PageHeader
                eyebrow="Acceso"
                title="¿Cómo querés ingresar?"
                description="Elegí el tipo de acceso que querés usar."
            />

            <motion.div
                variants={staggerContainer}
                className="mt-6 grid gap-5"
            >
                <motion.button
                    variants={fadeUp}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onYouth}
                    onContextMenu={(event) => event.preventDefault()}
                    className="
                            group relative min-h-[120px] overflow-hidden
                            select-none touch-manipulation
                            rounded-2xl border bg-white p-5 pr-28
                            text-left transition-colors
                            hover:border-green-300"
                >
                    <p className="text-lg font-semibold">
                        Soy joven
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Marcá tu disponibilidad y revisá tus turnos.
                    </p>
                    
                    <img
                        src="/images/youth-normal.png"
                        alt=""
                        draggable={false}
                        className="
                            pointer-events-none
                            absolute bottom-0 right-2
                            h-[100px] w-auto
                            select-none
                            group-hover:opacity-0
                            group-active:opacity-0
                            sm:h-[120px]
                        "
                    />

                    <img
                        src="/images/youth-happy.png"
                        alt=""
                        draggable={false}
                        className="
                            pointer-events-none
                            absolute bottom-0 right-2
                            h-[100px] w-auto
                            select-none
                            opacity-0
                            group-hover:opacity-100
                            group-active:opacity-100
                            sm:h-[120px]
                        "
                    />
                </motion.button>

                <motion.button
                    variants={fadeUp}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onAdvisor}
                    onContextMenu={(event) => event.preventDefault()}
                    className="
                            group relative min-h-[120px] overflow-hidden
                            select-none touch-manipulation
                            rounded-2xl border bg-white p-5 pr-28
                            text-left transition-colors
                            hover:border-green-300"
                >                
                    <p className="text-lg font-semibold">
                        Soy asesor
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Organizá el equipo de la Santa Cena.
                    </p>

                    <img
                        src="/images/advisor-normal.png"
                        alt=""
                        draggable={false}
                        className="
                            pointer-events-none
                            absolute bottom-0 right-2
                            h-[100px] w-auto
                            select-none
                            group-hover:opacity-0
                            group-active:opacity-0
                            sm:h-[120px]
                        "
                    />

                    <img
                        src="/images/advisor-happy.png"
                        alt=""
                        draggable={false}
                        className="
                            pointer-events-none
                            absolute bottom-0 right-2
                            h-[100px] w-auto
                            select-none
                            opacity-0
                            group-hover:opacity-100
                            group-active:opacity-100
                            sm:h-[120px]
                        "
                    />
                </motion.button>
            </motion.div>
        </motion.section>
    );
}