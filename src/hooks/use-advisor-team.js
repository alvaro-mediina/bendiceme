"use client";

import { useEffect, useState, useCallback } from "react";

import { supabase } from "@/lib/supabase";

export default function useAdvisorTeam(selectedSundayId) {
    const [team, setTeam] = useState({});
    const [initialTeam, setInitialTeam] = useState({});
    const [savingTeam, setSavingTeam] = useState(false);
    const [saveMessage, setSaveMessage] = useState(null);
    const [teamError, setTeamError] = useState(null);
    const [loadingTeam, setLoadingTeam] = useState(false);

    const loadTeam = useCallback(
        async ({ showLoading = true } = {}) => {
            if (!selectedSundayId) {
                setTeam({});
                setInitialTeam({});
                setLoadingTeam(false);
                return;
            }

            if (showLoading) {
                setLoadingTeam(true);
            }

            setTeamError(null);

            const { data, error } = await supabase
                .from("assignments")
                .select(
                    `
                youth_id,
                role,
                prepares,
                status
            `,
                )
                .eq("sunday_id", selectedSundayId)
                .in("status", ["pending", "confirmed"]);

            if (error) {
                console.error("Error cargando equipo:", error);

                setTeamError("No se pudo cargar el equipo guardado.");

                setLoadingTeam(false);
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
            setSaveMessage(null);
            setLoadingTeam(false);
        },
        [selectedSundayId],
    );

    useEffect(() => {
        if (!selectedSundayId) {
            return;
        }

        const channel = supabase
            .channel(`advisor-assignments-${selectedSundayId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "assignments",
                    filter: `sunday_id=eq.${selectedSundayId}`,
                },
                () => {
                    loadTeam({
                        showLoading: false,
                    });
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedSundayId]);

    useEffect(() => {
        loadTeam();
    }, [loadTeam]);

    const selectRole = (youthId, role) => {
        setTeam((current) => {
            const currentAssignment = current[youthId];

            if (currentAssignment?.role === role) {
                const next = { ...current };
                delete next[youthId];

                return next;
            }

            const assignments = Object.values(current);

            const currentBlessCount = assignments.filter(
                (assignment) => assignment.role === "bless",
            ).length;

            const currentPassCount = assignments.filter(
                (assignment) => assignment.role === "pass",
            ).length;

            const wasBlessing = currentAssignment?.role === "bless";

            const wasPassing = currentAssignment?.role === "pass";

            const blessCountWithoutCurrent =
                currentBlessCount - (wasBlessing ? 1 : 0);

            const passCountWithoutCurrent =
                currentPassCount - (wasPassing ? 1 : 0);

            if (role === "bless" && blessCountWithoutCurrent >= 2) {
                return current;
            }

            if (role === "pass" && passCountWithoutCurrent >= 3) {
                return current;
            }

            return {
                ...current,
                [youthId]: {
                    role,
                    prepares: currentAssignment?.prepares ?? false,
                    status: "pending",
                },
            };
        });

        setSaveMessage(null);
    };

    const togglePrepares = (youthId) => {
        setTeam((current) => {
            const assignment = current[youthId];

            if (!assignment) {
                return current;
            }

            return {
                ...current,
                [youthId]: {
                    ...assignment,
                    prepares: !assignment.prepares,
                    status: "pending",
                },
            };
        });

        setSaveMessage(null);
    };

    const teamMembers = Object.values(team);

    const blessCount = teamMembers.filter(
        (assignment) => assignment.role === "bless",
    ).length;

    const passCount = teamMembers.filter(
        (assignment) => assignment.role === "pass",
    ).length;

    const prepareCount = teamMembers.filter(
        (assignment) => assignment.prepares,
    ).length;

    const teamIsValid =
        blessCount === 2 && passCount === 3 && prepareCount >= 2;

    const hasTeamChanges = JSON.stringify(team) !== JSON.stringify(initialTeam);

    const saveTeam = async () => {
        if (!selectedSundayId || !hasTeamChanges) {
            return;
        }

        setSavingTeam(true);
        setTeamError(null);
        setSaveMessage(null);

        const { data: existingAssignments, error: loadError } = await supabase
            .from("assignments")
            .select("youth_id, status")
            .eq("sunday_id", selectedSundayId)
            .in("status", ["pending", "confirmed"]);

        if (loadError) {
            console.error("Error cargando asignaciones existentes:", loadError);

            setTeamError("No se pudo comprobar el equipo actual.");

            setSavingTeam(false);
            return;
        }

        const currentYouthIds = Object.keys(team).map(Number);

        const removedYouthIds = (existingAssignments ?? [])
            .filter(
                (assignment) => !currentYouthIds.includes(assignment.youth_id),
            )
            .map((assignment) => assignment.youth_id);

        if (removedYouthIds.length > 0) {
            const { error: removeError } = await supabase
                .from("assignments")
                .update({
                    status: "declined",
                })
                .eq("sunday_id", selectedSundayId)
                .in("youth_id", removedYouthIds)
                .in("status", ["pending", "confirmed"]);

            if (removeError) {
                console.error(
                    "Error quitando jóvenes del equipo:",
                    removeError,
                );

                setTeamError("No se pudo actualizar el equipo.");

                setSavingTeam(false);
                return;
            }
        }

        const rows = Object.entries(team).map(([youthId, assignment]) => ({
            youth_id: Number(youthId),
            sunday_id: selectedSundayId,
            role: assignment.role,
            prepares: assignment.prepares,
            status: assignment.status === "confirmed" ? "confirmed" : "pending",
        }));

        const { error: saveError } = await supabase
            .from("assignments")
            .upsert(rows, {
                onConflict: "youth_id,sunday_id",
            });

        if (saveError) {
            console.error("Error guardando equipo:", saveError);

            setTeamError("No se pudo guardar el equipo.");

            setSavingTeam(false);
            return;
        }

        setInitialTeam(team);

        setSaveMessage("Equipo guardado correctamente.");

        setSavingTeam(false);
    };

    return {
        team,
        blessCount,
        passCount,
        prepareCount,
        teamIsValid,
        hasTeamChanges,

        loadingTeam,
        savingTeam,
        saveMessage,
        teamError,

        selectRole,
        togglePrepares,
        saveTeam,
    };
}
