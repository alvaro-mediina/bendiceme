export default function AdvisorTeamSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Resumen del equipo */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="h-5 w-32 rounded-lg bg-gray-200" />

        <div className="mt-5 space-y-4">
          <div>
            <div className="h-4 w-20 rounded bg-gray-200" />

            <div className="mt-2 h-4 w-40 rounded bg-gray-200" />
          </div>

          <div>
            <div className="h-4 w-20 rounded bg-gray-200" />

            <div className="mt-2 h-4 w-48 rounded bg-gray-200" />
          </div>

          <div className="flex gap-2">
            <div className="h-7 w-24 rounded-full bg-gray-200" />
            <div className="h-7 w-24 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>

      {/* Lista de jóvenes */}
      <div>
        <div className="h-4 w-28 rounded bg-gray-200" />

        <div className="mt-3 flex flex-col gap-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="h-5 w-36 rounded bg-gray-200" />

                  <div className="mt-2 h-4 w-20 rounded bg-gray-200" />
                </div>

                <div className="size-5 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
