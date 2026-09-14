"use client";

import { useState } from "react";

import {
    Bell,
    BookOpen,
    CalendarDays,
    Check,
    ChevronRight,
    ClipboardList,
    Clock3,
    Home,
    Menu,
    MoreHorizontal,
    Plus,
    Settings,
    Sparkles,
    Users,
    X,
} from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const sundays = [
    {
        date: "15",
        month: "SEP",
        title: "Domingo XXIV del Tiempo Ordinario",
        status: "Completo",
        color: "green",
        count: "6/6",
    },
    {
        date: "22",
        month: "SEP",
        title: "Domingo XXV del Tiempo Ordinario",
        status: "Pendiente",
        color: "amber",
        count: "4/6",
    },
    {
        date: "29",
        month: "SEP",
        title: "Domingo XXVI del Tiempo Ordinario",
        status: "Sin asignar",
        color: "gray",
        count: "0/6",
    },
];

const people = [
    {
        name: "Sofía García",
        role: "Lectora",
        initials: "SG",
        status: "Confirmada",
    },
    {
        name: "Mateo López",
        role: "Salmo",
        initials: "ML",
        status: "Pendiente",
    },
    {
        name: "Valeria Torres",
        role: "Peticiones",
        initials: "VT",
        status: "Confirmada",
    },
];

function Logo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
            </div>

            <span className="font-semibold tracking-tight">
                Bendice
                <span className="text-primary">Me</span>
            </span>
        </div>
    );
}

function Sidebar({ view, setView }) {
    const navigationItems = [
        ["Inicio", Home],
        ["Mis turnos", ClipboardList],
        ["Calendario", CalendarDays],
        ["Mi grupo", Users],
    ];

    return (
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border/70 bg-sidebar px-4 py-6 lg:flex">
            <Logo />

            <div className="mt-10 flex flex-col gap-1">
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Menu principal
                </p>

                {navigationItems.map(([label, Icon], index) => (
                    <button
                        key={label}
                        onClick={() => index === 0 && setView("Joven")}
                        className={`
              flex items-center gap-3 rounded-xl px-3 py-2.5
              text-sm font-medium transition-colors
              ${
                  index === 0
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }
            `}
                    >
                        <Icon className="size-4" />
                        {label}
                    </button>
                ))}
            </div>

            <Separator className="my-7" />

            <div className="flex flex-col gap-1">
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Gestion
                </p>

                <button
                    onClick={() => setView("Asesor")}
                    className={`
            flex items-center gap-3 rounded-xl px-3 py-2.5
            text-sm font-medium
            ${
                view === "Asesor"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
            }
          `}
                >
                    <Settings className="size-4" />
                    Panel asesor
                </button>
            </div>

            <div className="mt-auto rounded-2xl bg-secondary/70 p-4">
                <p className="text-xs font-semibold text-foreground">
                    ¿Necesitas ayuda?
                </p>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Consulta la guía para preparar tu turno.
                </p>

                <Button variant="link" className="h-auto px-0 pt-3 text-xs">
                    Ver guía
                    <ChevronRight className="size-3" />
                </Button>
            </div>
        </aside>
    );
}

function MobileNav({ view, setView }) {
    const items = [
        ["Inicio", Home, "Joven"],
        ["Turnos", ClipboardList, "Joven"],
        ["Calendario", CalendarDays, "Joven"],
        ["Asesor", Users, "Asesor"],
    ];

    return (
        <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-border/70 bg-background/95 px-2 py-3 backdrop-blur lg:hidden">
            {items.map(([label, Icon, target]) => {
                const active =
                    view === target &&
                    label !== "Turnos" &&
                    label !== "Calendario";

                return (
                    <button
                        key={label}
                        onClick={() => setView(target)}
                        className={`
              flex min-w-16 flex-col items-center gap-1
              text-[10px] font-medium
              ${active ? "text-primary" : "text-muted-foreground"}
            `}
                    >
                        <Icon className="size-4" />
                        {label}
                    </button>
                );
            })}
        </nav>
    );
}

