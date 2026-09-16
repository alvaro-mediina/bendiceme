"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";

import { fadeUp } from "@/lib/animations";

export default function AdvisorYouthCard({
    person,
    assignment,
    blessFull,
    passFull,
    onSelectRole,
    onTogglePrepares,
}) {
    const isBlessing =
        assignment?.role === "bless";

    const isPassing =
        assignment?.role === "pass";

    const prepares =
        assignment?.prepares ?? false;

    const canBless =
        person.office === "priest";

    const isConfirmed =
        assignment?.status === "confirmed";

    return (
        <motion.div
            variants={fadeUp}
            className={`
                rounded-2xl border p-4
                transition-colors
                ${
                    assignment
                        ? "border-green-200 bg-green-50/40"
                        : "bg-white"
                }
            `}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="font-medium">
                        {person.name}
                    </p>

                    <span className="mt-1 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-green-200">
                        {person.office === "priest"
                            ? "Presbítero"
                            : "Maestro"}
                    </span>
                </div>

                {assignment && (
                    <span
                        className={`
                            rounded-full px-2.5 py-1
                            text-xs font-medium
                            ${
                                isConfirmed
                                    ? "bg-green-100 text-green-700"
                                    : "bg-amber-100 text-amber-700"
                            }
                        `}
                    >
                        {isConfirmed
                            ? "Confirmado"
                            : "Pendiente"}
                    </span>
                )}
            </div>

            <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Asignación
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                    {canBless && (
                        <button
                            type="button"
                            disabled={blessFull}
                            onClick={() =>
                                onSelectRole(
                                    person.id,
                                    "bless"
                                )
                            }
                            className={`
                                rounded-xl border
                                px-3 py-2
                                text-sm font-medium
                                transition-colors
                                ${
                                    isBlessing
                                        ? "border-green-600 bg-green-600 text-white"
                                        : blessFull
                                            ? "cursor-not-allowed bg-muted text-muted-foreground opacity-50"
                                            : "bg-white hover:border-green-300"
                                }
                            `}
                        >
                            Bendecir
                        </button>
                    )}

                    <button
                        type="button"
                        disabled={passFull}
                        onClick={() =>
                            onSelectRole(
                                person.id,
                                "pass"
                            )
                        }
                        className={`
                            rounded-xl border
                            px-3 py-2
                            text-sm font-medium
                            transition-colors
                            ${
                                isPassing
                                    ? "border-green-600 bg-green-600 text-white"
                                    : passFull
                                        ? "cursor-not-allowed bg-muted text-muted-foreground opacity-50"
                                        : "bg-white hover:border-green-300"
                            }
                        `}
                    >
                        Repartir
                    </button>
                </div>
            </div>

            {assignment && (
                <button
                    type="button"
                    onClick={() =>
                        onTogglePrepares(
                            person.id
                        )
                    }
                    className={`
                        mt-3 flex w-full
                        items-center justify-between
                        rounded-xl border
                        px-3 py-3 text-sm
                        transition-colors
                        ${
                            prepares
                                ? "border-green-300 bg-green-50 text-green-800"
                                : "bg-white hover:border-green-200"
                        }
                    `}
                >
                    <span>
                        Prepara la Santa Cena
                    </span>

                    <span
                        className={`
                            grid size-5
                            place-items-center
                            rounded-md border
                            ${
                                prepares
                                    ? "border-green-600 bg-green-600 text-white"
                                    : "border-muted-foreground/30"
                            }
                        `}
                    >
                        {prepares && (
                            <Check className="size-3.5" />
                        )}
                    </span>
                </button>
            )}
        </motion.div>
    );
}