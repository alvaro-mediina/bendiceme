"use client";

import { useEffect, useState } from "react";
import { Check, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function AvailabilitySaved({
    currentYouth,
    onEdit,
    onViewAssignments,
}) {
    const [selectedSundays, setSelectedSundays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        const loadAvailability = async () => {
            const { data, error } = await supabase
                .from("availability")
                .select(`
                    sunday_id,
                    sunday:sundays (
                        id,
                        date
                    )
                `)
                .eq("youth_id", currentYouth.id)
                .eq("available", true);

            if (error) {
                console.error(error);

                setErrorMessage(
                    "No se pudo cargar tu disponibilidad."
                );

                setLoading(false);
                return;
            }

            const now = new Date();

            const currentDate = [
                now.getFullYear(),
                String(
                    now.getMonth() + 1
                ).padStart(2, "0"),
                String(
                    now.getDate()
                ).padStart(2, "0"),
            ].join("-");

            const sundays =
                data
                    .map((item) => item.sunday)
                    .filter(
                        (sunday) =>
                            sunday &&
                            sunday.date >= currentDate
                    )
                    .sort(
                        (a, b) =>
                            a.date.localeCompare(b.date)
                    );

            setSelectedSundays(sundays);

            setLoading(false);
        };

        loadAvailability();
    }, [currentYouth.id]);

    if (loading) {
        return (
            <p className="text-sm text-muted-foreground">
                Cargando disponibilidad...
            </p>
        );
    }

    if (errorMessage) {
        return (
            <section className="mx-auto w-full max-w-xl">
                <p className="text-sm text-red-600">
                    {errorMessage}
                </p>

                <Button
                    variant="outline"
                    className="mt-4 rounded-xl"
                    onClick={onEdit}
                >
                    Volver
                </Button>
            </section>
        );
    }

    return (
        <section className="mx-auto w-full max-w-xl">
            <button
                type="button"
                onClick={onEdit}
                className="mb-8 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
                ¡Listo, {currentYouth.name.split(" ")[0]}!
            </h1>

            <p className="mt-2 text-muted-foreground">
                Guardamos los domingos en los que podés servir.
            </p>

            <div className="mt-8 rounded-2xl border bg-white p-5">
                <p className="text-sm font-medium">
                    Tus domingos disponibles
                </p>

                <div className="mt-4 flex flex-col gap-3">
                    {selectedSundays.length > 0 ? (
                        selectedSundays.map((sunday) => {
                            const date = new Date(
                                `${sunday.date}T00:00:00`
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

                            return (
                                <div
                                    key={sunday.id}
                                    className="flex items-center gap-3"
                                >
                                    <div className="grid size-8 place-items-center rounded-full bg-green-50 text-green-700">
                                        <Check className="size-4" />
                                    </div>

                                    <span className="text-sm font-medium capitalize">
                                        {formattedDate}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No tenés domingos disponibles guardados.
                        </p>
                    )}
                </div>
            </div>

            <Button
                className="mt-8 h-12 w-full rounded-xl bg-green-600 text-white hover:bg-green-700"
                onClick={onViewAssignments}
            >
                Ver mis turnos
            </Button>

            <Button
                variant="ghost"
                className="mt-2 w-full rounded-xl"
                onClick={onEdit}
            >
                Editar disponibilidad
            </Button>
        </section>
    );
}