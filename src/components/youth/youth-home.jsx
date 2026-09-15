"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import DateOption from "./date-option";
import { sundays } from "@/data/mock-data";

export default function YouthHome({ currentYouth, onSave }) {
    const [selected, setSelected] = useState([]);
    const [loaded, setLoaded] = useState(false);
    
    const storageKey = `bendiceme-availability-${currentYouth.id}`;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingSundays = sundays.filter((sunday) => {
        const sundayDate = new Date(`${sunday.date}T00:00:00`);

        return sundayDate >= today;
    });

    useEffect(() =>{
        const savedAvailability = localStorage.getItem(storageKey);
        
        if (savedAvailability) {
            const parsedAvailability = JSON.parse(savedAvailability);
            setSelected(parsedAvailability);
        }

        setLoaded(true);
    }, [storageKey]);

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

    
    const handleSave = () => {
        localStorage.setItem(storageKey, JSON.stringify(selected))
        onSave();
    };
    
    if(!loaded) return null;
    
    return (
        <section className="mx-auto w-full max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                Disponibilidad · Septiembre
            </p>

            <div className="mt-3">
                <h1 className="text-3xl font-semibold tracking-tight">
                    Hola, {currentYouth.name.split(" ")[0]}
                </h1>

                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">

                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700">
                        {currentYouth.office === "priest"
                            ? "Presbítero"
                            : "Maestro"}
                    </span>
                </div>
            </div>

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
                onClick={handleSave}
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