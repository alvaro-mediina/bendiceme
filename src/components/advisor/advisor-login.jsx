"use client";

import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";

import BrandLogo from "../brand-logo";
import { Button } from "@/components/ui/button";

import {
    fadeUp,
    staggerContainer,
} from "@/lib/animations";

export default function AdvisorLogin({
    password,
    error,
    onPasswordChange,
    onBack,
    onSubmit,
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
                Acceso de asesor
            </motion.p>

            <motion.button
                variants={fadeUp}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onBack}
                className="mt-5 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ChevronLeft className="size-4" />
                Volver
            </motion.button>

            <motion.h1
                variants={fadeUp}
                className="mt-10 text-2xl font-semibold tracking-tight sm:text-3xl"
            >
                Ingresá la contraseña
            </motion.h1>

            <motion.p
                variants={fadeUp}
                className="mt-2 text-muted-foreground"
            >
                Este acceso está reservado para los asesores.
            </motion.p>

            <motion.form
                variants={fadeUp}
                className="mt-8"
                onSubmit={onSubmit}
            >
                <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                        onPasswordChange(
                            event.target.value
                        )
                    }
                    placeholder="Contraseña"
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border bg-white px-4 outline-none transition-colors focus:border-green-600"
                />

                {error && (
                    <motion.p
                        initial={{
                            opacity: 0,
                            y: 4,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        className="mt-2 text-sm text-red-600"
                    >
                        {error}
                    </motion.p>
                )}

                <motion.div
                    whileTap={{ scale: 0.98 }}
                >
                    <Button
                        type="submit"
                        className="mt-4 h-12 w-full rounded-xl bg-green-600 text-white hover:bg-green-700"
                    >
                        Ingresar
                    </Button>
                </motion.div>
            </motion.form>
        </motion.section>
    );
}