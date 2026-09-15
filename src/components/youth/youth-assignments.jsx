"use client";

import { useEffect, useState } from "react";

import {
    Check,
    ChevronLeft,
    CircleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { supabase } from "@/lib/supabase";

export default function YouthAssignments({
    currentYouth,
    onBack,
}) {
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const youthName = currentYouth.name.split(" ")[0]

    useEffect(() => {
        const loadAssignment = async () => {
            const { data, error } = await supabase
                .from("assignments")
                .select(`
                    *,
                    sunday:sundays (
                        id,
                        date
                    )
                `)
                .eq("youth_id", currentYouth.id)
                .in("status", [
                    "pending",
                    "confirmed",
                ])
                .order("sunday_id", {
                    ascending: true,
                })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error(error);

                setErrorMessage(
                    "No se pudieron cargar tus turnos."
                );
            } else {
                setAssignment(data);
            }

            setLoading(false);
        };

        loadAssignment();
    }, [currentYouth.id]);

   const updateStatus = async (newStatus) => {
        if (!assignment) {
            return;
        }

        setUpdating(true);
        setErrorMessage(null);

        const {
            data,
            error: assignmentError,
        } = await supabase
            .from("assignments")
            .update({
                status: newStatus,
            })
            .eq("id", assignment.id)
            .select(`
                *,
                sunday:sundays (
                    id,
                    date
                )
            `)
            .single();

        if (assignmentError) {
            console.error(assignmentError);

            setErrorMessage(
                "No se pudo actualizar el turno."
            );

            setUpdating(false);
            return;
        }

        if (newStatus === "declined") {
            const { error: availabilityError } =
                await supabase
                    .from("availability")
                    .update({
                        available: false,
                    })
                    .eq(
                        "youth_id",
                        currentYouth.id
                    )
                    .eq(
                        "sunday_id",
                        assignment.sunday_id
                    );

            if (availabilityError) {
                console.error(
                    availabilityError
                );

                setErrorMessage(
                    "El turno fue rechazado, pero no se pudo actualizar tu disponibilidad."
                );

                setUpdating(false);
                return;
            }
        }

        if (newStatus === "confirmed") {
            const { error: availabilityError } =
                await supabase
                    .from("availability")
                    .upsert(
                        {
                            youth_id:
                                currentYouth.id,
                            sunday_id:
                                assignment.sunday_id,
                            available: true,
                        },
                        {
                            onConflict:
                                "youth_id,sunday_id",
                        }
                    );

            if (availabilityError) {
                console.error(
                    availabilityError
                );

                setErrorMessage(
                    "No se pudo actualizar tu disponibilidad."
                );

                setUpdating(false);
                return;
            }
        }

        setAssignment(data);
        setUpdating(false);
    };

    if (loading) {
        return (
            <p className="text-sm text-muted-foreground">
                Cargando turnos...
            </p>
        );
    }

    if (errorMessage && !assignment) {
        return (
            <section className="mx-auto w-full max-w-xl">
                <p className="text-sm text-red-600">
                    {errorMessage}
                </p>

                <Button
                    variant="outline"
                    className="mt-4 rounded-xl"
                    onClick={onBack}
                >
                    Volver
                </Button>
            </section>
        );
    }

    if (!assignment) {
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

    if (!assignment.sunday) {
        return (
            <section className="mx-auto w-full max-w-xl">
                <p className="text-sm text-red-600">
                    No se encontró la fecha de este turno.
                </p>
            </section>
        );
    }

    const date = new Date(
        `${assignment.sunday.date}T00:00:00`
    );

    const formattedDate =
        date.toLocaleDateString(
            "es-AR",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
            }
        );

    const roleLabel =
        assignment.role === "bless"
            ? "Bendecir"
            : "Repartir";

    const isPending =
        assignment.status === "pending";

    const isConfirmed =
        assignment.status === "confirmed";

    const isDeclined =
        assignment.status === "declined";

    if (isDeclined) {
        return (
            <section className="mx-auto w-full max-w-xl">
                <button
                    type="button"
                    onClick={onBack}
                    className="mb-8 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ChevronLeft className="size-4" />
                    Volver
                </button>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                    Mis turnos
                </p>

                <div className="mt-8">
                    <div className="grid size-12 place-items-center rounded-full bg-red-100 text-red-700">
                        <CircleAlert className="size-6" />
                    </div>

                    <h1 className="mt-6 text-3xl font-semibold tracking-tight">
                        Entonces NO ESTÁS DISPONIBLE.
                    </h1>

                    <p className="mt-3 text-muted-foreground">
                        Avisaste que no vas a poder servir el{" "}
                        <span className="font-medium text-foreground">
                            {formattedDate}
                        </span>.
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                        El asesor verá que ya no estás disponible
                        para ese domingo.
                    </p>
                </div>
            </section>
        );
    }

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
                Hola, {youthName}
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
                            rounded-full px-3 py-1
                            text-xs font-medium
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

                {assignment.prepares && (
                    <div className="mt-4 rounded-xl bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-800">
                            También preparás la Santa Cena
                        </p>

                        <p className="mt-1 text-xs text-green-700">
                            Formás parte del equipo que prepara
                            antes de la reunión.
                        </p>
                    </div>
                )}

                {errorMessage && (
                    <p className="mt-4 text-sm text-red-600">
                        {errorMessage}
                    </p>
                )}

                {isPending && (
                    <div className="mt-6 flex gap-3">
                        <Button
                            variant="outline"
                            className="h-11 flex-1 rounded-xl"
                            disabled={updating}
                            onClick={() =>
                                updateStatus("declined")
                            }
                        >
                            No puedo
                        </Button>

                        <Button
                            className="h-11 flex-1 rounded-xl bg-green-600 text-white hover:bg-green-700"
                            disabled={updating}
                            onClick={() =>
                                updateStatus("confirmed")
                            }
                        >
                            {updating
                                ? "Guardando..."
                                : "Confirmar"}
                        </Button>
                    </div>
                )}

                {isConfirmed && (
                    <div className="mt-6 flex items-center gap-2 text-sm text-green-700">
                        <Check className="size-4" />
                        Confirmaste este turno.
                    </div>
                )}

            </article>
        </section>
    );
}