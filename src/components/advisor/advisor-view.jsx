"use client";

import BrandLogo from "../brand-logo";
import AdvisorTeamSummary from "./advisor-team-summary";
import AdvisorSundaySelector from "./advisor-sunday-selector";
import AdvisorYouthList from "./advisor-youth-list";
import useAdvisorTeam from "@/hooks/use-advisor-team";
import useAdvisorAvailability from "@/hooks/use-advisor-availability";
import { formatSunday } from "@/lib/sundays";
import { motion } from "motion/react";
import {
    fadeUp,
    staggerContainer,
} from "@/lib/animations";

export default function AdvisorView({onBack}) {
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
        savingTeam,
        saveMessage,
        teamError,
        selectRole,
        togglePrepares,
        saveTeam,
    } = useAdvisorTeam(selectedSundayId);

    return (
        <motion.section
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mx-auto w-full max-w-2xl"
        >
            <motion.div variants={fadeUp}>
                <BrandLogo />
            </motion.div>

            <motion.p
                variants={fadeUp}
                className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600"
            >
                Gestión del domingo
            </motion.p>

             <motion.button
                variants={fadeUp}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onBack}
                className="mt-3 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ChevronLeft className="size-4" />
                Volver
            </motion.button>

            <motion.h1
                variants={fadeUp}
                className="mt-8 text-2xl font-semibold tracking-tight sm:text-3xl"
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
            
            {(availabilityError || teamError) && (
                <motion.p
                    variants={fadeUp}
                    className="mt-4 text-sm text-red-600"
                >
                    {availabilityError || teamError}
                </motion.p>
            )}

           {!loadingSundays && (
                <AdvisorSundaySelector
                    sundays={sundays}
                    selectedSundayId={selectedSundayId}
                    onSelect={setSelectedSundayId}
                    formatSunday={formatSunday}
                />
            )}

            <motion.div
                variants={fadeUp}
                className="mt-8"
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

                
                <AdvisorYouthList
                    availableYouth={availableYouth}
                    team={team}
                    blessCount={blessCount}
                    passCount={passCount}
                    loadingYouth={loadingYouth}
                    onSelectRole={selectRole}
                    onTogglePrepares={togglePrepares}
                />
                
            </motion.div>
                
            <AdvisorTeamSummary
                blessCount={blessCount}
                passCount={passCount}
                prepareCount={prepareCount}
                teamIsValid={teamIsValid}
                hasTeamChanges={hasTeamChanges}
                savingTeam={savingTeam}
                saveMessage={saveMessage}
                onSave={saveTeam}
            />
        </motion.section>
        
    );
}