"use client";

import { useState } from "react";
import {
    Check,
    ChevronLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function YouthAssignments({
    onEdit,
}) {
    const [status, setStatus] =
        useState("pending");

    const isConfirmed =
        status === "confirmed";

    const isDeclined =
        status === "declined";

    return (
        <section className="mx-auto w-full max-w-xl">
            <button
                type="button"
                onClick={onEdit}
                className="mb-8 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
                <ChevronLeft className="size-4" />
                Cambiar disponibilidad
            </button>

            <div className="grid size-12 place-items-center rounded-full bg-green-100 text-green-700">
                <Check className="size-6" />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                Disponibilidad guardada
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Tu disponibilidad fue guardada
            </h1>

            <article className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Próximo domingo
                        </p>

                        <div className="mt-2 flex items-end gap-1">
                            <strong className="text-4xl leading-none">
                                20
                            </strong>

                            <span className="text-sm font-semibold text-muted-foreground">
                                SEP
                            </span>
                        </div>
                    </div>

                    <span
                        className={`
                            rounded-full px-3 py-1 text-xs font-medium
                            ${
                                isConfirmed
                                    ? "bg-green-100 text-green-700"
                                    : isDeclined
                                      ? "bg-red-100 text-red-700"
                                      : "bg-orange-100 text-orange-700"
                            }
                        `}
                    >
                        {isConfirmed
                            ? "Confirmado"
                            : isDeclined
                              ? "No puedo"
                              : "Pendiente"}
                    </span>
                </div>

                <div className="my-5 border-t" />

                <p className="font-medium">
                    Tu asignación: Repartir
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                    También preparás la Santa Cena.
                </p>

                {status === "pending" && (
                    <div className="mt-6 flex gap-3">
                        <Button
                            variant="outline"
                            className="h-11 flex-1 rounded-xl"
                            onClick={() =>
                                setStatus("declined")
                            }
                        >
                            No puedo
                        </Button>

                        <Button
                            className="h-11 flex-1 rounded-xl bg-green-600 text-white hover:bg-green-700"
                            onClick={() =>
                                setStatus("confirmed")
                            }
                        >
                            Confirmar
                        </Button>
                    </div>
                )}
            </article>
        </section>
    );
}