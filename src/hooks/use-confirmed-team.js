"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function useConfirmedTeam(assignment) {
  const [confirmedTeam, setConfirmedTeam] = useState([]);

  const [loadingTeam, setLoadingTeam] = useState(false);

  useEffect(() => {
    let active = true;
    let requestId = 0;

    const loadConfirmedTeam = async ({ showLoading = false } = {}) => {
      const currentRequestId = ++requestId;
      if (!assignment?.sunday_id) {
        setConfirmedTeam([]);
        setLoadingTeam(false);
        return;
      }

      if (showLoading) {
        setConfirmedTeam([]);
        setLoadingTeam(true);
      }

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
        .eq("ward_id", assignment.ward_id)
        .eq("sunday_id", assignment.sunday_id)
        .eq("status", "confirmed");

      if (!active || currentRequestId !== requestId) {
        return;
      }

      if (error) {
        console.error("Error cargando equipo confirmado:", error);

        setLoadingTeam(false);
        return;
      }

      setConfirmedTeam(data ?? []);

      setLoadingTeam(false);
    };

    loadConfirmedTeam({ showLoading: true });

    if (!assignment?.ward_id || !assignment?.sunday_id) {
      return () => {
        active = false;
      };
    }

    // Refetch rather than applying payloads: the query includes youth data,
    // and deleted or moved assignments may not include the original scope.
    const channel = supabase
      .channel(`youth-confirmed-team-${assignment.ward_id}-${assignment.sunday_id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assignments" },
        () => loadConfirmedTeam(),
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          loadConfirmedTeam();
        }
      });

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [assignment?.ward_id, assignment?.sunday_id]);

  const blessingTeam = useMemo(
    () => confirmedTeam.filter((member) => member.role === "bless"),
    [confirmedTeam],
  );

  const passingTeam = useMemo(
    () => confirmedTeam.filter((member) => member.role === "pass"),
    [confirmedTeam],
  );

  return {
    confirmedTeam,
    loadingTeam,
    blessingTeam,
    passingTeam,
  };
}
