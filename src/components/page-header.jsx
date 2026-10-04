"use client";

import { motion } from "motion/react";
import { ChevronLeft } from "lucide-react";

import BrandLogo from "./brand-logo";
import { fadeUp } from "@/lib/animations";

export default function PageHeader({
    eyebrow,
    title,
    description,
    onBack,
    action,
}) {
    return (
        <header>
            <motion.div variants={fadeUp}>
                <BrandLogo />
            </motion.div>

            <motion.div
                variants={fadeUp}
                className="mt-1"
            >
                {eyebrow && (
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                        {eyebrow}
                    </p>
                )}

                {onBack && (
                    <motion.button
                        variants={fadeUp}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={onBack}
                        className="mt-6 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ChevronLeft className="size-4" />
                        Volver
                    </motion.button>
                )}

                {(title || description || action) && (
                   <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            {title && (
                                <h1 className="text-3xl font-semibold leading-tight tracking-tight">
                                    {title}
                                </h1>
                            )}

                            {description && (
                                <p className="mt-1 text-sm font-medium text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>

                        {action && (
                            <div className="flex shrink-0 items-center gap-1.5">
                                {action}
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </header>
    );
}