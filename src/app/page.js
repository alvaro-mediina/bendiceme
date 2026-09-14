"use client";

import { useState } from "react";

import {
    CalendarDays,
    Check,
    ChevronLeft,
    ClipboardList,
    Home,
    Settings2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const sundays = [
    {
        day: "6",
        month: "SEP",
        label: "Domingo 6 de septiembre",
    },
    {
        day: "13",
        month: "SEP",
        label: "Domingo 13 de septiembre",
    },
    {
        day: "20",
        month: "SEP",
        label: "Domingo 20 de septiembre",
    },
    {
        day: "27",
        month: "SEP",
        label: "Domingo 27 de septiembre",
    },
];

const assignments = [
    {
        day: "20",
        month: "SEP",
        bless: ["Juan", "Pedro"],
        share: ["Mateo", "Lucas"],
        missing: 1,
    },
    {
        day: "27",
        month: "SEP",
        bless: ["Sofía"],
        share: ["Valeria", "Daniel"],
        missing: 0,
    },
];

function Logo() {
    return (
        <div className="text-xl font-semibold tracking-tight text-black">
            Bendice
            <span className="text-green-600">Me</span>
        </div>
    );
}

function DateOption({ selected, onSelect, day, month, label }) {
    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className={`
                flex w-full items-center gap-4 rounded-2xl border p-4
                text-left transition-all
                ${
                    selected
                        ? "border-green-600 bg-green-50"
                        : "border-border bg-white hover:border-green-300"
                }
            `}
        >
            <div
                className={`
                    flex size-14 shrink-0 flex-col items-center
                    justify-center rounded-xl
                    ${
                        selected
                            ? "bg-green-600 text-white"
                            : "bg-muted text-foreground"
                    }
                `}
            >
                <span className="text-lg font-semibold leading-none">
                    {day}
                </span>

                <span className="mt-1 text-[10px] font-semibold">{month}</span>
            </div>

            <span className="flex-1 text-sm font-medium sm:text-[15px]">
                {label}
            </span>

            <div
                className={`
                    grid size-6 shrink-0 place-items-center rounded-full border
                    ${
                        selected
                            ? "border-green-600 bg-green-600 text-white"
                            : "border-muted-foreground/30"
                    }
                `}
            >
                {selected && <Check className="size-4" />}
            </div>
        </button>
    );
}

function YouthHome({ onSave }) {
    const [selected, setSelected] = useState(["20"]);

    const toggleSunday = (day) => {
        setSelected((current) => {
            if (current.includes(day)) {
                return current.filter((item) => item !== day);
            }

            return [...current, day];
        });
    };

    return (
        <section className="mx-auto w-full max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                Disponibilidad · Septiembre
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Hola, Mateo
            </h1>

            <p className="mt-2 text-muted-foreground">
                ¿En qué domingos podés servir?
            </p>

            <div
                className="mt-8 flex flex-col gap-3"
                aria-label="Domingos disponibles"
            >
                {sundays.map((sunday) => (
                    <DateOption
                        key={sunday.day}
                        {...sunday}
                        selected={selected.includes(sunday.day)}
                        onSelect={() => toggleSunday(sunday.day)}
                    />
                ))}
            </div>

            <Button
                className="mt-8 h-12 w-full rounded-xl bg-green-600 text-white hover:bg-green-700"
                onClick={onSave}
                disabled={selected.length === 0}
            >
                Guardar disponibilidad
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
                Podés seleccionar más de un domingo.
            </p>
        </section>
    );
}

function SavedHome({ onEdit }) {
    const [status, setStatus] = useState("pending");

    const isConfirmed = status === "confirmed";

    const isDeclined = status === "declined";

    return (
        <section className="mx-auto w-full max-w-xl">
            <button
                type="button"
                onClick={onEdit}
                className="mb-8 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ChevronLeft className="size-4" />
                Cambiar disponibilidad
            </button>

            <div className="grid size-12 place-items-center rounded-full bg-green-100 text-green-700">
                <Check className="size-6" />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                Disponibilidad guardada
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Tu disponibilidad fue guardada
            </h1>

            <p className="mt-2 text-muted-foreground">
                Te avisaremos cuando tus turnos estén listos.
            </p>

            <article className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Próximo domingo
                        </p>

                        <div className="mt-2 flex items-end gap-1">
                            <strong className="text-4xl leading-none">
                                20
                            </strong>

                            <span className="text-sm font-semibold text-muted-foreground">
                                SEP
                            </span>
                        </div>
                    </div>

                    <span
                        className={`
                            rounded-full px-3 py-1 text-xs font-medium
                            ${
                                isConfirmed
                                    ? "bg-green-100 text-green-700"
                                    : isDeclined
                                      ? "bg-red-100 text-red-700"
                                      : "bg-orange-100 text-orange-700"
                            }
                        `}
                    >
                        {isConfirmed
                            ? "Confirmado"
                            : isDeclined
                              ? "No puedo"
                              : "Disponible"}
                    </span>
                </div>

                <div className="my-5 border-t" />

                {status === "pending" ? (
                    <>
                        <p className="font-medium">Todavía no estás asignado</p>

                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            Cuando el asesor te asigne un turno, podrás
                            confirmarlo aquí.
                        </p>

                        {/*
                            Por ahora estos botones son
                            simulados para probar el flujo.
                            Más adelante dependerán de una
                            asignación real.
                        */}
                        <div className="mt-6 flex gap-3">
                            <Button
                                variant="outline"
                                className="h-11 flex-1 rounded-xl"
                                onClick={() => setStatus("declined")}
                            >
                                No puedo
                            </Button>

                            <Button
                                className="h-11 flex-1 rounded-xl bg-green-600 text-white hover:bg-green-700"
                                onClick={() => setStatus("confirmed")}
                            >
                                Confirmar
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="font-medium">
                            {isConfirmed
                                ? "Tu asignación: Repartir"
                                : "Avisaste que no podés asistir"}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {isConfirmed
                                ? "Gracias por ayudar con la Santa Cena."
                                : "El asesor verá tu respuesta."}
                        </p>
                    </>
                )}
            </article>
        </section>
    );
}

