"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import DateOption from "./date-option";
import { sundays } from "@/data/mock-data";

export default function YouthHome({ onSave }) {
    const [selected, setSelected] = useState([]);

    const toggleSunday = (id) => {
        setSelected((current) => {
            if (current.includes(id)) {
                return current.filter(
                    (item) => item !== id
                );
            }

            return [...current, id];
        });
    };

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const upcomingSundays = sundays.filter((sunday) => {
        const sundayDate = new Date(`${sunday.date}T00:00:00`);

        return sundayDate >= today;
    });

    return (
        <section className="mx-auto w-full max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                Disponibilidad · Septiembre
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Hola, Mateo
            </h1>

            <p className="mt-2 text-muted-foreground">
                ¿En qué domingos podés servir?
            </p>

            <div className="mt-8 flex flex-col gap-3">
                {upcomingSundays.map((sunday) => (
                    <DateOption
                        key={sunday.id}
                        {...sunday}
                        selected={selected.includes(sunday.id)}
                        onSelect={() => toggleSunday(sunday.id)}
                    />
                ))}
            </div>

            <Button
                className="mt-8 h-12 w-full rounded-xl bg-green-600 text-white hover:bg-green-700"
                onClick={onSave}
                disabled={selected.length === 0}
            >
                Guardar disponibilidad
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
                Podés seleccionar más de un domingo.
            </p>
        </section>
    );
}