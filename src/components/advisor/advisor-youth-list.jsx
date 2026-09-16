"use client";

import AdvisorYouthCard from "./advisor-youth-card";

export default function AdvisorYouthList({
    availableYouth,
    team,
    blessCount,
    passCount,
    loadingYouth,
    onSelectRole,
    onTogglePrepares,
}) {
    if (loadingYouth) {
        return (
            <div className="mt-4 flex flex-col gap-3">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="relative h-[110px] overflow-hidden rounded-2xl border bg-gray-100"
                    >
                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />
                    </div>
                ))}
            </div>
        );
    }

    if (availableYouth.length === 0) {
        return (
            <div className="mt-4 rounded-2xl border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">
                    Todavía no hay jóvenes disponibles para este domingo.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-4 flex flex-col gap-3">
            {availableYouth.map((person) => {
                const assignment =
                    team[person.id];

                const isBlessing =
                    assignment?.role === "bless";

                const isPassing =
                    assignment?.role === "pass";

                const blessFull =
                    blessCount >= 2 &&
                    !isBlessing;

                const passFull =
                    passCount >= 3 &&
                    !isPassing;

                return (
                    <AdvisorYouthCard
                        key={person.id}
                        person={person}
                        assignment={assignment}
                        blessFull={blessFull}
                        passFull={passFull}
                        onSelectRole={onSelectRole}
                        onTogglePrepares={
                            onTogglePrepares
                        }
                    />
                );
            })}
        </div>
    );
}