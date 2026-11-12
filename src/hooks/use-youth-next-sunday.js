"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getVisibleSundays } from "@/lib/sundays";

async function synchronizeSundays(dates) {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!session?.access_token) throw new Error("No hay una sesión válida.");

  const response = await fetch("/api/sundays/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ dates }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "No se pudieron cargar los domingos.");
}

const emptySummary = { nextSunday: null, assignment: null, classes: [] };

export default function useYouthNextSunday(currentYouth) {
  const youthId = currentYouth?.id;
  const wardId = currentYouth?.ward_id;
  const profileKey = youthId && wardId ? JSON.stringify([wardId, youthId]) : null;
  const [summary, setSummary] = useState(emptySummary);
  const [loadedProfile, setLoadedProfile] = useState(null);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!youthId || !wardId) return;

    let active = true;
    let requestId = 0;
    let syncedDates = "";
    let syncPromise = null;

    const ensureSundays = async (dates) => {
      if (syncPromise) await syncPromise;
      const datesKey = dates.join(",");
      if (datesKey === syncedDates) return;

      syncPromise = synchronizeSundays(dates).then(() => {
        syncedDates = datesKey;
      });
      try {
        await syncPromise;
      } finally {
        syncPromise = null;
      }
    };

    const loadSummary = async () => {
      if (!active) return;
      const currentRequest = ++requestId;
      try {
        const { dates } = getVisibleSundays();
        await ensureSundays(dates);
        if (!active || currentRequest !== requestId) return;

        const { data: sundays, error: sundayError } = await supabase
          .from("sundays")
          .select("id, date, active, enabled")
          .eq("ward_id", wardId)
          .in("date", dates)
          .order("date");
        if (sundayError) throw sundayError;

        const nextSunday = (sundays ?? []).find(
          (sunday) => sunday.active !== false && sunday.enabled !== false,
        ) ?? null;
        let assignment = null;
        let classes = [];

        if (nextSunday) {
          const [assignmentResult, classResult] = await Promise.all([
            supabase
              .from("assignments")
              .select("id, role, prepares, status")
              .eq("ward_id", wardId)
              .eq("youth_id", youthId)
              .eq("sunday_id", nextSunday.id)
              .in("status", ["pending", "confirmed"])
              .maybeSingle(),
            supabase
              .from("sunday_school_classes")
              .select("id, date, topic, teacher_name, teacher_youth_id")
              .eq("ward_id", wardId)
              .eq("date", nextSunday.date)
              .order("id"),
          ]);
          if (assignmentResult.error) throw assignmentResult.error;
          if (classResult.error) throw classResult.error;

          assignment = assignmentResult.data ?? null;
          classes = classResult.data ?? [];
        }

        if (!active || currentRequest !== requestId) return;
        setSummary({ nextSunday, assignment, classes });
        setError(null);
      } catch (error) {
        if (active && currentRequest === requestId) {
          console.error("Error cargando próximo domingo del joven:", error);
          setSummary(emptySummary);
          setError("No se pudo cargar tu próximo domingo.");
        }
      } finally {
        if (active && currentRequest === requestId) setLoadedProfile(profileKey);
      }
    };

    loadSummary();
    const channel = supabase
      .channel(`youth-next-sunday-${wardId}-${youthId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "assignments",
      }, loadSummary)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "sunday_school_classes",
      }, loadSummary)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") loadSummary();
      });
    const handleVisibility = () => {
      if (document.visibilityState === "visible") loadSummary();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [youthId, wardId, profileKey, retry]);

  return {
    ...(loadedProfile === profileKey ? summary : emptySummary),
    loading: Boolean(profileKey && loadedProfile !== profileKey),
    error: loadedProfile === profileKey ? error : null,
    reload: () => setRetry((current) => current + 1),
  };
}
