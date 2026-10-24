"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { formatSunday, getVisibleSundays } from "@/lib/sundays";

export default function AdvisorHome({
  wardId,
  onNavigate,
  sacramentSettings,
  loadingSacramentSettings,
  onReady,
  isOwner = false,
}) {
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [nextSunday, setNextSunday] = useState(null);

  const [assignedCount, setAssignedCount] = useState(0);

  const [availableCount, setAvailableCount] = useState(0);

  const [confirmedCount, setConfirmedCount] = useState(0);

  const [pendingCount, setPendingCount] = useState(0);

  const [declinedCount, setDeclinedCount] = useState(0);

  const [upcomingSundays, setUpcomingSundays] = useState([]);

  useEffect(() => {
    if (!loading && !loadingSacramentSettings) {
      onReady?.();
    }
  }, [loading, loadingSacramentSettings, onReady]);

  useEffect(() => {
    if (!wardId) {
      return;
    }

    const loadHome = async () => {
      setLoading(true);
      setError(null);

      try {
        const { dates: visibleSundayDates } = getVisibleSundays();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("No hay una sesión válida.");
        }

        const response = await fetch("/api/sundays/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            dates: visibleSundayDates,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ?? "No se pudieron sincronizar los domingos.",
          );
        }

        const Sundays = (data.sundays ?? [])
          .filter((sunday) => sunday.active !== false)
          .sort((a, b) => a.date.localeCompare(b.date));

        setUpcomingSundays(Sundays);

        const firstSunday =
          Sundays.find((sunday) => sunday.enabled !== false) ?? null;

        setNextSunday(firstSunday);

        if (!firstSunday) {
          setAssignedCount(0);
          setAvailableCount(0);
          setConfirmedCount(0);
          setPendingCount(0);
          setDeclinedCount(0);

          return;
        }

        const [assignmentsResult, availabilityResult] = await Promise.all([
          supabase
            .from("assignments")
            .select("youth_id, status")
            .eq("ward_id", wardId)
            .eq("sunday_id", firstSunday.id),

          supabase
            .from("availability")
            .select("youth_id")
            .eq("ward_id", wardId)
            .eq("sunday_id", firstSunday.id)
            .eq("available", true),
        ]);

        if (assignmentsResult.error) {
          throw assignmentsResult.error;
        }

        if (availabilityResult.error) {
          throw availabilityResult.error;
        }

        const assignments = assignmentsResult.data ?? [];

        const activeAssignments = assignments.filter(
          (assignment) =>
            assignment.status === "pending" ||
            assignment.status === "confirmed",
        );

        setAssignedCount(activeAssignments.length);

        setAvailableCount(availabilityResult.data?.length ?? 0);

        setConfirmedCount(
          assignments.filter((assignment) => assignment.status === "confirmed")
            .length,
        );

        setPendingCount(
          assignments.filter((assignment) => assignment.status === "pending")
            .length,
        );

        setDeclinedCount(
          assignments.filter((assignment) => assignment.status === "declined")
            .length,
        );
      } catch (loadError) {
        console.error("Error cargando inicio del asesor:", loadError);

        setError("No se pudo cargar el resumen.");
      } finally {
        setLoading(false);
      }
    };

    loadHome();
  }, [wardId]);

  const requiredTeamCount = 2 + sacramentSettings.passCount;
  const teamComplete = assignedCount === requiredTeamCount;

  if (loading || loadingSacramentSettings) {
    return (
      <section className="space-y-8">
        <div className="h-8 w-32 animate-pulse rounded-xl bg-muted" />

        <div className="h-52 animate-pulse rounded-3xl bg-muted" />

        <div className="grid grid-cols-2 gap-3">
          <div className="h-28 animate-pulse rounded-2xl bg-muted" />
          <div className="h-28 animate-pulse rounded-2xl bg-muted" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-9">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
          Panel del asesor
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Inicio</h1>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Próximo Domingo
        </p>

        {nextSunday ? (
          <button
            type="button"
            onClick={() => onNavigate("sacrament")}
            className="
                group relative mt-4
                min-h-[300px] w-full
                overflow-hidden rounded-[28px]
                text-left
            "
          >
            <img
              src="/images/advisor/sacrament-home.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            <div className="relative flex min-h-[300px] flex-col justify-end p-6 text-white">
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight">
                {formatSunday(nextSunday.date)}
              </h2>

              <div className="flex items-end justify-between">
                <div>
                  <p className="mt-1 text-sm text-white/70 lg:text-base lg:mt-2">
                    Equipo de Santa Cena
                  </p>

                  <p className="text-lg font-semibold">
                    {assignedCount} de {requiredTeamCount} asignados
                  </p>
                </div>
              </div>
            </div>
          </button>
        ) : (
          <div className="mt-3 rounded-3xl border bg-card p-5 text-sm text-muted-foreground">
            No hay próximos Domingos disponibles.
          </div>
        )}
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Accesos rápidos
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:gap-5">
          <button
            type="button"
            onClick={() => onNavigate("sacrament")}
            className="group relative min-h-[190px] sm:min-h-[220px] lg:min-h-[290px] overflow-hidden rounded-[26px] text-left"
          >
            <img
              src="/images/advisor/sacrament.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            <div className="relative flex min-h-[190px] sm:min-h-[220px] lg:min-h-[290px] flex-col justify-end p-5 text-white">
              <p className="text-xl font-extrabold tracking-tight lg:text-2xl">
                Santa Cena
              </p>

              <p className="text-sm text-white/75 lg:text-base">
                Organizar equipos
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("youth")}
            className="group relative min-h-[190px] sm:min-h-[220px] lg:min-h-[290px] overflow-hidden rounded-[26px] text-left"
          >
            <img
              src="/images/advisor/youths.png"
              alt=""
              className="
                                absolute inset-0
                                h-full w-full
                                object-cover
                                object-[center_45%]
                                transition-transform duration-300
                                group-hover:scale-105
                            "
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            <div className="relative flex min-h-[190px] sm:min-h-[220px] lg:min-h-[290px] flex-col justify-end p-5 text-white">
              <p className="text-xl font-black tracking-tight lg:text-2xl">
                Jóvenes
              </p>

              <p className="text-sm text-white/75 lg:text-base">
                Administrar tu grupo
              </p>
            </div>
          </button>

          {isOwner && (
            <button
              type="button"
              onClick={() => onNavigate("admin")}
              className="
                group relative
                min-h-[130px] w-full
                overflow-hidden
                rounded-[26px]
                text-left
              "
            >
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="
                h-full w-full
                transition-transform duration-300
                group-hover:scale-[1.02]
              "
                >
                  <img
                    src="/images/advisor/admin.png"
                    alt=""
                    className="
                  h-full w-full
                  object-cover
                  -scale-x-100
                "
                  />
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

              <div className="relative flex min-h-[130px] items-center p-5">
                <div className="max-w-[52%]">
                  <p className="text-xl font-extrabold tracking-tight text-slate-900">
                    Admin
                  </p>

                  <p className="mt-1 text-sm leading-snug text-slate-600">
                    Administrar barrios y accesos.
                  </p>
                </div>
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate("more")}
            className={`
              group relative
              min-h-[130px] w-full
              overflow-hidden
              rounded-[26px]
              text-left
              ${isOwner ? "" : "col-span-2"}
            `}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="
                h-full w-full
                transition-transform duration-300
                group-hover:scale-[1.02]
              "
              >
                <img
                  src="/images/advisor/more.png"
                  alt=""
                  className="
                  h-full w-full
                  object-cover
                  -scale-x-100
                "
                />
              </div>
            </div>

            <div className="relative flex min-h-[130px] items-center p-5">
              <div className="max-w-[52%]">
                <p className="text-xl font-extrabold tracking-tight text-slate-900">
                  Más
                </p>

                <p className="mt-1 text-sm leading-snug text-slate-600">
                  Preferencias, cuenta y configuración
                </p>
              </div>
            </div>
          </button>
        </div>
      </section>
    </section>
  );
}
