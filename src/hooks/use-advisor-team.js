"use client";

import { useEffect, useState, useCallback, useRef } from "react";

import { supabase } from "@/lib/supabase";
import { notifyYouth } from "@/lib/youth-notifications";
export default function useAdvisorTeam(
  wardId,
  selectedSundayId,
  { requiredPassCount = 3, requiredPrepareCount = 2 } = {},
) {
  const requiredBlessCount = 2;
  const [team, setTeam] = useState({});
  const [initialTeam, setInitialTeam] = useState({});
  const [savingTeam, setSavingTeam] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [teamError, setTeamError] = useState(null);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const saveMessageTimeoutRef = useRef(null);

  const loadTeam = useCallback(
    async ({ showLoading = true } = {}) => {
      if (!wardId || !selectedSundayId) {
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
                    status,
                    youth:youth (
                        id,
                        name,
                        office
                    )
                `,
        )
        .eq("ward_id", wardId)
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
          youth: assignment.youth,
        };
      });

      setTeam(savedTeam);
      setInitialTeam(savedTeam);
      setLoadingTeam(false);
    },
    [wardId, selectedSundayId],
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
  }, [selectedSundayId, loadTeam]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const getAssignmentStatus = (youthId, nextAssignment) => {
    const initialAssignment = initialTeam[youthId];

    if (!initialAssignment) {
      return "draft";
    }

    const isSameAsInitial =
      initialAssignment.role === nextAssignment.role &&
      initialAssignment.prepares === nextAssignment.prepares;

    return isSameAsInitial ? initialAssignment.status : "draft";
  };

  const selectRole = (youthId, role) => {
    setTeam((current) => {
      const currentAssignment = current[youthId];

      // PRIMERO: si estaba marcado para eliminar,
      // restauramos la asignación original.
      if (currentAssignment?.status === "removed") {
        const initialAssignment = initialTeam[youthId];

        if (!initialAssignment) {
          return current;
        }

        return {
          ...current,
          [youthId]: {
            ...initialAssignment,
          },
        };
      }

      if (currentAssignment?.role === role) {
        const initialAssignment = initialTeam[youthId];

        // Si todavía no existía en la base,
        // simplemente descartamos el draft.
        if (!initialAssignment) {
          const next = { ...current };
          delete next[youthId];

          return next;
        }

        // Si ya estaba guardado, marcamos
        // la eliminación como cambio local.
        return {
          ...current,
          [youthId]: {
            ...currentAssignment,
            status: "removed",
          },
        };
      }

      const assignments = Object.values(current).filter(
        (assignment) => assignment.status !== "removed",
      );

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

      const passCountWithoutCurrent = currentPassCount - (wasPassing ? 1 : 0);

      if (role === "bless" && blessCountWithoutCurrent >= requiredBlessCount) {
        return current;
      }

      if (role === "pass" && passCountWithoutCurrent >= requiredPassCount) {
        return current;
      }

      const nextAssignment = {
        role,
        prepares: currentAssignment?.prepares ?? false,
      };

      return {
        ...current,
        [youthId]: {
          ...nextAssignment,
          status: getAssignmentStatus(youthId, nextAssignment),
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

      const nextAssignment = {
        ...assignment,
        prepares: !assignment.prepares,
      };

      return {
        ...current,
        [youthId]: {
          ...nextAssignment,
          status: getAssignmentStatus(youthId, nextAssignment),
        },
      };
    });

    setSaveMessage(null);
  };

  const discardChanges = () => {
    setTeam(initialTeam);
    setSaveMessage(null);
    setTeamError(null);
  };

  const teamMembers = Object.values(team).filter(
    (assignment) => assignment.status !== "removed",
  );

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
    blessCount === requiredBlessCount &&
    passCount === requiredPassCount &&
    prepareCount >= requiredPrepareCount;

  const hasTeamChanges = (() => {
    const currentIds = Object.keys(team);
    const initialIds = Object.keys(initialTeam);

    if (currentIds.length !== initialIds.length) {
      return true;
    }

    return currentIds.some((youthId) => {
      const currentAssignment = team[youthId];
      const initialAssignment = initialTeam[youthId];

      if (!initialAssignment) {
        return true;
      }

      if (currentAssignment.status === "removed") {
        return true;
      }

      return (
        currentAssignment.role !== initialAssignment.role ||
        currentAssignment.prepares !== initialAssignment.prepares
      );
    });
  })();

  const saveTeam = async () => {
    if (!wardId || !selectedSundayId || !hasTeamChanges) {
      return;
    }

    setSavingTeam(true);
    setTeamError(null);
    setSaveMessage(null);

    const { data: existingAssignments, error: loadError } = await supabase
      .from("assignments")
      .select("youth_id, status")
      .eq("ward_id", wardId)
      .eq("sunday_id", selectedSundayId)
      .in("status", ["pending", "confirmed"]);

    if (loadError) {
      console.error("Error cargando asignaciones existentes:", loadError);

      setTeamError("No se pudo comprobar el equipo actual.");

      setSavingTeam(false);
      return;
    }

    const activeTeamEntries = Object.entries(team).filter(
      ([, assignment]) => assignment.status !== "removed",
    );

    const currentYouthIds = activeTeamEntries.map(([youthId]) =>
      Number(youthId),
    );

    const removedYouthIds = (existingAssignments ?? [])
      .filter((assignment) => !currentYouthIds.includes(assignment.youth_id))
      .map((assignment) => assignment.youth_id);

    if (removedYouthIds.length > 0) {
      const { error: removeError } = await supabase
        .from("assignments")
        .update({
          status: "declined",
        })
        .eq("ward_id", wardId)
        .eq("sunday_id", selectedSundayId)
        .in("youth_id", removedYouthIds)
        .in("status", ["pending", "confirmed"]);

      if (removeError) {
        console.error("Error quitando jóvenes del equipo:", removeError);

        setTeamError("No se pudo actualizar el equipo.");

        setSavingTeam(false);
        return;
      }
    }

    const rows = activeTeamEntries.map(([youthId, assignment]) => ({
      youth_id: Number(youthId),
      sunday_id: selectedSundayId,
      ward_id: wardId,
      role: assignment.role,
      prepares: assignment.prepares,
      status: assignment.status === "confirmed" ? "confirmed" : "pending",
    }));

    const youthIdsToNotify = activeTeamEntries
      .filter(([youthId, assignment]) => {
        const previous = initialTeam[youthId];

        if (!previous) {
          return true;
        }

        if (previous.role !== assignment.role) {
          return true;
        }

        if (previous.prepares !== assignment.prepares) {
          return true;
        }

        return false;
      })
      .map(([youthId]) => Number(youthId));

    const { error: saveError } = await supabase
      .from("assignments")
      .upsert(rows, {
        onConflict: "ward_id,youth_id,sunday_id",
      });

    if (saveError) {
      console.error("Error guardando equipo:", saveError);

      setTeamError("No se pudo guardar el equipo.");

      setSavingTeam(false);
      return;
    }

    for (const youthId of youthIdsToNotify) {
      try {
        await notifyYouth({
          type: "assignment_created",
          youthId,
          sundayId: selectedSundayId,
        });
      } catch (error) {
        console.error(`No se pudo notificar al joven ${youthId}:`, error);
      }
    }

    const savedTeam = Object.fromEntries(
      Object.entries(team).map(([youthId, assignment]) => [
        youthId,
        {
          ...assignment,
          status: assignment.status === "confirmed" ? "confirmed" : "pending",
        },
      ]),
    );

    setTeam(savedTeam);
    setInitialTeam(savedTeam);

    setSaveMessage("Equipo guardado correctamente.");

    if (saveMessageTimeoutRef.current) {
      clearTimeout(saveMessageTimeoutRef.current);
    }

    saveMessageTimeoutRef.current = setTimeout(() => {
      setSaveMessage(null);
    }, 3000);
    setSavingTeam(false);
  };

  useEffect(() => {
    return () => {
      if (saveMessageTimeoutRef.current) {
        clearTimeout(saveMessageTimeoutRef.current);
      }
    };
  }, []);

  return {
    team,

    blessCount,
    passCount,
    prepareCount,

    requiredBlessCount,
    requiredPassCount,
    requiredPrepareCount,

    teamIsValid,
    hasTeamChanges,

    loadingTeam,
    savingTeam,
    saveMessage,
    teamError,

    selectRole,
    togglePrepares,
    saveTeam,
    discardChanges,
  };
}
