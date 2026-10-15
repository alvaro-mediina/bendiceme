"use client";

import { Wrench } from "lucide-react";
import { motion } from "motion/react";

import BrandLogo from "./brand-logo";
import PageContainer from "./layout/page-container";
import {
    fadeUp,
    staggerContainer,
} from "@/lib/animations";

export default function MaintenanceScreen() {
    return (
        <PageContainer center>
            <motion.section
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="w-full max-w-xl text-center"
            >
                <motion.div
                    variants={fadeUp}
                    className="flex justify-center"
                >
                    <BrandLogo />
                </motion.div>

                <motion.div
                    variants={fadeUp}
                    className="mx-auto mt-10 flex size-16 items-center justify-center rounded-2xl bg-green-50 text-green-700"
                >
                    <Wrench className="size-7" />
                </motion.div>

                <motion.h1
                    variants={fadeUp}
                    className="mt-6 text-3xl font-semibold tracking-tight"
                >
                    Estamos trabajando en nuevas funcionalidades
                </motion.h1>

                <motion.p
                    variants={fadeUp}
                    className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground"
                >
                    Estamos preparando una nueva versión de BendiceMe
                    con mejoras en el acceso, la organización por barrios
                    y nuevas herramientas para jóvenes y asesores.
                </motion.p>

                <motion.p
                    variants={fadeUp}
                    className="mt-6 text-sm font-medium text-green-700"
                >
                    Volvé pronto 💚
                </motion.p>
            </motion.section>
        </PageContainer>
    );
}