function AdvisorView() {
    return (
        <section className="mx-auto w-full max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                Vista del asesor · Septiembre
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Gestionar domingos
            </h1>

            <p className="mt-2 text-muted-foreground">
                Organizá los turnos de la Santa Cena.
            </p>

            <div className="mt-8 flex flex-col gap-4">
                {assignments.map((assignment) => (
                    <article
                        key={assignment.day}
                        className="rounded-2xl border bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex size-12 flex-col items-center justify-center rounded-xl bg-green-50 text-green-700">
                                <span className="text-lg font-semibold leading-none">
                                    {assignment.day}
                                </span>

                                <span className="mt-1 text-[10px] font-semibold">
                                    {assignment.month}
                                </span>
                            </div>

                            <div>
                                <p className="font-semibold">
                                    Domingo {assignment.day}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    Santa Cena
                                </p>
                            </div>
                        </div>

                        <div className="my-5 border-t" />

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Bendecir
                                </p>

                                <p className="mt-2 text-sm">
                                    {assignment.bless.join(" · ")}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Repartir
                                </p>

                                <p className="mt-2 text-sm">
                                    {assignment.share.join(" · ")}
                                </p>

                                {assignment.missing > 0 && (
                                    <p className="mt-2 text-xs font-medium text-orange-600">
                                        Falta {assignment.missing} joven
                                    </p>
                                )}
                            </div>
                        </div>

                        <Button variant="outline" className="mt-6 rounded-xl">
                            Gestionar
                        </Button>
                    </article>
                ))}
            </div>
        </section>
    );
}

function DesktopHeader({ screen, setScreen }) {
    return (
        <header className="border-b bg-white">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
                <Logo />

                <nav className="hidden items-center gap-1 md:flex">
                    <button
                        onClick={() => setScreen("home")}
                        className={`
                            rounded-lg px-3 py-2 text-sm
                            ${
                                screen === "home"
                                    ? "bg-green-50 font-medium text-green-700"
                                    : "text-muted-foreground hover:text-foreground"
                            }
                        `}
                    >
                        Disponibilidad
                    </button>

                    <button
                        onClick={() => setScreen("saved")}
                        className={`
                            rounded-lg px-3 py-2 text-sm
                            ${
                                screen === "saved"
                                    ? "bg-green-50 font-medium text-green-700"
                                    : "text-muted-foreground hover:text-foreground"
                            }
                        `}
                    >
                        Mis turnos
                    </button>

                    <button
                        onClick={() => setScreen("advisor")}
                        className={`
                            rounded-lg px-3 py-2 text-sm
                            ${
                                screen === "advisor"
                                    ? "bg-green-50 font-medium text-green-700"
                                    : "text-muted-foreground hover:text-foreground"
                            }
                        `}
                    >
                        Asesor
                    </button>
                </nav>

                <span className="text-sm font-medium">Mateo</span>
            </div>
        </header>
    );
}

function MobileNav({ screen, setScreen }) {
    const items = [
        {
            label: "Inicio",
            value: "home",
            icon: Home,
        },
        {
            label: "Disponibilidad",
            value: "home",
            icon: CalendarDays,
        },
        {
            label: "Mis turnos",
            value: "saved",
            icon: ClipboardList,
        },
        {
            label: "Asesor",
            value: "advisor",
            icon: Settings2,
        },
    ];

    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t bg-white md:hidden">
            {items.map((item, index) => {
                const Icon = item.icon;

                const active =
                    screen === item.value &&
                    !(screen === "home" && index === 0);

                return (
                    <button
                        key={item.label}
                        onClick={() => setScreen(item.value)}
                        className={`
                            flex flex-1 flex-col items-center gap-1 py-3
                            text-[10px] font-medium
                            ${
                                active
                                    ? "text-green-600"
                                    : "text-muted-foreground"
                            }
                        `}
                    >
                        <Icon className="size-5" />
                        {item.label}
                    </button>
                );
            })}
        </nav>
    );
}

export default function Page() {
    const [screen, setScreen] = useState("home");

    return (
        <main className="min-h-screen bg-white">
            <DesktopHeader screen={screen} setScreen={setScreen} />

            <div className="px-5 pb-28 pt-10 md:pb-12 md:pt-16">
                {screen === "advisor" ? (
                    <AdvisorView />
                ) : screen === "saved" ? (
                    <SavedHome onEdit={() => setScreen("home")} />
                ) : (
                    <YouthHome onSave={() => setScreen("saved")} />
                )}
            </div>

            <MobileNav screen={screen} setScreen={setScreen} />
        </main>
    );
}
