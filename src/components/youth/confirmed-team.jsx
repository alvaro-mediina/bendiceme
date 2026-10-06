"use client";

function TeamSection({
    title,
    members,
    currentYouthId,
}) {
    if (members.length === 0) {
        return null;
    }

    return (
        <div>
            <p className="text-sm font-semibold">
                {title}
            </p>

            <div className="mt-2 space-y-2">
                {members.map((member) => (
                    <div
                        key={member.youth_id}
                        className="flex items-center gap-2 text-sm"
                    >
                        <span>
                            {member.youth?.name}
                        </span>

                        {member.youth_id ===
                            currentYouthId && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                <span className="size-1.5 rounded-full bg-green-500" />
                                Vos
                            </span>
                        )}

                        {member.prepares && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                <span className="size-1.5 rounded-full bg-emerald-400" />
                                Prepara Santa Cena
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ConfirmedTeam({
    loadingTeam,
    confirmedTeam,
    blessingTeam,
    passingTeam,
    currentYouthId,
}) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Equipo confirmado
            </p>

            {loadingTeam ? (
                <p className="mt-3 text-sm text-muted-foreground">
                    Cargando equipo...
                </p>
            ) : confirmedTeam.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                    Todavía no hay jóvenes confirmados para este domingo.
                </p>
            ) : (
                <div className="mt-4 space-y-5">
                    <TeamSection
                        title="Bendicen"
                        members={blessingTeam}
                        currentYouthId={
                            currentYouthId
                        }
                    />

                    <TeamSection
                        title="Reparten"
                        members={passingTeam}
                        currentYouthId={
                            currentYouthId
                        }
                    />
                </div>
            )}
        </div>
    );
}