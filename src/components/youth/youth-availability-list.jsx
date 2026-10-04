"use client";

import { motion } from "motion/react";

import DateOption from "./date-option";
import DateOptionSkeleton from "./date-option-skeleton";
import { fadeUp, staggerContainer } from "@/lib/animations";

export default function YouthAvailabilityList({
    loaded,
    visibleSundays,
    selected,
    saving,
    toggleSunday,
}) {
    return (
        <>
            <motion.p
                variants={fadeUp}
                className="mt-5 text-muted-foreground"
            >
                ¿En qué domingos podés servir?
            </motion.p>

            {!loaded ? (
                <div className="mt-5 flex flex-col gap-3">
                    {visibleSundays.map((sunday) => (
                        <DateOptionSkeleton
                            key={sunday.date}
                        />
                    ))}
                </div>
            ) : (
                <motion.div
                    variants={staggerContainer}
                    className="mt-5 flex flex-col gap-3"
                >
                    {visibleSundays.map((sunday) => (
                        <motion.div
                            key={sunday.date}
                            variants={fadeUp}
                            whileTap={
                                saving
                                    ? undefined
                                    : { scale: 0.98 }
                            }
                            className={
                                saving
                                    ? "pointer-events-none opacity-60"
                                    : ""
                            }
                        >
                            <DateOption
                                sunday={sunday}
                                selected={
                                    sunday.id !== null &&
                                    selected.includes(
                                        sunday.id
                                    )
                                }
                                disabled={
                                    sunday.id === null ||
                                    !sunday.enabled
                                }
                                disabledReason={
                                    sunday.id === null
                                        ? "Domingo no disponible"
                                        : sunday.disabled_reason
                                }
                                onToggle={() => {
                                    if (
                                        saving ||
                                        sunday.id === null ||
                                        !sunday.enabled
                                    ) {
                                        return;
                                    }

                                    toggleSunday(
                                        sunday.id
                                    );
                                }}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </>
    );
}