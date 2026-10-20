"use client";

import { useEffect, useState } from "react";

import AdvisorTeamSummary from "./advisor-team-summary";
import AdvisorSundaySelector from "./advisor-sunday-selector";
import AdvisorYouthList from "./advisor-youth-list";
import AdvisorViewSkeleton from "./advisor-view-skeleton";

import useAdvisorTeam from "@/hooks/use-advisor-team";
import useAdvisorAvailability from "@/hooks/use-advisor-availability";

import { formatSunday } from "@/lib/sundays";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

import {
    fadeUp,
    staggerContainer,
} from "@/lib/animations";

export default function AdvisorSacrament({ wardId, onBack, onLogout,}) {

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
        teamIsValid,
        hasTeamChanges,
        loadingTeam,
        savingTeam,
        saveMessage,
        teamError,
        selectRole,
        togglePrepares,
        saveTeam,
    } = useAdvisorTeam(wardId, selectedSundayId,);


    const getAdvisorUser = async () => {
        const { data:{ user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if(!user) {
            throw new Error("No se encontró la sesión del asesor.")
        }

        return user;
    }

    const handleEnableNotifications = async () => {
        setPushLoading(true);
        setPushError(null);

        try {
            const user = await getAdvisorUser();

            await subscribeAdvisorToPush(
                user.id
            );

            setPushEnabled(true);
        } catch (error) {
            console.error(
                "Error activando notificaciones del asesor:",
                error
            );

            setPushError(
                error.message
            );
        } finally {
            setPushLoading(false);
        }
    };


    if (loadingSundays) {
        return <AdvisorViewSkeleton />;
    }

    const teamLoading = loadingTeam || loadingYouth;

    const confirmedTeam =
    Object.fromEntries(
        Object.entries(team).filter(
            ([, assignment]) =>
                assignment.status === "confirmed"
        )
    );

    const confirmedAssignments =
        Object.values(confirmedTeam);

    const confirmedBlessCount =
        confirmedAssignments.filter(
            (assignment) =>
                assignment.role === "bless"
        ).length;

    const confirmedPassCount =
        confirmedAssignments.filter(
            (assignment) =>
                assignment.role === "pass"
        ).length;

    const confirmedPrepareCount =
        confirmedAssignments.filter(
            (assignment) =>
                assignment.prepares
        ).length;

    const confirmedTeamIsComplete =
        confirmedBlessCount === 2 &&
        confirmedPassCount === 3 &&
        confirmedPrepareCount >= 2;


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

    return(
        <motion.section
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mx-auto w-full max-w-5xl"
        >
            {/* ENCABEZADO FIJO */}
            <div className="shrink-0">
                <motion.div variants={fadeUp}>
                    <p className="text-sm text-muted-foreground">
                        Organización
                    </p>

                    <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                        Santa Cena
                    </h1>
                </motion.div>

                {(availabilityError || teamError) && (
                    <motion.p
                        variants={fadeUp}
                        className="mt-4 text-sm text-red-600"
                    >
                        {availabilityError || teamError}
                    </motion.p>
                )}

                <AdvisorSundaySelector
                    sundays={sundays}
                    selectedSundayId={selectedSundayId}
                    onSelect={setSelectedSundayId}
                    formatSunday={formatSunday}
                />
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="mt-6 flex-1">

                {/* RESUMENEN EQUIPO */}
                <div className="lg:self-start">
                        <motion.div
                            variants={fadeUp}
                            className="shrink-0"
                        >
                            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                Equipo confirmado
                            </h2>
                        </motion.div>

                        {teamLoading ? (
                                <TeamSkeleton />
                            ) : (
                                <motion.div
                                        variants={fadeUp}
                                        className="shrink-0 mt-4"
                                >
                                <AdvisorTeamSummary
                                    team={confirmedTeam}
                                    blessCount={confirmedBlessCount}
                                    passCount={confirmedPassCount}
                                    prepareCount={confirmedPrepareCount}
                                    teamIsValid={confirmedTeamIsComplete}
                                />
                            </motion.div>
                        )}
                    </div>

                    <div className="flex w-full flex-col">
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

            {/* GUARDAR EQUIPO */}
            <div className="mt-6">
                <Button
                    className="h-12 w-full rounded-2xl bg-green-600 text-base font-semibold text-white hover:bg-green-700"
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
    )
}