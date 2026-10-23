import { Building2, ChevronDown, Plus } from "lucide-react";

export default function AdminHomeSkeleton() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-8 sm:px-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
          Administración
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Barrios</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Administrá los barrios que utilizan BendiceMe.
        </p>
      </header>

      <section className="mt-8 rounded-3xl border bg-white">
        <div className="flex w-full items-center gap-3 p-5">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-green-50 text-green-700">
            <Plus className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">Nuevo barrio</h2>

            <p className="text-sm text-muted-foreground">
              Creá la estructura inicial del barrio.
            </p>
          </div>

          <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Barrios registrados</h2>

          <div className="skeleton-shimmer h-4 w-6 rounded-lg" />
        </div>

        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center gap-4 rounded-2xl border bg-white p-4"
            >
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-green-50 text-green-700">
                <Building2 className="size-5" />
              </div>

              <div className="flex-1 space-y-2">
                <div className="skeleton-shimmer h-4 w-36 rounded-lg" />

                <div className="skeleton-shimmer h-3 w-44 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
