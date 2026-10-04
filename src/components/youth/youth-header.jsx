"use client";

import { motion } from "motion/react";
import { UserRoundCog } from "lucide-react";

import BrandLogo from "../brand-logo";
import { fadeUp } from "@/lib/animations";

export default function YouthHeader({
    currentYouth,
    formattedMonth,
    saving,
    onChangeYouth,
}) {
    const youthName =
        currentYouth.name.split(" ")[0];

    return (
        <>
            <motion.div variants={fadeUp}>
                <BrandLogo />
            </motion.div>

            <motion.p
                variants={fadeUp}
                className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600 sm:mt-3"
            >
                Disponibilidad · {formattedMonth}
            </motion.p>

            <motion.div
                variants={fadeUp}
                className="mt-3 flex items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Hola, {youthName}
                    </h1>

                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700">
                            {currentYouth.office === "priest"
                                ? "Presbítero"
                                : "Maestro"}
                        </span>
                    </div>
                </div>

                <motion.button
                    whileTap={
                        saving
                            ? undefined
                            : { scale: 0.98 }
                    }
                    type="button"
                    onClick={onChangeYouth}
                    disabled={saving}
                    className={`
                        flex items-center gap-2 rounded-lg px-2.5 py-1.5
                        text-sm transition-colors
                        ${
                            saving
                                ? "cursor-not-allowed text-muted-foreground/50"
                                : "text-muted-foreground hover:bg-green-50 hover:text-green-700"
                        }
                    `}
                >
                    <UserRoundCog className="size-4" />
                    Cambiar joven
                </motion.button>
            </motion.div>
        </>
    );
}