function Header({ view }) {
    return (
        <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 lg:hidden">
                <Button variant="ghost" size="icon" aria-label="Abrir menú">
                    <Menu />
                </Button>

                <Logo />
            </div>

            <div className="hidden lg:block">
                <p className="text-sm text-muted-foreground">
                    Domingo, 8 de septiembre de 2024
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                    {view === "Asesor"
                        ? "Panel de asesor"
                        : "Buenos días, Lucía"}
                </h1>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Notificaciones"
                    className="relative"
                >
                    <Bell />

                    <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
                </Button>

                <Avatar className="size-9 border border-border">
                    <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
                        LM
                    </AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}

function StatusBadge({ status, color }) {
    const colorClass =
        color === "green"
            ? "bg-emerald-100 text-emerald-800"
            : color === "amber"
              ? "bg-amber-100 text-amber-800"
              : "bg-muted text-muted-foreground";

    return (
        <Badge
            variant="secondary"
            className={`gap-1.5 rounded-full px-2.5 font-medium ${colorClass}`}
        >
            <span className="size-1.5 rounded-full bg-current" />
            {status}
        </Badge>
    );
}

function YouthView({ openAssignment }) {
    return (
        <div className="flex flex-col gap-6">
            <div className="lg:hidden">
                <p className="text-sm text-muted-foreground">
                    Domingo, 8 de septiembre de 2024
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                    Buenos días, Lucía
                </h1>
            </div>

            <section className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-sm sm:p-8">
                <div className="relative z-10 max-w-lg">
                    <Badge className="border-primary-foreground/20 rounded-xl bg-primary-foreground/10 text-primary-foreground">
                        Próximo domingo · 15 SEP
                    </Badge>

                    <h2 className="mt-5 text-2xl font-semibold leading-tight sm:text-3xl">
                        Tu comunidad te espera.
                    </h2>

                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-primary-foreground/75">
                        Tienes un turno asignado para la celebración de este
                        domingo.
                    </p>

                    <Button
                        onClick={openAssignment}
                        className="mt-6 bg-primary-foreground rounded-xl text-primary hover:bg-primary-foreground/90"
                    >
                        Ver mi turno
                        <ChevronRight />
                    </Button>
                </div>

                <div className="absolute -right-10 -top-14 size-56 rounded-full border-[24px] border-primary-foreground/10" />

                <div className="absolute -bottom-20 right-16 size-48 rounded-full border-[18px] border-primary-foreground/10" />
            </section>

            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="rounded-2xl border-0 bg-card shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription>Mi próximo turno</CardDescription>

                        <CardTitle className="text-lg">Lectora</CardTitle>
                    </CardHeader>

                    <CardContent className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            15 septiembre
                        </span>

                        <BookOpen className="size-5 text-primary" />
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-0 bg-card shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription>Estado del equipo</CardDescription>

                        <CardTitle className="text-lg">5 de 6 listos</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <Progress value={83} className="h-2" />
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-0 bg-card shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription>Tu disponibilidad</CardDescription>

                        <CardTitle className="text-lg">3 domingos</CardTitle>
                    </CardHeader>

                    <CardContent className="flex items-center justify-between">
                        <span className="text-sm text-emerald-700">
                            Actualizada
                        </span>

                        <Check className="size-5 text-emerald-600" />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <Card className="rounded-2xl border-0 shadow-sm">
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">
                                Próximos turnos
                            </CardTitle>

                            <CardDescription>
                                Tus participaciones y las de tu grupo
                            </CardDescription>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Más opciones"
                        >
                            <MoreHorizontal />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-1">
                        {sundays.map((sunday, index) => (
                            <div
                                key={sunday.date}
                                className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-muted/60"
                            >
                                <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary">
                                    <span className="text-[10px] font-semibold text-muted-foreground">
                                        {sunday.month}
                                    </span>

                                    <span className="text-lg font-semibold leading-none">
                                        {sunday.date}
                                    </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {sunday.title}
                                    </p>

                                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock3 className="size-3" />
                                        10:30 · Parroquia Santa María
                                    </p>
                                </div>

                                {index === 0 ? (
                                    <StatusBadge
                                        status="Tu turno"
                                        color="green"
                                    />
                                ) : (
                                    <span className="hidden text-xs text-muted-foreground sm:block">
                                        {sunday.count} asignados
                                    </span>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-0 bg-secondary/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Una nota para ti
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            “Servir es poner nuestros dones al servicio de los
                            demás. Gracias por decir que sí.”
                        </p>

                        <div className="mt-5 flex items-center gap-3">
                            <Avatar className="size-8">
                                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                                    AC
                                </AvatarFallback>
                            </Avatar>

                            <div>
                                <p className="text-xs font-semibold">
                                    Ana, tu asesora
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    Coordinadora del grupo
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function AdvisorView({ openAssignment }) {
    return (
        <div className="flex flex-col gap-6">
            <div className="lg:hidden">
                <p className="text-sm text-muted-foreground">
                    Gestión de comunidad
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                    Panel de asesor
                </h1>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="rounded-2xl border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription>Domingos este mes</CardDescription>

                        <CardTitle className="text-3xl">4</CardTitle>
                    </CardHeader>

                    <CardContent className="text-xs text-muted-foreground">
                        12 turnos programados
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription>Confirmaciones</CardDescription>

                        <CardTitle className="text-3xl">83%</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <Progress value={83} className="h-2" />
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-0 bg-amber-50 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-amber-800">
                            Requieren atención
                        </CardDescription>

                        <CardTitle className="text-3xl text-amber-950">
                            3
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="text-xs text-amber-800">
                        Personas por confirmar
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">
                            Calendario de celebraciones
                        </CardTitle>

                        <CardDescription>
                            Organiza los turnos de septiembre
                        </CardDescription>
                    </div>

                    <Button onClick={openAssignment} size="sm">
                        <Plus />
                        Gestionar turnos
                    </Button>
                </CardHeader>

                <CardContent className="flex flex-col gap-2">
                    {sundays.map((sunday) => (
                        <button
                            key={sunday.date}
                            onClick={openAssignment}
                            className="flex items-center gap-4 rounded-xl border border-border/70 p-3 text-left transition-colors hover:bg-muted/60"
                        >
                            <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary">
                                <span className="text-[10px] font-semibold text-muted-foreground">
                                    {sunday.month}
                                </span>

                                <span className="text-lg font-semibold leading-none">
                                    {sunday.date}
                                </span>
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                    {sunday.title}
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    {sunday.count} roles asignados · 10:30
                                </p>
                            </div>

                            <StatusBadge
                                status={sunday.status}
                                color={sunday.color}
                            />

                            <ChevronRight className="hidden size-4 text-muted-foreground sm:block" />
                        </button>
                    ))}
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-2xl border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Actividad reciente
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-4">
                        {people.map((person) => (
                            <div
                                key={person.name}
                                className="flex items-center gap-3"
                            >
                                <Avatar className="size-9">
                                    <AvatarFallback className="bg-secondary text-xs">
                                        {person.initials}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {person.name}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        {person.role} · Domingo 15
                                    </p>
                                </div>

                                <span className="text-xs text-emerald-700">
                                    {person.status}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-0 bg-primary text-primary-foreground shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Todo en orden</CardTitle>

                        <CardDescription className="text-primary-foreground/70">
                            Tu grupo tiene una buena racha.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <p className="text-3xl font-semibold">92%</p>

                        <p className="mt-1 text-xs text-primary-foreground/70">
                            de turnos confirmados este trimestre
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function AssignmentDialog({ open, setOpen }) {
    const [role, setRole] = useState("Lecturas");

    const availablePeople = [
        {
            name: "Valeria Torres",
            initials: "VT",
        },
        {
            name: "Daniel Martín",
            initials: "DM",
        },
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg rounded-3xl">
                <DialogHeader>
                    <DialogTitle>Gestionar turnos</DialogTitle>

                    <DialogDescription>
                        Domingo 15 de septiembre · 10:30
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={role} onValueChange={setRole} className="mt-2">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="Lecturas">Lecturas</TabsTrigger>

                        <TabsTrigger value="Salmo">Salmo</TabsTrigger>

                        <TabsTrigger value="Peticiones">Peticiones</TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value={role}
                        className="mt-5 flex flex-col gap-3"
                    >
                        <div className="rounded-xl bg-secondary/70 p-3">
                            <p className="text-xs text-muted-foreground">
                                Responsable actual
                            </p>

                            <div className="mt-2 flex items-center gap-3">
                                <Avatar className="size-9">
                                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                                        SG
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        Sofía García
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        Confirmada
                                    </p>
                                </div>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Quitar responsable"
                                        >
                                            <X className="text-muted-foreground" />
                                        </Button>
                                    </AlertDialogTrigger>

                                    <AlertDialogContent className="rounded-3xl">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                ¿Quitar esta asignación?
                                            </AlertDialogTitle>

                                            <AlertDialogDescription>
                                                Sofía recibirá una notificación
                                                para volver a indicar su
                                                disponibilidad.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>

                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                Cancelar
                                            </AlertDialogCancel>

                                            <AlertDialogAction className="bg-destructive text-destructive-foreground">
                                                Quitar asignación
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>

                        <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Personas disponibles
                        </p>

                        {availablePeople.map((person) => (
                            <div
                                key={person.name}
                                className="flex items-center gap-3 rounded-xl border border-border/70 p-3"
                            >
                                <Avatar className="size-9">
                                    <AvatarFallback className="bg-secondary text-xs">
                                        {person.initials}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        {person.name}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        Disponible este domingo
                                    </p>
                                </div>

                                <Button variant="outline" size="sm">
                                    Asignar
                                </Button>
                            </div>
                        ))}
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end border-t pt-4">
                    <Button onClick={() => setOpen(false)}>
                        Guardar cambios
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function Page() {
    const [view, setView] = useState("Joven");
    const [assignmentOpen, setAssignmentOpen] = useState(false);

    const openAssignment = () => {
        setAssignmentOpen(true);
    };

    return (
        <main className="flex min-h-screen bg-background">
            <Sidebar view={view} setView={setView} />

            <div className="min-w-0 flex-1">
                <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 pb-24 pt-5 sm:px-8 lg:px-12 lg:pb-10 lg:pt-8">
                    <Header view={view} />

                    <div className="mt-8 flex-1">
                        {view === "Asesor" ? (
                            <AdvisorView openAssignment={openAssignment} />
                        ) : (
                            <YouthView openAssignment={openAssignment} />
                        )}
                    </div>
                </div>
            </div>

            <MobileNav view={view} setView={setView} />

            <AssignmentDialog
                open={assignmentOpen}
                setOpen={setAssignmentOpen}
            />
        </main>
    );
}
