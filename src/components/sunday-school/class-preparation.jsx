"use client";

import { BookOpen, Lightbulb } from "lucide-react";

export default function ClassPreparation({ aids }) {
  const hasAids = Boolean(aids?.scriptures || aids?.keyTips);

  return (
    <section className="mt-5 border-t border-green-200 pt-5">
      <h3 className="text-base font-semibold text-green-900">
        Prepará tu clase
      </h3>
      {hasAids ? (
        <div className="mt-4 space-y-4">
          {aids.scriptures && (
            <div className="rounded-2xl border border-green-100 bg-background p-4">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-green-800">
                <BookOpen className="size-4 shrink-0" />
                Escrituras
              </h4>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">
                {aids.scriptures}
              </p>
            </div>
          )}
          {aids.keyTips && (
            <div className="rounded-2xl border border-green-100 bg-background p-4">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-green-800">
                <Lightbulb className="size-4 shrink-0" />
                Consejos clave
              </h4>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">
                {aids.keyTips}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Tu asesor todavía no agregó ayudas para esta clase.
        </p>
      )}
    </section>
  );
}
