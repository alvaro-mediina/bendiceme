"use client";

import { useState } from "react";
import {
    Check,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { fadeUp } from "@/lib/animations";

export default function AdvisorYouthCard({
    person,
    assignment,
    blessFull,
    passFull,
    onSelectRole,
    onTogglePrepares,
    expanded,
    onToggleExpanded,
}) {

    const isBlessing =
        assignment?.role === "bless";

    const isPassing =
        assignment?.role === "pass";

    const prepares =
        assignment?.prepares ?? false;

    const canBless =
        person.office === "priest";

    const roleLabel = isBlessing
        ? "Bendice"
        : isPassing
          ? "Reparte"
          : "Sin asignar";

    const removeAssignment = () => {
        if (!assignment) return;

        onSelectRole(
            person.id,
            assignment.role
        );
    };

    return (
        <motion.div
            variants={fadeUp}
            className={`
                overflow-hidden rounded-2xl border
                transition-colors
                ${
                    assignment?.status === "confirmed"
                        ? "border-green-200 bg-green-50/30"
                        : assignment?.status === "pending"
                        ? "border-amber-200 bg-amber-50/30"
                        : assignment?.status === "draft"
                            ? "border-slate-200 bg-slate-50/70"
                            : "border-border bg-white"
                }
            `}
        >
            {/* CABECERA */}
            <button
                type="button"
                onClick={onToggleExpanded}
                className="flex w-full items-center justify-between gap-4 p-4 text-left"
            >
                <div className="min-w-0">
                    <p className="truncate font-semibold">
                        {person.name}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {person.office === "priest"
                            ? "Presbítero"
                            : "Maestro"}
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                        <p
                            className={`text-sm font-semibold ${
                                assignment?.status === "confirmed"
                                    ? "text-green-700"
                                    : assignment?.status === "pending"
                                    ? "text-amber-700"
                                    : assignment?.status === "draft"
                                        ? "text-slate-700"
                                        : "text-muted-foreground"
                            }`}
                        >
                            {roleLabel}
                        </p>

                        {prepares && (
                            <p className="mt-0.5 text-xs font-medium text-green-600">
                                Prepara
                            </p>
                        )}
                    </div>

                    {expanded ? (
                        <ChevronUp className="size-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="size-4 text-muted-foreground" />
                    )}
                </div>
            </button>

            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{
                            height: 0,
                            opacity: 0,
                        }}
                        animate={{
                            height: "auto",
                            opacity: 1,
                        }}
                        exit={{
                            height: 0,
                            opacity: 0,
                        }}
                        className="overflow-hidden"
                    >
                        <div className="border-t px-4 pb-4 pt-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    Asignación
                                </p>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {canBless && (
                                    <button
                                        type="button"
                                        disabled={blessFull || isBlessing}
                                        onClick={() =>
                                            onSelectRole(
                                                person.id,
                                                "bless"
                                            )
                                        }
                                        className={`
                                            rounded-xl border px-3 py-3
                                            text-sm font-semibold
                                            transition-all
                                            ${
                                                isBlessing
                                                    ? "border-green-600 bg-green-600 text-white shadow-sm"
                                                    : blessFull
                                                    ? "cursor-not-allowed bg-muted text-muted-foreground opacity-50"
                                                    : "bg-background hover:border-green-300 hover:bg-green-50/50"
                                            }
                                        `}
                                    >
                                        Bendecir
                                    </button>
                                )}

                                <button
                                    type="button"
                                    disabled={passFull || isPassing}
                                    onClick={() =>
                                        onSelectRole(
                                            person.id,
                                            "pass"
                                        )
                                    }
                                    className={`
                                        rounded-xl border px-3 py-3
                                        text-sm font-semibold
                                        transition-all
                                        ${
                                            isPassing
                                                ? "border-green-600 bg-green-600 text-white shadow-sm"
                                                : passFull
                                                ? "cursor-not-allowed bg-muted text-muted-foreground opacity-50"
                                                : "bg-background hover:border-green-300 hover:bg-green-50/50"
                                        }
                                    `}
                                >
                                    Repartir
                                </button>
                            </div>

                            {assignment && (
                                <div className="mt-5 space-y-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onTogglePrepares(person.id)
                                        }
                                        className={`
                                            flex w-full
                                            items-center justify-between
                                            rounded-xl border
                                            px-3 py-3 text-sm
                                            transition-all
                                            ${
                                                prepares
                                                    ? "border-green-300 bg-green-50 text-green-800"
                                                    : "bg-background hover:border-green-200 hover:bg-green-50/40"
                                            }
                                        `}
                                    >
                                        <span>
                                            Prepara la Santa Cena
                                        </span>

                                        <span
                                            className={`
                                                grid size-5 place-items-center
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

                                    <button
                                        type="button"
                                        onClick={removeAssignment}
                                        className="
                                            w-full rounded-xl
                                            border border-red-200
                                            bg-red-50
                                            px-3 py-3
                                            text-sm font-semibold
                                            text-red-700
                                            transition-colors
                                            hover:border-red-300
                                            hover:bg-red-100
                                        "
                                    >
                                        Quitar del equipo
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}