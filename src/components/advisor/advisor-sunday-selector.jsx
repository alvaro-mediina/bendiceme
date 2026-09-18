"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { fadeUp } from "@/lib/animations";

export default function AdvisorSundaySelector({
    sundays,
    selectedSundayId,
    onSelect,
    formatSunday,
}) {
    const [showReasonId, setShowReasonId] = useState(null);

    if (sundays.length === 0) {
        return null;
    }

    return (
        <motion.div
            variants={fadeUp}
            className="mt-8"
        >
            <div className="
                flex gap-2 overflow-x-auto pb-1
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
            ">
            {sundays.map((sunday) => {
                const selected =
                    selectedSundayId === sunday.id;

                const disabled = !sunday.enabled;

                const showingReason =
                    showReasonId === sunday.id;

                const handleClick = () => {
                    if (disabled) {
                        setShowReasonId(sunday.id);

                        setTimeout(() => {
                            setShowReasonId(null);
                        }, 3000);

                        return;
                    }

                    onSelect(sunday.id);
                };

                return (
                    <motion.button
                        key={sunday.id}
                        type="button"
                        aria-disabled={disabled}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleClick}
                        className={`
                            shrink-0 rounded-2xl border px-4 py-3
                            text-left transition-colors
                            ${
                                disabled
                                    ? "border-amber-200 bg-amber-50"
                                    : selected
                                    ? "border-green-500 bg-green-50"
                                    : "bg-white hover:border-green-300 hover:bg-green-50"
                            }
                        `}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {showingReason ? (
                                <motion.span
                                    key="reason"
                                    initial={{
                                        opacity: 0,
                                        y: 4,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        y: -4,
                                    }}
                                    transition={{
                                        duration: 0.18,
                                    }}
                                    className="block text-sm font-medium text-amber-700"
                                >
                                    ⛪ {sunday.disabled_reason}
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="date"
                                    initial={{
                                        opacity: 0,
                                        y: 4,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        y: -4,
                                    }}
                                    transition={{
                                        duration: 0.18,
                                    }}
                                    className="block text-sm font-medium"
                                >
                                    {formatSunday(sunday.date)}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                );
            })}
           </div>
        </motion.div>
    );
}