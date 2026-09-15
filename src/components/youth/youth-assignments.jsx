"use client";

import { useEffect, useState } from "react";

import {
    Check,
    ChevronLeft,
    CircleAlert,
} from "lucide-react";
import BrandLogo from "../brand-logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import {
    fadeUp,
    scaleIn,
    staggerContainer,
} from "@/lib/animations";
import YouthAssignmentSkeleton from "./youth-assignment-skeleton";


export default function YouthAssignments({
    currentYouth,
    onBack,
}) {
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const youthName = currentYouth.name.split(" ")[0]

    useEffect(() => {
        const loadAssignment = async () => {
            const { data, error } = await supabase
                .from("assignments")
                .select(`
                    *,
                    sunday:sundays (
                        id,
                        date
                    )
                `)
                .eq("youth_id", currentYouth.id)
                .in("status", [
                    "pending",
                    "confirmed",
                ])
                .order("sunday_id", {
                    ascending: true,
                })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error(error);

                setErrorMessage(
                    "No se pudieron cargar tus turnos."
                );
            } else {
                setAssignment(data);
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

        const {
            data,
            error: assignmentError,
        } = await supabase
            .from("assignments")
            .update({
                status: newStatus,
            })
            .eq("id", assignment.id)
            .select(`
                *,
                sunday:sundays (
                    id,
                    date
                )
            `)
            .single();

        if (assignmentError) {
            console.error(assignmentError);

            setErrorMessage(
                "No se pudo actualizar el turno."
            );

            setUpdating(false);
            return;
        }

        if (newStatus === "declined") {
            const { error: availabilityError } =
                await supabase
                    .from("availability")
                    .update({
                        available: false,
                    })
                    .eq(
                        "youth_id",
                        currentYouth.id
                    )
                    .eq(
                        "sunday_id",
                        assignment.sunday_id
                    );

            if (availabilityError) {
                console.error(
                    availabilityError
                );

                setErrorMessage(
                    "El turno fue rechazado, pero no se pudo actualizar tu disponibilidad."
                );

                setUpdating(false);
                return;
            }
        }

        if (newStatus === "confirmed") {
            const { error: availabilityError } =
                await supabase
                    .from("availability")
                    .upsert(
                        {
                            youth_id:
                                currentYouth.id,
                            sunday_id:
                                assignment.sunday_id,
                            available: true,
                        },
                        {
                            onConflict:
                                "youth_id,sunday_id",
                        }
                    );

            if (availabilityError) {
                console.error(
                    availabilityError
                );

                setErrorMessage(
                    "No se pudo actualizar tu disponibilidad."
                );

                setUpdating(false);
                return;
            }
        }

        setAssignment(data);
        setUpdating(false);
    };

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
            <motion.section
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="mx-auto w-full max-w-xl"
            >
                <motion.div variants={fadeUp}>
                    <BrandLogo />
                </motion.div>

                <motion.button
                    variants={fadeUp}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onBack}
                    className="mb-8 mt-8 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ChevronLeft className="size-4" />
                    Volver
                </motion.button>

                <motion.p
                    variants={fadeUp}
                    className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600"
                >
                    Mis turnos
                </motion.p>

                <motion.h1
                    variants={fadeUp}
                    className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
                >
                    Todavía no tenés turnos asignados
                </motion.h1>

                <motion.p
                    variants={fadeUp}
                    className="mt-2 text-muted-foreground"
                >
                    Cuando el asesor te asigne un domingo,
                    aparecerá acá.
                </motion.p>
            </motion.section>
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
            <motion.section
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="mx-auto w-full max-w-xl"
            >
                <motion.div variants={fadeUp}>
                    <BrandLogo />
                </motion.div>

                <motion.button
                    variants={fadeUp}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onBack}
                    className="mb-8 mt-8 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ChevronLeft className="size-4" />
                    Volver
                </motion.button>

                <motion.p
                    variants={fadeUp}
                    className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600"
                >
                    Mis turnos
                </motion.p>

                <motion.div
                    variants={scaleIn}
                    className="mt-8"
                >
                    <div className="grid size-12 place-items-center rounded-full bg-red-100 text-red-700">
                        <CircleAlert className="size-6" />
                    </div>

                    <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                        Entonces NO ESTÁS DISPONIBLE.
                    </h1>

                    <p className="mt-3 text-muted-foreground">
                        Avisaste que no vas a poder servir el{" "}
                        <span className="font-medium text-foreground">
                            {formattedDate}
                        </span>.
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                        El asesor verá que ya no estás disponible
                        para ese domingo.
                    </p>
                </motion.div>
            </motion.section>
        );
    }

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

        <motion.button
            variants={fadeUp}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onBack}
            className="mb-8 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
            <ChevronLeft className="size-4" />
            Volver
        </motion.button>

            <motion.p 
                variants={fadeUp}
                className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600"
            >
                Mis turnos
            </motion.p>

            <motion.h1 
                variants={fadeUp}
                className="mt-3 text-3xl font-semibold tracking-tight"
            >
                Hola, {youthName}
            </motion.h1>

           <motion.article
                variants={fadeUp}
                className="mt-6 rounded-2xl border bg-white p-4 shadow-sm sm:mt-8 sm:p-5"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Próximo turno
                        </p>

                        <p className="mt-2 text-lg font-semibold capitalize">
                            {formattedDate}
                        </p>
                    </div>

                    <span
                        className={`
                            rounded-full px-3 py-1
                            text-xs font-medium
                            ${
                                isConfirmed
                                    ? "bg-green-100 text-green-700"
                                    : "bg-amber-100 text-amber-700"
                            }
                        `}
                    >
                        {isConfirmed
                            ? "Confirmado"
                            : "Pendiente"}
                    </span>
                </div>

                <div className="my-5 border-t" />

                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Tu asignación
                    </p>

                    <p className="mt-2 text-xl font-semibold">
                        {roleLabel}
                    </p>
                </div>

                {assignment.prepares && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 6,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.2,
                        }}
                        className="mt-4 rounded-xl bg-green-50 p-4"
                    >
                        <p className="text-sm font-medium text-green-800">
                            También preparás la Santa Cena
                        </p>

                        <p className="mt-1 text-xs text-green-700">
                            Formás parte del equipo que prepara
                            antes de la reunión.
                        </p>
                    </motion.div>
                )}

                {errorMessage && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 text-sm text-red-600"
                    >
                        {errorMessage}
                    </motion.p>
                )}

                <AnimatePresence mode="wait">
                    {isPending && (
                        <motion.div
                            key="pending"
                            initial={{
                                opacity: 0,
                                y: 8,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                y: -8,
                            }}
                            transition={{
                                duration: 0.2,
                            }}
                            className="mt-6 flex gap-3"
                        >
                            <motion.div
                                className="flex-1"
                                whileTap={{
                                    scale: 0.98,
                                }}
                            >
                                <Button
                                    variant="outline"
                                    className="h-11 w-full rounded-xl"
                                    disabled={updating}
                                    onClick={() =>
                                        updateStatus("declined")
                                    }
                                >
                                    No puedo
                                </Button>
                            </motion.div>

                            <motion.div
                                className="flex-1"
                                whileTap={{
                                    scale: 0.98,
                                }}
                            >
                                <Button
                                    className="h-11 w-full rounded-xl bg-green-600 text-white hover:bg-green-700"
                                    disabled={updating}
                                    onClick={() =>
                                        updateStatus("confirmed")
                                    }
                                >
                                    {updating
                                        ? "Guardando..."
                                        : "Confirmar"}
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}

                    {isConfirmed && (
                        <motion.div
                            key="confirmed"
                            initial={{
                                opacity: 0,
                                scale: 0.97,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                            }}
                            transition={{
                                duration: 0.25,
                            }}
                            className="mt-6 rounded-xl bg-green-50 p-4"
                        >
                            <div className="flex items-center gap-2 text-green-700">
                                <div className="grid size-8 place-items-center rounded-full bg-green-100">
                                    <Check className="size-4" />
                                </div>

                                <p className="font-semibold">
                                    Turno confirmado
                                </p>
                            </div>

                            <p className="mt-3 text-sm text-green-800">
                                Confirmaste que vas a servir el{" "}
                                <span className="font-semibold">
                                    {formattedDate}
                                </span>.
                            </p>

                            <p className="mt-1 text-sm text-green-700">
                                Tu asignación es{" "}
                                <span className="font-semibold">
                                    {roleLabel.toLowerCase()}
                                </span>
                                {assignment.prepares
                                    ? " y también vas a preparar la Santa Cena."
                                    : "."}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.article>
        </motion.section>
    );
}