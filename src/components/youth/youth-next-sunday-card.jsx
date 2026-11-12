"use client";

import Image from "next/image";
import { BookOpen, Church } from "lucide-react";
import { formatSunday } from "@/lib/sundays";

export default function YouthNextSundayCard({
  nextSunday,
  assignment,
  classes,
  error,
  onRetry,
  currentYouthId,
}) {
  return (
    <section className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Próximo Domingo
      </p>
      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-[28px] border border-red-200 bg-red-50 p-5 text-sm text-red-700"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 min-h-12 rounded-2xl border border-red-200 px-4 font-semibold hover:bg-red-100"
          >
            Volver a intentar
          </button>
        </div>
      ) : nextSunday ? (
        <article className="relative isolate mt-4 min-h-[300px] w-full overflow-hidden rounded-[28px] text-left [clip-path:inset(0_round_28px)]">
          <Image
            src="/images/advisor/sacrament-home.png"
            alt=""
            fill
            loading="eager"
            sizes="(max-width: 608px) calc(100vw - 32px), 576px"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[85%]" />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/95 via-black/55 to-black/10" />

          <div className="relative flex min-h-[300px] flex-col justify-end p-5 text-white sm:p-6">
            <h2 className="text-2xl font-bold leading-tight tracking-tight [text-shadow:0_2px_8px_rgb(0_0_0/0.5)] sm:text-3xl">
              {formatSunday(nextSunday.date)}
            </h2>

            <div
              className={`mt-5 grid gap-4 ${classes.length > 0 ? "sm:grid-cols-2" : ""}`}
            >
              <div className="min-w-0">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-green-100">
                  <Church className="size-4 shrink-0" />
                  Santa Cena
                </h3>
                {assignment ? (
                  <>
                    <p className="mt-2 text-lg font-semibold leading-snug">
                      {assignment.role === "bless" ? "Bendecir" : "Repartir"}
                      {assignment.prepares && " y preparar"}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-white/90">
                      {assignment.status === "confirmed"
                        ? "Confirmado"
                        : "Pendiente de confirmación"}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-base leading-relaxed">
                    Todavía no tenés una asignación
                  </p>
                )}
              </div>

              {classes.length > 0 && (
                <div className="min-w-0 space-y-3 border-t border-white/25 pt-4 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-green-100">
                    <BookOpen className="size-4 shrink-0" />
                    Escuela Dominical
                  </h3>
                  {classes.map((item) => (
                    <div key={item.id}>
                      <p className="break-words text-lg font-semibold leading-snug">
                        {item.topic}
                      </p>
                      <p className="mt-1 break-words text-sm leading-relaxed text-white/90">
                        {String(item.teacher_youth_id) ===
                        String(currentYouthId)
                          ? "Te toca enseñar"
                          : `La clase la da ${item.teacher_name}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </article>
      ) : (
        <p className="mt-4 rounded-[28px] border p-5 text-sm text-muted-foreground">
          No hay próximos domingos disponibles.
        </p>
      )}
    </section>
  );
}
