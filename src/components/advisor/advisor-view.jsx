"use client";

import { useEffect, useState } from "react";

import BrandLogo from "../brand-logo";
import AdvisorYouthCard from "./advisor-youth-card";
import AdvisorTeamSummary from "./advisor-team-summary";
import { supabase } from "@/lib/supabase";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
    fadeUp,
    staggerContainer,
} from "@/lib/animations";

export default function AdvisorView() {
    const [sundays, setSundays] = useState([]);
    const [selectedSundayId, setSelectedSundayId] = useState(null);
    const [availableYouth, setAvailableYouth] = useState([]);
    const [loadingSundays, setLoadingSundays] = useState(true);
    const [loadingYouth, setLoadingYouth] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [team, setTeam] = useState({});
    const [savingTeam, setSavingTeam] = useState(false);
    const [saveMessage, setSaveMessage] = useState(null);
    const [initialTeam, setInitialTeam] = useState({});


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
        if (!selectedSundayId) {
            return;
        }

        const loadTeam = async () => {
            const { data, error } = await supabase
                .from("assignments")
                .select(`
                    youth_id,
                    role,
                    prepares,
                    status
                `)
                .eq("sunday_id", selectedSundayId)
                .in("status", ["pending", "confirmed"]);

            if (error) {
                console.error(error);

                setErrorMessage(
                    "No se pudo cargar el equipo guardado."
                );

                return;
            }

            const savedTeam = {};

            (data ?? []).forEach((assignment) => {
                savedTeam[assignment.youth_id] = {
                    role: assignment.role,
                    prepares: assignment.prepares,
                    status: assignment.status,
                };
            });

            setTeam(savedTeam);
            setInitialTeam(savedTeam);
        };

        loadTeam();
    }, [selectedSundayId]);

    const selectRole = (youthId, role) => {
        setTeam((current) => {
            const currentAssignment = current[youthId];

            // Si toca el mismo rol, lo quitamos del equipo
            if (currentAssignment?.role === role) {
                const next = { ...current };
                delete next[youthId];
                return next;
            }

            const assignments = Object.values(current);

            const currentBlessCount = assignments.filter(
                (assignment) => assignment.role === "bless"
            ).length;

            const currentPassCount = assignments.filter(
                (assignment) => assignment.role === "pass"
            ).length;

            // Si cambia de repartir a bendecir,
            // el rol anterior no debe contar.
            const wasBlessing =
                currentAssignment?.role === "bless";

            const wasPassing =
                currentAssignment?.role === "pass";

            const blessCountWithoutCurrent =
                currentBlessCount - (wasBlessing ? 1 : 0);

            const passCountWithoutCurrent =
                currentPassCount - (wasPassing ? 1 : 0);

            if (
                role === "bless" &&
                blessCountWithoutCurrent >= 2
            ) {
                return current;
            }

            if (
                role === "pass" &&
                passCountWithoutCurrent >= 3
            ) {
                return current;
            }

            return {
                ...current,
                [youthId]: {
                    role,
                    prepares:
                        currentAssignment?.prepares ?? false,
                    status: "pending",
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
                    prepares: !assignment.prepares,
                    status:"pending",
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


    const saveTeam = async () => {
        if (!teamIsValid || !selectedSundayId) {
            return;
        }

        setSavingTeam(true);
        setErrorMessage(null);

        setSaveMessage(null);

        // 1. Buscar el equipo actualmente guardado
        const {
            data: existingAssignments,
            error: loadError,
        } = await supabase
            .from("assignments")
            .select("youth_id, status")
            .eq("sunday_id", selectedSundayId)
            .in("status", ["pending", "confirmed"]);

        if (loadError) {
            console.error(
                "Error cargando asignaciones existentes:",
                loadError
            );

            setErrorMessage(
                "No se pudo comprobar el equipo actual."
            );

            setSavingTeam(false);
            return;
        }

        // 2. IDs de los jóvenes que forman el equipo nuevo
        const currentYouthIds = Object.keys(team).map(Number);

        // 3. Detectar quién estaba asignado pero fue quitado
        const removedYouthIds = (
            existingAssignments ?? []
        )
            .filter(
                (assignment) =>
                    !currentYouthIds.includes(
                        assignment.youth_id
                    )
            )
            .map(
                (assignment) =>
                    assignment.youth_id
            );

        // 4. Marcar como declined a los que fueron quitados
        if (removedYouthIds.length > 0) {
            const { error: removeError } =
                await supabase
                    .from("assignments")
                    .update({
                        status: "declined",
                    })
                    .eq(
                        "sunday_id",
                        selectedSundayId
                    )
                    .in(
                        "youth_id",
                        removedYouthIds
                    )
                    .in(
                        "status",
                        [
                            "pending",
                            "confirmed",
                        ]
                    );

            if (removeError) {
                console.error(
                    "Error quitando jóvenes del equipo:",
                    removeError
                );

                setErrorMessage(
                    "No se pudo actualizar el equipo."
                );

                setSavingTeam(false);
                return;
            }
        }

        // 5. Preparar el equipo actual
        const rows = Object.entries(team).map(
            ([youthId, assignment]) => ({
                youth_id: Number(youthId),
                sunday_id: selectedSundayId,
                role: assignment.role,
                prepares: assignment.prepares,
                status:
                    assignment.status ===
                    "confirmed"
                        ? "confirmed"
                        : "pending",
            })
        );

        // 6. Crear o actualizar las 5 asignaciones
        const { error: saveError } =
            await supabase
                .from("assignments")
                .upsert(rows, {
                    onConflict:
                        "youth_id,sunday_id",
                });

        if (saveError) {
            console.error(
                "Error guardando equipo:",
                saveError
            );

            setErrorMessage(
                "No se pudo guardar el equipo."
            );

            setSavingTeam(false);
            return;
        }

        setSaveMessage(
            "Equipo guardado correctamente."
        );
        setInitialTeam(team);
        setSavingTeam(false);
    };

    const hasTeamChanges = JSON.stringify(team) !== JSON.stringify(initialTeam);

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

                            const blessFull =
                                blessCount >= 2 && !isBlessing;

                            const passFull =
                                passCount >= 3 && !isPassing;

                            return (
                                <AdvisorYouthCard
                                    key={person.id}
                                    person={person}
                                    assignment={assignment}
                                    blessFull={blessFull}
                                    passFull={passFull}
                                    onSelectRole={selectRole}
                                    onTogglePrepares={togglePrepares}
                                />
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
                
            <AdvisorTeamSummary
                blessCount={blessCount}
                passCount={passCount}
                prepareCount={prepareCount}
                teamIsValid={teamIsValid}
                hasTeamChanges={hasTeamChanges}
                savingTeam={savingTeam}
                saveMessage={saveMessage}
                onSave={saveTeam}
            />
        </motion.section>
        
    );
}