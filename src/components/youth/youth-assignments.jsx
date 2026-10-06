"use client";

import {
    CircleAlert,
} from "lucide-react";
import BrandLogo from "../brand-logo";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import {
    fadeUp,
    staggerContainer,
} from "@/lib/animations";
import YouthAssignmentSkeleton from "./youth-assignment-skeleton";
import AssignmentEmptyState from "./assignment-empty-state";
import useNextAssignment from "@/hooks/use-next-assignment";
import useConfirmedTeam from "@/hooks/use-confirmed-team";
import AssignmentCard from "./assignment-card";
import AssignmentDeclinedState from "./assignment-declined-state";
import PageHeader from "../page-header";

export default function YouthAssignments({
    currentYouth,
    onBack,
}) {

    const {
        assignment,
        loading,
        updating,
        errorMessage,
        updateStatus,
    } = useNextAssignment(
        currentYouth
    );
    const {
        confirmedTeam,
        loadingTeam,
        blessingTeam,
        passingTeam,
    } = useConfirmedTeam(
        assignment
    );

    const youthName = currentYouth.name.split(" ")[0]


    if (loading) {
       return <YouthAssignmentSkeleton/>;
    }

    if (errorMessage && !assignment) {
        return (
            <motion.section
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="mx-auto w-full max-w-xl"
            >
                <motion.div variants={fadeUp}>
                    <BrandLogo />
                </motion.div>

                <motion.p
                    variants={fadeUp}
                    className="mt-8 text-sm text-red-600"
                >
                    {errorMessage}
                </motion.p>

                <motion.div
                    variants={fadeUp}
                    whileTap={{ scale: 0.98 }}
                >
                    <Button
                        variant="outline"
                        className="mt-4 rounded-xl"
                        onClick={onBack}
                    >
                        Volver
                    </Button>
                </motion.div>
            </motion.section>
        );
    }

    if (!assignment) {
        return (
            <AssignmentEmptyState
                onBack={onBack}
            />
        );
    }

    if (!assignment.sunday) {
        return (
            <motion.section 
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="mx-auto w-full max-w-xl"
            >   
                <motion.div variants={fadeUp}>
                    <BrandLogo />
                </motion.div>

                <motion.p 
                    variants={fadeUp}
                    className="text-sm text-red-600"
                >
                    No se encontró la fecha de este turno.
                </motion.p>
            </motion.section>
        );
    }

    const date = new Date(
        `${assignment.sunday.date}T00:00:00`
    );

    const formattedDate =
        date.toLocaleDateString(
            "es-AR",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
            }
        );

    const roleLabel =
        assignment.role === "bless"
            ? "Bendecir"
            : "Repartir";

    const isPending =
        assignment.status === "pending";

    const isConfirmed =
        assignment.status === "confirmed";

    const isDeclined =
        assignment.status === "declined";

    if (isDeclined) {
        return (
            <AssignmentDeclinedState
                formattedDate={formattedDate}
                onBack={onBack}
            />
        );
    }

    return (
        <motion.section 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mx-auto w-full max-w-xl"
        >
            <PageHeader
                eyebrow="Mis turnos"
                title={`Hola, ${youthName}`}
                onBack={onBack}
            />

            <AssignmentCard
                assignment={assignment}
                formattedDate={formattedDate}
                roleLabel={roleLabel}
                isConfirmed={isConfirmed}
                isPending={isPending}
                updating={updating}
                errorMessage={errorMessage}
                updateStatus={updateStatus}
                loadingTeam={loadingTeam}
                confirmedTeam={confirmedTeam}
                blessingTeam={blessingTeam}
                passingTeam={passingTeam}
                currentYouthId={currentYouth.id}
            />
        </motion.section>
    );
}