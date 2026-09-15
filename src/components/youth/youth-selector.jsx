"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function YouthSelector({ onSelect }) {
    const [youth, setYouth] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        const loadYouth = async () => {
            const { data, error } = await supabase
                .from("youth")
                .select("id, name, office, active")
                .eq("active", true)
                .order("name", { ascending: true });

            if (error) {
                setErrorMessage(error.message);
            } else {
                setYouth(data ?? []);
            }

            setLoading(false);
        };

        loadYouth();
    }, []);

    const handleSelect = (person) => {
        localStorage.setItem(
            "bendiceme-current-youth-id",
            person.id
        );

        onSelect(person);
    };

    if (loading) {
        return (
            <p className="text-sm text-muted-foreground">
                Cargando jóvenes...
            </p>
        );
    }

    if (errorMessage) {
        return (
            <p className="text-sm text-red-600">
                Error: {errorMessage}
            </p>
        );
    }

    return (
        <section className="mx-auto w-full max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                BendiceMe
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                ¿Quién sos?
            </h1>

            <p className="mt-2 text-muted-foreground">
                Seleccioná tu nombre para continuar.
            </p>

            <div className="mt-8 flex flex-col gap-3">
                {youth.map((person) => (
                    <button
                        key={person.id}
                        type="button"
                        onClick={() =>
                            handleSelect(person)
                        }
                        className="
                            flex w-full items-center gap-4
                            rounded-2xl border bg-white p-4
                            text-left transition-colors
                            hover:border-green-300 hover:bg-green-50
                        "
                    >
                        <div className="flex-1">
                            <p className="font-medium">
                                {person.name}
                            </p>

                            <span className="mt-1 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-green-200">
                                {person.office ===
                                "priest"
                                    ? "Presbítero"
                                    : "Maestro"}
                            </span>
                        </div>

                        <ChevronRight className="size-5 text-muted-foreground" />
                    </button>
                ))}
            </div>
        </section>
    );
}