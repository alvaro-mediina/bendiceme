"use client";

import BrandLogo from "../brand-logo";
import AdvisorTeamSummary from "./advisor-team-summary";
import AdvisorSundaySelector from "./advisor-sunday-selector";
import AdvisorYouthList from "./advisor-youth-list";
import useAdvisorTeam from "@/hooks/use-advisor-team";
import useAdvisorAvailability from "@/hooks/use-advisor-availability";
import AdvisorViewSkeleton from "./advisor-view-skeleton";

import {
    ChevronLeft,
    LogOut,
} from "lucide-react";

import { formatSunday } from "@/lib/sundays";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

import {
    fadeUp,
    staggerContainer,
} from "@/lib/animations";

export default function AdvisorView({
    onBack,
    onLogout,
}) {
    const {
        sundays,
        selectedSundayId,
        setSelectedSundayId,
        availableYouth,
        loadingSundays,
        loadingYouth,
        availabilityError,
    } = useAdvisorAvailability();

    const {
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
    } = useAdvisorTeam(selectedSundayId);

    const availablePriests =
        availableYouth.filter(
            (person) =>
                person.office === "priest"
        ).length;

    if (loadingSundays) {
        return <AdvisorViewSkeleton />;
    }

    const teamLoading =
        loadingTeam || loadingYouth;

    const TeamSkeleton = () => (
        <div className="rounded-2xl border bg-white p-4 sm:p-5">
            <div className="relative h-5 w-28 overflow-hidden rounded bg-gray-200">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />
            </div>

            <div className="mt-5 flex flex-col gap-4">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="flex items-center justify-between"
                    >
                        <div className="relative h-4 w-24 overflow-hidden rounded bg-gray-200">
                            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />
                        </div>

                        <div className="relative h-4 w-10 overflow-hidden rounded bg-gray-200">
                            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <motion.section
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mx-auto flex h-[calc(100dvh-3rem)] w-full max-w-5xl flex-col overflow-hidden sm:h-[calc(100dvh-4rem)]"
        >
            {/* ENCABEZADO FIJO */}
            <div className="shrink-0">
                <motion.div variants={fadeUp}>
                    <BrandLogo />
                </motion.div>

                <motion.p
                    variants={fadeUp}
                    className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600"
                >
                    Gestión del domingo
                </motion.p>

                <motion.div
                    variants={fadeUp}
                    className="mt-3 flex items-center justify-between"
                >
                    <motion.button
                        whileTap={{
                            scale: 0.98,
                        }}
                        type="button"
                        onClick={onBack}
                        className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ChevronLeft className="size-4" />
                        Volver
                    </motion.button>

                    <motion.button
                        whileTap={{
                            scale: 0.98,
                        }}
                        type="button"
                        onClick={onLogout}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut className="size-4" />
                        Cerrar sesión
                    </motion.button>
                </motion.div>

                <motion.h1
                    variants={fadeUp}
                    className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl"
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

                {(availabilityError ||
                    teamError) && (
                    <motion.p
                        variants={fadeUp}
                        className="mt-4 text-sm text-red-600"
                    >
                        {availabilityError ||
                            teamError}
                    </motion.p>
                )}

                <AdvisorSundaySelector
                    sundays={sundays}
                    selectedSundayId={
                        selectedSundayId
                    }
                    onSelect={
                        setSelectedSundayId
                    }
                    formatSunday={
                        formatSunday
                    }
                />
            </div>

            {/* CONTENIDO */}
            <div className="mt-6 min-h-0 flex-1 overflow-hidden">
                <div
                    className="
                        h-full overflow-y-auto pb-24
                        lg:grid
                        lg:grid-cols-[minmax(0,1fr)_300px]
                        lg:gap-6
                        lg:overflow-hidden
                        lg:pb-0
                    "
                >
                    {/* RESUMEN MOBILE */}
                    <div className="mb-6 lg:hidden">
                        {teamLoading ? (
                            <TeamSkeleton />
                        ) : (
                            <AdvisorTeamSummary
                                blessCount={
                                    blessCount
                                }
                                passCount={
                                    passCount
                                }
                                prepareCount={
                                    prepareCount
                                }
                                teamIsValid={
                                    teamIsValid
                                }
                                hasTeamChanges={
                                    hasTeamChanges
                                }
                                savingTeam={
                                    savingTeam
                                }
                                saveMessage={
                                    saveMessage
                                }
                                availablePriests={
                                    availablePriests
                                }
                                availableYouthCount={
                                    availableYouth.length
                                }
                                onSave={
                                    saveTeam
                                }
                                showSaveButton={
                                    false
                                }
                            />
                        )}
                    </div>

                    {/* LISTA */}
                    <div className="flex min-h-0 flex-col">
                        <motion.div
                            variants={fadeUp}
                            className="shrink-0"
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
                        </motion.div>

                        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-2">
                            <AdvisorYouthList
                                availableYouth={availableYouth}
                                team={team}
                                blessCount={blessCount}
                                passCount={passCount}
                                loadingYouth={loadingYouth}
                                onSelectRole={selectRole}
                                onTogglePrepares={togglePrepares}
                            />
                        </div>
                </div>

                    {/* RESUMEN DESKTOP */}
                    <div className="hidden lg:block lg:self-start">
                        {teamLoading ? (
                            <TeamSkeleton />
                        ) : (
                            <AdvisorTeamSummary
                                blessCount={
                                    blessCount
                                }
                                passCount={
                                    passCount
                                }
                                prepareCount={
                                    prepareCount
                                }
                                teamIsValid={
                                    teamIsValid
                                }
                                hasTeamChanges={
                                    hasTeamChanges
                                }
                                savingTeam={
                                    savingTeam
                                }
                                saveMessage={
                                    saveMessage
                                }
                                availablePriests={
                                    availablePriests
                                }
                                availableYouthCount={
                                    availableYouth.length
                                }
                                onSave={
                                    saveTeam
                                }
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* GUARDAR FIJO EN MOBILE */}
            <div className="shrink-0 border-t bg-background/95 pt-3 backdrop-blur lg:hidden">
                <Button
                    className="h-12 w-full rounded-xl bg-green-600 text-white hover:bg-green-700"
                    disabled={
                        savingTeam ||
                        !hasTeamChanges ||
                        teamLoading
                    }
                    onClick={saveTeam}
                >
                    {savingTeam
                        ? "Guardando..."
                        : hasTeamChanges
                          ? "Guardar cambios"
                          : "Equipo guardado"}
                </Button>

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
        </motion.section>
    );
}