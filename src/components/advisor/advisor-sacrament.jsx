"use client";

import AdvisorTeamSummary from "./advisor-team-summary";
import AdvisorSundaySelector from "./advisor-sunday-selector";
import AdvisorYouthList from "./advisor-youth-list";
import AdvisorViewSkeleton from "./advisor-view-skeleton";

import useAdvisorTeam from "@/hooks/use-advisor-team";
import useAdvisorAvailability from "@/hooks/use-advisor-availability";

import { formatSunday } from "@/lib/sundays";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

import { fadeUp, staggerContainer } from "@/lib/animations";

export default function AdvisorSacrament({
  wardId,
  sacramentSettings,
  loadingSacramentSettings,
}) {
  const {
    sundays,
    selectedSundayId,
    setSelectedSundayId,
    availableYouth,
    loadingSundays,
    loadingYouth,
    availabilityError,
  } = useAdvisorAvailability(wardId);

  const {
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
  } = useAdvisorTeam(wardId, selectedSundayId, {
    requiredPassCount: sacramentSettings.passCount,
    requiredPrepareCount: sacramentSettings.minPrepareCount,
  });

  const isLoading =
    loadingSundays || loadingYouth || loadingTeam || loadingSacramentSettings;

  const confirmedTeam = Object.fromEntries(
    Object.entries(team).filter(
      ([, assignment]) => assignment.status === "confirmed",
    ),
  );

  const confirmedAssignments = Object.values(confirmedTeam);

  const confirmedBlessCount = confirmedAssignments.filter(
    (assignment) => assignment.role === "bless",
  ).length;

  const confirmedPassCount = confirmedAssignments.filter(
    (assignment) => assignment.role === "pass",
  ).length;

  const confirmedPrepareCount = confirmedAssignments.filter(
    (assignment) => assignment.prepares,
  ).length;

  const confirmedTeamIsComplete =
    confirmedBlessCount === requiredBlessCount &&
    confirmedPassCount === requiredPassCount &&
    confirmedPrepareCount >= requiredPrepareCount;

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="mx-auto w-full max-w-5xl"
    >
      {/* ENCABEZADO */}
      <div className="shrink-0">
        <motion.div variants={fadeUp}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
            Organización
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Santa Cena
          </h1>
        </motion.div>
      </div>

      {isLoading ? (
        <div className="mt-6">
          <AdvisorViewSkeleton />
        </div>
      ) : (
        <>
          {(availabilityError || teamError) && (
            <motion.p variants={fadeUp} className="mt-4 text-sm text-red-600">
              {availabilityError || teamError}
            </motion.p>
          )}

          <AdvisorSundaySelector
            sundays={sundays}
            selectedSundayId={selectedSundayId}
            onSelect={setSelectedSundayId}
            formatSunday={formatSunday}
          />

          {/* CONTENIDO PRINCIPAL */}
          <div className="mt-6 flex-1">
            {/* RESUMEN EQUIPO */}
            <div className="lg:self-start">
              <motion.div variants={fadeUp} className="shrink-0">
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Equipo confirmado
                </h2>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-4 shrink-0">
                <AdvisorTeamSummary
                  team={confirmedTeam}
                  blessCount={confirmedBlessCount}
                  passCount={confirmedPassCount}
                  prepareCount={confirmedPrepareCount}
                  requiredBlessCount={requiredBlessCount}
                  requiredPassCount={requiredPassCount}
                  requiredPrepareCount={requiredPrepareCount}
                  teamIsValid={confirmedTeamIsComplete}
                />
              </motion.div>
            </div>

            <div className="flex w-full flex-col">
              <AdvisorYouthList
                availableYouth={availableYouth}
                team={team}
                blessCount={blessCount}
                passCount={passCount}
                requiredBlessCount={requiredBlessCount}
                requiredPassCount={requiredPassCount}
                loadingYouth={loadingYouth}
                onSelectRole={selectRole}
                onTogglePrepares={togglePrepares}
              />
            </div>
          </div>

          {/* GUARDAR EQUIPO */}
          <div className="mt-6 flex flex-col gap-2">
            {hasTeamChanges && (
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-2xl bg-yellow-600 text-base font-semibold text-white hover:bg-yellow-700"
                disabled={savingTeam}
                onClick={discardChanges}
              >
                Descartar cambios
              </Button>
            )}

            {hasTeamChanges ? (
              <Button
                className="h-12 w-full rounded-2xl bg-green-600 text-base font-semibold text-white hover:bg-green-700"
                disabled={savingTeam || !teamIsValid}
                onClick={saveTeam}
              >
                {savingTeam ? "Guardando..." : "Guardar cambios"}
              </Button>
            ) : (
              <div className="flex h-12 w-full items-center justify-center rounded-2xl border border-green-200 bg-green-50 text-base font-semibold text-green-700">
                Equipo actualizado
              </div>
            )}

            {saveMessage && (
              <motion.p
                initial={{
                  opacity: 0,
                  y: 4,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mt-2 text-center text-xs font-medium text-green-700"
              >
                {saveMessage}
              </motion.p>
            )}
          </div>
        </>
      )}
    </motion.section>
  );
}
