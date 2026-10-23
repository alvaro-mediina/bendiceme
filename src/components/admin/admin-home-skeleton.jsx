import { Building2, Plus } from "lucide-react";

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

      <section className="mt-8 rounded-3xl border bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-green-50 text-green-700">
            <Plus className="size-5" />
          </div>

          <div>
            <h2 className="font-semibold">Nuevo barrio</h2>

            <p className="text-sm text-muted-foreground">
              Creá la estructura inicial del barrio.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <p className="text-sm font-medium">Nombre</p>

            <div className="skeleton-shimmer mt-2 h-11 w-full rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Reparten</p>

              <div className="skeleton-shimmer mt-2 h-11 rounded-xl" />
            </div>

            <div>
              <p className="text-sm font-medium">Preparan</p>

              <div className="skeleton-shimmer mt-2 h-11 rounded-xl" />
            </div>
          </div>

          <div className="skeleton-shimmer h-11 rounded-xl" />
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
