"use client";

import { motion } from "motion/react";
import { fadeUp } from "@/lib/animations";

export default function AdvisorSundaySelector({
    sundays,
    selectedSundayId,
    onSelect,
    formatSunday,
}) {
    if (sundays.length === 0) {
        return null;
    }

    return (
        <motion.div
            variants={fadeUp}
            className="mt-8"
        >
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {sundays.map((sunday) => {
                    const selected =
                        selectedSundayId === sunday.id;

                    return (
                        <motion.button
                            key={sunday.id}
                            type="button"
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                                onSelect(sunday.id)
                            }
                            className={`
                                shrink-0 rounded-xl
                                border px-4 py-3
                                text-sm font-medium
                                transition-colors
                                ${
                                    selected
                                        ? "border-green-600 bg-green-50 text-green-700"
                                        : "bg-white hover:border-green-300"
                                }
                            `}
                        >
                            {formatSunday(sunday.date)}
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
}