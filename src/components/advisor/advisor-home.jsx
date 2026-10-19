"use client";

export default function AdvisorHome({
    onNavigate,
}) {
    return (
        <section className="space-y-8">
            <div>
                <p className="text-sm text-muted-foreground">
                    Panel del asesor
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                    Inicio
                </h1>
            </div>

            <section>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Próximo domingo
                </p>

                <div className="mt-3 rounded-3xl border bg-card p-5 shadow-sm">
                    <p className="font-medium">
                        Próximo equipo
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Acá mostraremos el estado
                        del próximo domingo.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            onNavigate("sacrament")
                        }
                        className="mt-5 text-sm font-medium text-green-700"
                    >
                        Ver Santa Cena →
                    </button>
                </div>
            </section>

            <section>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Accesos rápidos
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            onNavigate("sacrament")
                        }
                        className="rounded-2xl border bg-card p-4 text-left"
                    >
                        Santa Cena
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            onNavigate("youth")
                        }
                        className="rounded-2xl border bg-card p-4 text-left"
                    >
                        Jóvenes
                    </button>
                </div>
            </section>
        </section>
    );
}