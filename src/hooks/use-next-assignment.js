"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { notifyAdvisor } from "@/lib/advisor-notifications";
import { notifyConfirmedTeamMembers } from "@/lib/team-notifications";

export default function useNextAssignment(currentYouth) {
    const [assignment, setAssignment] = useState(null);

    const [loading, setLoading] = useState(true);

    const [updating, setUpdating] = useState(false);

    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        const loadAssignment = async () => {
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
                .eq("youth_id", currentYouth.id)
                .in("status", ["pending", "confirmed"]);

            if (error) {
                console.error(error);

                setErrorMessage("No se pudieron cargar tus turnos.");
            } else {
                const futureAssignments = (data ?? [])
                    .filter(
                        (item) =>
                            item.sunday && item.sunday.date >= currentDate,
                    )
                    .sort((a, b) => a.sunday.date.localeCompare(b.sunday.date));

                const nextAssignment = futureAssignments[0] ?? null;

                setAssignment(nextAssignment);
            }

            setLoading(false);
        };

        loadAssignment();
    }, [currentYouth.id]);

    const updateStatus = async (newStatus) => {
        if (!assignment) {
            return;
        }

        setUpdating(true);
        setErrorMessage(null);

        const { data, error: assignmentError } = await supabase
            .from("assignments")
            .update({
                status: newStatus,
            })
            .eq("id", assignment.id)
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

        if (newStatus === "declined") {
            const { error: availabilityError } = await supabase
                .from("availability")
                .update({
                    available: false,
                })
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

        setAssignment(data);
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
