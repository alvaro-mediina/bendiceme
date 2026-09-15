"use client";

import { useEffect, useState } from "react";

import BrandLogo from "../brand-logo";
import { supabase } from "@/lib/supabase";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    fadeUp,
    staggerContainer,
} from "@/lib/animations";

export default function AdvisorView() {
    const [sundays, setSundays] = useState({});
    const [selectedSundayId, setSelectedSundayId] = useState(null);
    const [availableYouth, setAvailableYouth] = useState([]);
    const [loadingSundays, setLoadingSundays] = useState(true);
    const [loadingYouth, setLoadingYouth] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [team, setTeam] = useState([]);

    useEffect(() => {
        const loadSundays = async () => {
            setLoadingSundays(true);
            setErrorMessage(null);

            const now = new Date();

            const today = [
                now.getFullYear(),
                String(
                    now.getMonth() + 1
                ).padStart(2, "0"),
                String(
                    now.getDate()
                ).padStart(2, "0"),
            ].join("-");

            const { data, error } =
                await supabase
                    .from("sundays")
                    .select("id, date")
                    .eq("active", true)
                    .gte("date", today)
                    .order("date", {
                        ascending: true,
                    });

            if (error) {
                console.error(error);

                setErrorMessage(
                    "No se pudieron cargar los domingos."
                );

                setLoadingSundays(false);
                return;
            }

            setSundays(data ?? []);

            if (data?.length > 0) {
                setSelectedSundayId(
                    data[0].id
                );
            }

            setLoadingSundays(false);
        };

        loadSundays();
    }, []);

    useEffect(() => {
        if (!selectedSundayId) {
            return;
        }

        const loadAvailableYouth = async () => {
            setLoadingYouth(true);
            setErrorMessage(null);

            const { data, error } =
                await supabase
                    .from("availability")
                    .select(`
                        youth_id,
                        youth:youth (
                            id,
                            name,
                            office,
                            active
                        )
                    `)
                    .eq(
                        "sunday_id",
                        selectedSundayId
                    )
                    .eq("available", true);

            if (error) {
                console.error(error);

                setErrorMessage(
                    "No se pudieron cargar los jóvenes disponibles."
                );

                setLoadingYouth(false);
                return;
            }

            const youthList = (data ?? [])
                .map((item) => item.youth)
                .filter(
                    (person) =>
                        person &&
                        person.active
                )
                .sort((a, b) =>
                    a.name.localeCompare(
                        b.name
                    )
                );

            setAvailableYouth(youthList);
            setLoadingYouth(false);
        };

        loadAvailableYouth();
    }, [selectedSundayId]);

    const formatSunday = (dateString) => {
        const date = new Date(
            `${dateString}T00:00:00`
        );

        return date.toLocaleDateString(
            "es-AR",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
            }
        );
    };

    useEffect(() => {
        setTeam({});
    }, [selectedSundayId]);

    const selectRole = (youthId, role) => {
        setTeam((current) => {
            const currentAssignment =
                current[youthId];

            // Si toca nuevamente el mismo rol,
            // quitamos al joven del equipo.
            if (
                currentAssignment?.role === role
            ) {
                const next = { ...current };

                delete next[youthId];

                return next;
            }

            return {
                ...current,
                [youthId]: {
                    role,
                    prepares:
                        currentAssignment?.prepares ??
                        false,
                },
            };
        });
    };

    const togglePrepares = (youthId) => {
        setTeam((current) => {
            const assignment =
                current[youthId];

            // Para preparar primero debe
            // formar parte del equipo.
            if (!assignment) {
                return current;
            }

            return {
                ...current,
                [youthId]: {
                    ...assignment,
                    prepares:
                        !assignment.prepares,
                },
            };
        });
    };

    const teamMembers = Object.values(team);

    const blessCount =
        teamMembers.filter(
            (assignment) =>
                assignment.role === "bless"
        ).length;

    const passCount =
        teamMembers.filter(
            (assignment) =>
                assignment.role === "pass"
        ).length;

    const prepareCount =
        teamMembers.filter(
            (assignment) =>
                assignment.prepares
        ).length;

    const teamIsValid =
        blessCount === 2 &&
        passCount === 3 &&
        prepareCount >= 2;

    return (
        <motion.section
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mx-auto w-full max-w-2xl"
        >
            <motion.div variants={fadeUp}>
                <BrandLogo />
            </motion.div>

            <motion.p
                variants={fadeUp}
                className="mt-2 mb-8 text-xs font-semibold uppercase tracking-[0.18em] text-green-600"
            >
                Gestión del domingo
            </motion.p>

            <motion.h1
                variants={fadeUp}
                className="mt-8 text-2xl font-semibold tracking-tight sm:text-3xl"
            >
                Organizá el equipo
            </motion.h1>

            <motion.p
                variants={fadeUp}
                className="mt-2 text-muted-foreground"
            >
                Elegí un domingo y revisá qué jóvenes
                están disponibles para servir.
            </motion.p>

            {errorMessage && (
                <p className="mt-4 text-sm text-red-600">
                    {errorMessage}
                </p>
            )}

            {!loadingSundays &&
                sundays.length > 0 && (
                    <motion.div
                        variants={fadeUp}
                        className="mt-8"
                    >
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                            {sundays.map(
                                (sunday) => {
                                    const selected =
                                        selectedSundayId ===
                                        sunday.id;

                                    return (
                                        <button
                                            key={
                                                sunday.id
                                            }
                                            type="button"
                                            onClick={() =>
                                                setSelectedSundayId(
                                                    sunday.id
                                                )
                                            }
                                            className={`
                                                shrink-0 rounded-xl
                                                border px-4 py-3
                                                text-sm font-medium
                                                transition-colors
                                                ${
                                                    selected
                                                        ? "border-green-600 bg-green-50 text-green-700"
                                                        : "bg-white hover:border-green-300"
                                                }
                                            `}
                                        >
                                            {formatSunday(
                                                sunday.date
                                            )}
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    </motion.div>
                )}

            <motion.div
                variants={fadeUp}
                className="mt-8"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        Jóvenes disponibles
                    </h2>

                    {!loadingYouth && (
                        <span className="text-sm text-muted-foreground">
                            {availableYouth.length}
                        </span>
                    )}
                </div>

                {loadingYouth ? (
                    <div className="mt-4 flex flex-col gap-3">
                        {[1, 2, 3].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="h-[76px] animate-pulse rounded-2xl border bg-muted"
                                />
                            )
                        )}
                    </div>
                ) : availableYouth.length > 0 ? (
                    <div className="mt-4 flex flex-col gap-3">

                        {availableYouth.map((person) => {
                            const assignment =
                                team[person.id];

                            const isBlessing =
                                assignment?.role === "bless";

                            const isPassing =
                                assignment?.role === "pass";

                            const prepares =
                                assignment?.prepares ?? false;

                            const canBless =
                                person.office === "priest";

                            return (
                                <motion.div
                                    key={person.id}
                                    variants={fadeUp}
                                    className={`
                                        rounded-2xl border p-4
                                        transition-colors
                                        ${
                                            assignment
                                                ? "border-green-200 bg-green-50/40"
                                                : "bg-white"
                                        }
                                    `}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
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

                                        {assignment && (
                                            <span className="text-xs font-medium text-green-700">
                                                En el equipo
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Asignación
                                        </p>

                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {canBless && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        selectRole(
                                                            person.id,
                                                            "bless"
                                                        )
                                                    }
                                                    className={`
                                                        rounded-xl border
                                                        px-3 py-2
                                                        text-sm font-medium
                                                        transition-colors
                                                        ${
                                                            isBlessing
                                                                ? "border-green-600 bg-green-600 text-white"
                                                                : "bg-white hover:border-green-300"
                                                        }
                                                    `}
                                                >
                                                    Bendecir
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    selectRole(
                                                        person.id,
                                                        "pass"
                                                    )
                                                }
                                                className={`
                                                    rounded-xl border
                                                    px-3 py-2
                                                    text-sm font-medium
                                                    transition-colors
                                                    ${
                                                        isPassing
                                                            ? "border-green-600 bg-green-600 text-white"
                                                            : "bg-white hover:border-green-300"
                                                    }
                                                `}
                                            >
                                                Repartir
                                            </button>
                                        </div>
                                    </div>

                                    {assignment && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                togglePrepares(
                                                    person.id
                                                )
                                            }
                                            className={`
                                                mt-3 flex w-full
                                                items-center justify-between
                                                rounded-xl border
                                                px-3 py-3 text-sm
                                                transition-colors
                                                ${
                                                    prepares
                                                        ? "border-green-300 bg-green-50 text-green-800"
                                                        : "bg-white hover:border-green-200"
                                                }
                                            `}
                                        >
                                            <span>
                                                Prepara la Santa Cena
                                            </span>

                                            <span
                                                className={`
                                                    grid size-5
                                                    place-items-center
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
                                    )}
                                </motion.div>
                            );
                    })}

                    
                    </div>
                ) : (
                    <div className="mt-4 rounded-2xl border border-dashed p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Todavía no hay jóvenes
                            disponibles para este domingo.
                        </p>
                    </div>
                )}
                
            </motion.div>
                

            <motion.div
                variants={fadeUp}
                className="mt-8 rounded-2xl border bg-white p-4 sm:p-5"
            >
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold">
                        Equipo
                    </h2>

                    <span className="text-sm text-muted-foreground">
                        {blessCount + passCount}/5
                    </span>
                </div>

                <div className="mt-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">
                            Bendecir
                        </span>

                        <span
                            className={
                                blessCount === 2
                                    ? "text-sm font-semibold text-green-700"
                                    : "text-sm font-semibold text-muted-foreground"
                            }
                        >
                            {blessCount}/2
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm">
                            Repartir
                        </span>

                        <span
                            className={
                                passCount === 3
                                    ? "text-sm font-semibold text-green-700"
                                    : "text-sm font-semibold text-muted-foreground"
                            }
                        >
                            {passCount}/3
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm">
                            Preparación
                        </span>

                        <span
                            className={
                                prepareCount >= 2
                                    ? "text-sm font-semibold text-green-700"
                                    : "text-sm font-semibold text-muted-foreground"
                            }
                        >
                            {prepareCount}/2
                        </span>
                    </div>
                </div>
            </motion.div>

            <motion.div
                variants={fadeUp}
                whileTap={
                    teamIsValid
                        ? { scale: 0.98 }
                        : undefined
                }
            >
                <Button
                    className="mt-6 h-12 w-full rounded-xl bg-green-600 text-white hover:bg-green-700"
                    disabled={!teamIsValid}
                >
                    Guardar equipo
                </Button>
            </motion.div>

        </motion.section>
        
    );
}