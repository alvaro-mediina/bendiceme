import { ArrowLeft, Building2, UsersRound, UserRoundCog } from "lucide-react";

export default function AdminWardSkeleton() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" />
        Volver a barrios
      </div>

      <header className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
          Administración
        </p>

        <div className="skeleton-shimmer mt-2 h-9 w-44 rounded-xl" />

        <p className="mt-3 text-sm text-muted-foreground">
          Revisá las solicitudes de alta y consultá los jóvenes del barrio.
        </p>
      </header>

      <section className="mt-8 rounded-3xl border bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-green-50 text-green-700">
            <Building2 className="size-5" />
          </div>

          <div>
            <h2 className="font-semibold">Santa Cena</h2>

            <p className="text-sm text-muted-foreground">
              Configuración actual del barrio
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Reparten</p>

            <div className="skeleton-shimmer mt-2 h-7 w-8 rounded-lg" />
          </div>

          <div className="rounded-2xl bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Preparan</p>

            <div className="skeleton-shimmer mt-2 h-7 w-8 rounded-lg" />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-green-50 text-green-700">
            <UserRoundCog className="size-5" />
          </div>

          <div>
            <h2 className="font-semibold">Asesores</h2>

            <p className="text-sm text-muted-foreground">
              Administrá quienes pueden gestionar este barrio.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {[1].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-2xl border p-4"
            >
              <div className="skeleton-shimmer size-10 rounded-full" />

              <div className="flex-1 space-y-2">
                <div className="skeleton-shimmer h-4 w-40 rounded-lg" />

                <div className="skeleton-shimmer h-3 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          <p className="text-sm font-medium">Correo del nuevo asesor</p>

          <div className="skeleton-shimmer h-11 w-full rounded-xl" />
        </div>
      </section>

      <section className="mt-6 rounded-3xl border bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-green-50 text-green-700">
            <UsersRound className="size-5" />
          </div>

          <div>
            <h2 className="font-semibold">Jóvenes</h2>

            <p className="text-sm text-muted-foreground">
              Administrá los jóvenes asociados al barrio.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Solicitudes pendientes</h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Jóvenes cargados por los asesores.
              </p>
            </div>

            <div className="skeleton-shimmer h-6 w-6 rounded-full" />
          </div>

          <div className="mt-4 space-y-3">
            {[1].map((item) => (
              <div key={item} className="rounded-2xl border p-4">
                <div className="skeleton-shimmer h-4 w-36 rounded-lg" />

                <div className="skeleton-shimmer mt-2 h-3 w-44 rounded-lg" />

                <div className="skeleton-shimmer mt-2 h-3 w-20 rounded-lg" />

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="skeleton-shimmer h-10 rounded-xl" />

                  <div className="skeleton-shimmer h-10 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7 border-t pt-6">
          <h3 className="text-sm font-semibold">Jóvenes del barrio</h3>

          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border p-4"
              >
                <div className="skeleton-shimmer size-10 rounded-full" />

                <div className="flex-1 space-y-2">
                  <div className="skeleton-shimmer h-4 w-36 rounded-lg" />

                  <div className="skeleton-shimmer h-3 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
