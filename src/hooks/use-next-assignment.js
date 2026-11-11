"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { notifyAdvisor } from "@/lib/advisor-notifications";
import { notifyConfirmedTeamMembers } from "@/lib/team-notifications";

export default function useNextAssignment(currentYouth) {
  const [assignment, setAssignment] = useState(null);

  const [loading, setLoading] = useState(true);

  const [updating, setUpdating] = useState(false);

  const [errorMessage, setErrorMessage] = useState(null);

  const refreshAssignmentRef = useRef(null);

  useEffect(() => {
    let active = true;
    let requestId = 0;

    const loadAssignment = async ({ showLoading = false } = {}) => {
      const currentRequestId = ++requestId;

      if (showLoading) {
        setLoading(true);
        setAssignment(null);
        setErrorMessage(null);
      }
      const today = new Date();

      const currentDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");

      const { data, error } = await supabase
        .from("assignments")
        .select(
          `
                        *,
                        sunday:sundays (
                            id,
                            date
                        )
                    `,
        )
        .eq("ward_id", currentYouth.ward_id)
        .eq("youth_id", currentYouth.id)
        .in("status", ["pending", "confirmed"]);

      if (!active || currentRequestId !== requestId) {
        return;
      }

      if (error) {
        console.error(error);

        setErrorMessage("No se pudieron cargar tus turnos.");
      } else {
        const futureAssignments = (data ?? [])
          .filter((item) => item.sunday && item.sunday.date >= currentDate)
          .sort((a, b) => a.sunday.date.localeCompare(b.sunday.date));

        const nextAssignment = futureAssignments[0] ?? null;

        setAssignment(nextAssignment);
        setErrorMessage(null);
      }

      setLoading(false);
    };

    refreshAssignmentRef.current = loadAssignment;
    loadAssignment({ showLoading: true });

    // DELETE events cannot be filtered reliably, and reassignment updates
    // may no longer match this youth. Always refetch the scoped query.
    const channel = supabase
      .channel(`youth-next-assignment-${currentYouth.ward_id}-${currentYouth.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assignments" },
        () => loadAssignment(),
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          loadAssignment();
        }
      });

    return () => {
      active = false;
      refreshAssignmentRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [currentYouth.id, currentYouth.ward_id]);

  const updateStatus = async (newStatus) => {
    if (!assignment) {
      return;
    }

    setUpdating(true);
    setErrorMessage(null);

    const { error: assignmentError } = await supabase
      .from("assignments")
      .update({
        status: newStatus,
      })
      .eq("id", assignment.id)
      .eq("ward_id", currentYouth.ward_id)
      .select(
        `
                    *,
                    sunday:sundays (
                        id,
                        date
                    )
                `,
      )
      .single();

    if (assignmentError) {
      console.error(assignmentError);

      setErrorMessage("No se pudo actualizar el turno.");

      setUpdating(false);

      return;
    }

    await refreshAssignmentRef.current?.();

    if (newStatus === "declined") {
      const { error: availabilityError } = await supabase
        .from("availability")
        .update({
          available: false,
        })
        .eq("ward_id", currentYouth.ward_id)
        .eq("youth_id", currentYouth.id)
        .eq("sunday_id", assignment.sunday_id);

      if (availabilityError) {
        console.error(availabilityError);

        setErrorMessage(
          "El turno fue rechazado, pero no se pudo actualizar tu disponibilidad.",
        );

        setUpdating(false);

        return;
      }
    }

    try {
      await notifyAdvisor({
        type:
          newStatus === "confirmed"
            ? "assignment_confirmed"
            : "assignment_declined",
        youthId: currentYouth.id,
        sundayId: assignment.sunday_id,
      });
    } catch (error) {
      console.error("No se pudo notificar al asesor:", error);
    }

    if (newStatus === "confirmed") {
      try {
        await notifyConfirmedTeamMembers({
          youthId: currentYouth.id,
          sundayId: assignment.sunday_id,
        });
      } catch (error) {
        console.error("No se pudo notificar al equipo:", error);
      }
    }

    setUpdating(false);

    if (newStatus === "confirmed") {
      toast.success("Turno confirmado", {
        description: "Confirmaste que vas a servir este domingo.",
      });
    } else {
      toast.info("Turno rechazado", {
        description: "El asesor fue notificado.",
      });
    }
  };

  return {
    assignment,
    loading,
    updating,
    errorMessage,
    updateStatus,
  };
}
