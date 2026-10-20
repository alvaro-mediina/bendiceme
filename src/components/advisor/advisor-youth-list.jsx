"use client";

import AdvisorYouthCard from "./advisor-youth-card";
import { useState } from "react";

export default function AdvisorYouthList({
    availableYouth,
    team,
    blessCount,
    passCount,
    loadingYouth,
    onSelectRole,
    onTogglePrepares,
}) {
    const [expandedYouthId, setExpandedYouthId] =
        useState(null);

    const pendingYouth = availableYouth.filter(
        (person) =>
            team[person.id]?.status === "pending"
    );

    const confirmedYouth = availableYouth.filter(
        (person) =>
            team[person.id]?.status === "confirmed"
    );

    const unassignedYouth = availableYouth.filter(
        (person) => !team[person.id]
    );

    const draftYouth = availableYouth.filter(
        (person) =>
            team[person.id]?.status === "draft"
    );

    if (loadingYouth) {
        return (
            <div className="flex flex-col gap-3">
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

    const renderYouthCard = (person) => {
        const assignment = team[person.id];

        const isBlessing =
            assignment?.role === "bless";

        const isPassing =
            assignment?.role === "pass";

        const blessFull =
            blessCount >= 2 && !isBlessing;

        const passFull =
            passCount >= 3 && !isPassing;

        return (
            <AdvisorYouthCard
                key={person.id}
                person={person}
                assignment={assignment}
                blessFull={blessFull}
                passFull={passFull}
                onSelectRole={onSelectRole}
                onTogglePrepares={onTogglePrepares}
                expanded={
                    expandedYouthId === person.id
                }
                onToggleExpanded={() =>
                    setExpandedYouthId(
                        (current) =>
                            current === person.id
                                ? null
                                : person.id
                    )
                }
            />
        );
    };

    return (
        <div className="mt-6 space-y-7">

            {draftYouth.length > 0 && (
                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <span className="size-2 rounded-full bg-slate-400" />

                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                            Cambios sin guardar
                        </p>

                        <span className="text-xs font-medium text-slate-500">
                            {draftYouth.length}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3">
                        {draftYouth.map((person) =>
                            renderYouthCard(person)
                        )}
                    </div>
                </section>
            )}

            {pendingYouth.length > 0 && (
                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <span className="size-2 rounded-full bg-amber-500" />

                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                            Pendientes
                        </p>

                        <span className="text-xs font-medium text-amber-600">
                            {pendingYouth.length}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3">
                        {pendingYouth.map((person) =>
                            renderYouthCard(person)
                        )}
                    </div>
                </section>
            )}

            {confirmedYouth.length > 0 && (
                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <span className="size-2 rounded-full bg-green-600" />

                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-green-700">
                            Confirmados
                        </p>

                        <span className="text-xs font-medium text-green-600">
                            {confirmedYouth.length}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3">
                        {confirmedYouth.map((person) =>
                            renderYouthCard(person)
                        )}
                    </div>
                </section>
            )}

            {unassignedYouth.length > 0 && (
                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Disponibles
                        </p>

                        <span className="text-xs font-medium text-muted-foreground">
                            {unassignedYouth.length}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3">
                        {unassignedYouth.map((person) =>
                            renderYouthCard(person)
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}