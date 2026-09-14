import { Button } from "@/components/ui/button";

export default function SundayTeamCard({
    day,
    month,
    bless,
    pass,
    prepareCount,
}) {
    const teamCount =
        bless.length + pass.length;

    return (
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex size-12 flex-col items-center justify-center rounded-xl bg-green-50 text-green-700">
                    <span className="text-lg font-semibold leading-none">
                        {day}
                    </span>

                    <span className="mt-1 text-[10px] font-semibold">
                        {month}
                    </span>
                </div>

                <div>
                    <p className="font-semibold">
                        Domingo {day}
                    </p>

                    <p className="text-xs text-muted-foreground">
                        Equipo {teamCount}/5
                    </p>
                </div>
            </div>

            <div className="my-5 border-t" />

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Bendecir · {bless.length}/2
                    </p>

                    <div className="mt-2 space-y-2">
                        {bless.map((person) => (
                            <p
                                key={person.name}
                                className="text-sm"
                            >
                                {person.name}
                                {person.prepares &&
                                    " · Prepara"}
                            </p>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Repartir · {pass.length}/3
                    </p>

                    <div className="mt-2 space-y-2">
                        {pass.map((person) => (
                            <p
                                key={person.name}
                                className="text-sm"
                            >
                                {person.name}
                                {person.prepares &&
                                    " · Prepara"}
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-5 rounded-xl bg-muted p-3">
                <p className="text-sm font-medium">
                    Preparación
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                    {prepareCount >= 2
                        ? `${prepareCount} jóvenes asignados`
                        : `Falta asignar ${
                              2 - prepareCount
                          } joven`}
                </p>
            </div>

            <Button
                variant="outline"
                className="mt-5 rounded-xl"
            >
                Gestionar
            </Button>
        </article>
    );
}