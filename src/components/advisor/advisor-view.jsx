import SundayTeamCard from "./sunday-team-card";

const mockSunday = {
    day: "20",
    month: "SEP",
    bless: [
        {
            name: "Juan",
            prepares: true,
        },
        {
            name: "Pedro",
            prepares: false,
        },
    ],
    pass: [
        {
            name: "Mateo",
            prepares: true,
        },
        {
            name: "Lucas",
            prepares: false,
        },
    ],
};

export default function AdvisorView() {
    const prepareCount = [
        ...mockSunday.bless,
        ...mockSunday.pass,
    ].filter(
        (person) => person.prepares
    ).length;

    return (
        <section className="mx-auto w-full max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                Vista del asesor
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Gestionar domingos
            </h1>

            <p className="mt-2 text-muted-foreground">
                Organizá el equipo de la Santa Cena.
            </p>

            <div className="mt-8">
                <SundayTeamCard
                    {...mockSunday}
                    prepareCount={
                        prepareCount
                    }
                />
            </div>
        </section>
    );
}