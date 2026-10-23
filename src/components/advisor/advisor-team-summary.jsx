"use client";

import { CheckCircle2, CircleAlert } from "lucide-react";

export default function AdvisorTeamSummary({
  team = {},
  blessCount,
  passCount,
  prepareCount,
  requiredBlessCount,
  requiredPassCount,
  requiredPrepareCount,
  teamIsValid,
}) {
  const getYouthName = (youthId) => team[youthId]?.youth?.name ?? "Joven";

  const teamIds = Object.keys(team);

  const blessingYouth = teamIds
    .filter((youthId) => team[youthId]?.role === "bless")
    .map((youthId) => ({
      name: getYouthName(youthId),
      prepares: team[youthId]?.prepares ?? false,
    }));

  const passingYouth = teamIds
    .filter((youthId) => team[youthId]?.role === "pass")
    .map((youthId) => ({
      name: getYouthName(youthId),
      prepares: team[youthId]?.prepares ?? false,
    }));

  const assignedCount = blessCount + passCount;

  const requiredTeamCount = requiredBlessCount + requiredPassCount;

  return (
    <section className="overflow-hidden rounded-[28px] border bg-card shadow-sm">
      <div
        className={`p-5 sm:p-6 ${teamIsValid ? "bg-green-50" : "bg-amber-50"}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div
              className={`flex items-center gap-2 text-sm font-semibold ${
                teamIsValid ? "text-green-700" : "text-amber-700"
              }`}
            >
              {teamIsValid ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <CircleAlert className="size-4" />
              )}

              {teamIsValid ? "Equipo completo" : "Equipo incompleto"}
            </div>

            <p className="mt-3 text-4xl font-black tracking-tight">
              {assignedCount}
              <span className="text-2xl font-semibold text-muted-foreground">
                /{requiredTeamCount}
              </span>
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              jóvenes asignados
            </p>
          </div>

          <div className="flex gap-1.5 pt-2">
            {Array.from({
              length: requiredTeamCount,
            }).map((_, index) => (
              <span
                key={index}
                className={`size-2.5 rounded-full ${
                  index < assignedCount
                    ? teamIsValid
                      ? "bg-green-600"
                      : "bg-amber-500"
                    : "bg-black/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="divide-y">
        <RoleRow
          label="Bendicen"
          count={blessCount}
          required={requiredBlessCount}
          names={blessingYouth}
        />

        <RoleRow
          label="Reparten"
          count={passCount}
          required={requiredPassCount}
          names={passingYouth}
        />
      </div>
    </section>
  );
}

function RoleRow({ label, count, required, names, showPrepareBadge = true }) {
  const complete = count >= required;

  return (
    <div className="p-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-bold">{label}</h3>

        <div
          className={`flex items-center gap-1.5 text-sm font-bold ${
            complete ? "text-green-700" : "text-amber-700"
          }`}
        >
          {complete ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <CircleAlert className="size-4" />
          )}
          {count}/{required}
        </div>
      </div>

      {names.length > 0 ? (
        <div className="mt-3 space-y-2">
          {names.map((person, index) => (
            <div
              key={`${person.name}-${index}`}
              className="flex items-center gap-2"
            >
              <p className="text-sm font-medium text-foreground">
                {person.name}
              </p>

              {showPrepareBadge && person.prepares && (
                <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                  Prepara
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Falta asignar</p>
      )}
    </div>
  );
}
