"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ChevronRight, Plus } from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase";  
import { fadeUp, staggerContainer } from "@/lib/animations";
import YouthSelectorSkeleton from "../youth/youth-selector-skeleton";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";

export default function AdvisorYouth({ wardId }) {
    const [search, setSearch] = useState("");
    const [youth, setYouth] = useState([]);
    const [loadingYouth, setLoadingYouth] = useState(true);
    const [youthError, setYouthError] = useState(null);
    const [selectedYouth, setSelectedYouth] = useState(null);

    useEffect(() => {
        if (!wardId) {
            return;
        }

        const loadYouth = async () => {
            setLoadingYouth(true);
            setYouthError(null);

            const { data, error } = await supabase
                .from("youth")
                .select(`
                    id,
                    name,
                    office,
                    active
                `)
                .eq("ward_id", wardId)
                .eq("active", true)
                .order("name", {
                    ascending: true,
                });

            if (error) {
                console.error(
                    "Error cargando jóvenes:",
                    error
                );

                setYouthError(
                    "No se pudieron cargar los jóvenes."
                );

                setLoadingYouth(false);
                return;
            }

            setYouth(data ?? []);
            setLoadingYouth(false);
        };

        loadYouth();
    }, [wardId]);

    const filteredYouth = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return youth;
        }

        return youth.filter((person) =>
            person.name
                .toLowerCase()
                .includes(query)
        );
    }, [search, youth]);

    const activeYouthCount = youth.length;


    return (
        <motion.section
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
        >
            <motion.div variants={fadeUp}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                    Jóvenes
                </p>

                <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
                    Tus jóvenes
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    {activeYouthCount} jóvenes activos
                </p>
            </motion.div>

            <motion.div
                variants={fadeUp}
                className="mt-6"
            >
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Buscar joven..."
                        className="
                            h-12 w-full rounded-2xl border
                            bg-white pl-10 pr-4
                            text-sm outline-none
                            transition-colors
                            placeholder:text-muted-foreground
                            focus:border-green-300
                        "
                    />
                </div>
            </motion.div>

            <motion.div
                variants={fadeUp}
                className="mt-6"
            >
                <div className="flex flex-col gap-3">
                    {loadingYouth ? (
                        <YouthSelectorSkeleton />
                    ) : youthError ? (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {youthError}
                        </div>
                    ) : (
                        <motion.div
                            variants={fadeUp}
                        >
                            <div className="flex flex-col gap-3">
                                {filteredYouth.map(
                                    (person) => (
                                        <button
                                            key={person.id}
                                            type="button"
                                            onClick={() => setSelectedYouth(person)}
                                            className="
                                                flex w-full
                                                items-center
                                                justify-between
                                                rounded-2xl border
                                                bg-white p-4
                                                text-left
                                                transition-colors
                                                hover:border-green-200
                                                hover:bg-green-50/30
                                            "
                                        >
                                            <div>
                                                <p className="font-semibold">
                                                    {
                                                        person.name
                                                    }
                                                </p>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {person.office ===
                                                    "priest"
                                                        ? "Presbítero"
                                                        : "Maestro"}
                                                </p>
                                            </div>

                                            <ChevronRight className="size-5 text-muted-foreground" />
                                        </button>
                                    )
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            <motion.div
                variants={fadeUp}
                className="mt-6"
            >
                <button
                    type="button"
                    className="
                        flex h-12 w-full
                        items-center justify-center
                        gap-2 rounded-2xl
                        border border-green-200
                        bg-green-50
                        text-sm font-semibold
                        text-green-700
                        transition-colors
                        hover:bg-green-100
                    "
                >
                    <Plus className="size-4" />
                    Agregar joven
                </button>
            </motion.div>

        <Sheet
            open={Boolean(selectedYouth)}
            onOpenChange={(open) => {
                if (!open) {
                    setSelectedYouth(null);
                }
            }}
        >
            <SheetContent
                side="bottom"
                className="
                    rounded-t-[28px]
                    px-5 pb-8 pt-3

                    lg:data-[side=bottom]:left-1/2
                    lg:data-[side=bottom]:right-auto
                    lg:data-[side=bottom]:w-[520px]
                    lg:data-[side=bottom]:max-w-[calc(100vw-2rem)]
                    lg:data-[side=bottom]:-translate-x-1/2

                "
            >
                {selectedYouth && (
                    <>
                        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />

                        <div className="flex flex-col items-center text-center">
                            <div
                                className="
                                    grid size-16 place-items-center
                                    rounded-full
                                    bg-green-100
                                    text-lg font-bold
                                    text-green-700
                                "
                            >
                                {selectedYouth.name
                                    .split(" ")
                                    .map((part) => part[0])
                                    .slice(0, 2)
                                    .join("")}
                            </div>

                            <h2 className="mt-4 text-2xl font-bold tracking-tight">
                                {selectedYouth.name}
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {selectedYouth.office === "priest"
                                    ? "Presbítero"
                                    : "Maestro"}
                            </p>

                            <span
                                className="
                                    mt-3 inline-flex items-center
                                    rounded-full
                                    bg-green-100
                                    px-3 py-1
                                    text-xs font-semibold
                                    text-green-700
                                "
                            >
                                Activo
                            </span>
                        </div>

                        <div className="mt-7">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                Datos
                            </p>

                            <div className="mt-3 overflow-hidden rounded-2xl border bg-background">
                                <div className="flex items-center justify-between gap-4 border-b px-4 py-3.5">
                                    <span className="text-sm text-muted-foreground">
                                        Nombre
                                    </span>

                                    <span className="text-right text-sm font-medium">
                                        {selectedYouth.name}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                                    <span className="text-sm text-muted-foreground">
                                        Oficio
                                    </span>

                                    <span className="text-right text-sm font-medium">
                                        {selectedYouth.office === "priest"
                                            ? "Presbítero"
                                            : "Maestro"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-7 space-y-3">
                            <button
                                type="button"
                                className="
                                    h-12 w-full rounded-2xl
                                    bg-green-600
                                    text-sm font-semibold
                                    text-white
                                    transition-colors
                                    hover:bg-green-700
                                "
                            >
                                Editar joven
                            </button>

                            <button
                                type="button"
                                className="
                                    h-12 w-full rounded-2xl
                                    border border-red-200
                                    bg-red-50
                                    text-sm font-semibold
                                    text-red-700
                                    transition-colors
                                    hover:bg-red-100
                                "
                            >
                                Desactivar joven
                            </button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
        </motion.section>
    );
}