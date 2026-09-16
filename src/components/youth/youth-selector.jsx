"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import BrandLogo from "../brand-logo";
import { supabase } from "@/lib/supabase";
import { motion } from "motion/react";
import {
    fadeUp,
    staggerContainer,
} from "@/lib/animations";
import YouthSelectorSkeleton from "./youth-selector-skeleton";

export default function YouthSelector({ onSelect, onBack }) {
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

    if (errorMessage) {
        return (
            <p className="text-sm text-red-600">
                Error: {errorMessage}
            </p>
        );
    }

    return (
        <motion.section 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mx-auto w-full max-w-xl"
        >
            
            <motion.div variants={fadeUp}>
                <BrandLogo/>
            </motion.div>            


            <motion.p 
                variants={fadeUp}
                className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                Acceso de jóvenes
            </motion.p>

            <motion.button
                variants={fadeUp}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onBack}
                className="mt-8 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ChevronLeft className="size-4" />
                Volver
            </motion.button>


            <motion.h1 
                variants={fadeUp}
                className="mt-3 text-3xl font-semibold tracking-tight">
                ¿Quién sos?
            </motion.h1>


            <motion.p 
                variants={fadeUp}
                className="mt-2 text-muted-foreground">
                Elegí tu nombre para administrar tu disponibilidad
                y revisar tus turnos.
            </motion.p>
            
            <motion.div
                variants={staggerContainer}
                className="mt-8"
            >
                {loading ? (
                    <YouthSelectorSkeleton />
                ) : (
                    <div className="flex flex-col gap-3">
                        {youth.map((person) => (
                            <motion.button
                                key={person.id}
                                variants={fadeUp}
                                whileTap={{
                                    scale: 0.98,
                                }}
                                type="button"
                                onClick={() =>
                                    handleSelect(person)
                                }
                                className="
                                    flex min-h-[82px] w-full
                                    items-center gap-4
                                    rounded-2xl border bg-white p-4
                                    text-left transition-colors
                                    hover:border-green-300
                                    hover:bg-green-50
                                "
                            >
                                <div className="flex-1">
                                    <p className="font-medium">
                                        {person.name}
                                    </p>

                                    <span className="mt-1 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-green-200">
                                        {person.office === "priest"
                                            ? "Presbítero"
                                            : "Maestro"}
                                    </span>
                                </div>

                                <ChevronRight className="size-5 text-muted-foreground" />
                            </motion.button>
                        ))}
                    </div>
                )}
            </motion.div>
        </motion.section>
    );
}