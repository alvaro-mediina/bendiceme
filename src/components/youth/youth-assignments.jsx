"use client";

import { useState } from "react";
import {
    Check,
    ChevronLeft,
    CircleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
    sundays,
    currentYouth,
    currentYouthAssignment,
} from "@/data/mock-data";

export default function YouthAssignments({ onBack }) {
    const [status, setStatus] = useState(
        currentYouthAssignment?.status || "pending"
    );

    const assignmentSunday = sundays.find(
        (sunday) =>
            sunday.id === currentYouthAssignment?.sundayId
    );

    if (!currentYouthAssignment || !assignmentSunday) {
        return (
            <section className="mx-auto w-full max-w-xl">
                <button
                    type="button"
                    onClick={onBack}
                    className="mb-8 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="size-4" />
                    Volver
                </button>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                    Mis turnos
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                    Todavía no tenés turnos asignados
                </h1>

                <p className="mt-2 text-muted-foreground">
                    Cuando el asesor te asigne un domingo,
                    aparecerá acá.
                </p>
            </section>
        );
    }

    const date = new Date(
        `${assignmentSunday.date}T00:00:00`
    );

    const formattedDate = date.toLocaleDateString(
        "es-AR",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
        }
    );

    const roleLabel =
        currentYouthAssignment.role === "bless"
            ? "Bendecir la Santa Cena"
            : "Repartir la Santa Cena";

    const isPending = status === "pending";
    const isConfirmed = status === "confirmed";
    const isDeclined = status === "declined";

    return (
        <section className="mx-auto w-full max-w-xl">
            <button
                type="button"
                onClick={onBack}
                className="mb-8 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
                <ChevronLeft className="size-4" />
                Volver
            </button>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                Mis turnos
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Hola, {currentYouth.name}
            </h1>

            <article className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Próximo turno
                        </p>

                        <p className="mt-2 text-lg font-semibold capitalize">
                            {formattedDate}
                        </p>
                    </div>

                    <span
                        className={`
                            rounded-full px-3 py-1 text-xs font-medium
                            ${
                                isConfirmed
                                    ? "bg-green-100 text-green-700"
                                    : isDeclined
                                      ? "bg-red-100 text-red-700"
                                      : "bg-amber-100 text-amber-700"
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

                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Tu asignación
                    </p>

                    <p className="mt-2 text-xl font-semibold">
                        {roleLabel}
                    </p>
                </div>

                {currentYouthAssignment.prepares && (
                    <div className="mt-4 rounded-xl bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-800">
                            También preparás la Santa Cena
                        </p>

                        <p className="mt-1 text-xs text-green-700">
                            Formás parte del equipo que prepara antes de la reunión.
                        </p>
                    </div>
                )}

                {isPending && (
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

                {isConfirmed && (
                    <div className="mt-6 flex items-center gap-2 text-sm text-green-700">
                        <Check className="size-4" />
                        Confirmaste este turno.
                    </div>
                )}

                {isDeclined && (
                    <div className="mt-6 flex items-center gap-2 text-sm text-red-700">
                        <CircleAlert className="size-4" />
                        Avisaste que no podés asistir.
                    </div>
                )}
            </article>
        </section>
    );
}