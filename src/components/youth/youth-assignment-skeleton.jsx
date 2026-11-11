export default function YouthAssignmentSkeleton() {
    return (
        <section
            role="status"
            aria-label="Cargando tus turnos"
            aria-busy="true"
            className="mx-auto w-full max-w-xl"
        >
            <header className="mt-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                    Mis turnos
                </p>
                <div aria-hidden="true" className="mt-6 h-5 w-16 rounded skeleton-shimmer" />
                <div aria-hidden="true" className="mt-3 h-9 w-48 max-w-full rounded skeleton-shimmer" />
            </header>

            <div aria-hidden="true">
                <div className="mt-6 rounded-2xl border bg-white p-4 shadow-sm sm:mt-8 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <div className="relative h-3 w-24 overflow-hidden rounded skeleton-shimmer">
                            </div>

                            <div className="relative mt-2 h-7 w-44 max-w-full overflow-hidden rounded skeleton-shimmer">
                            </div>
                        </div>

                        <div className="relative h-6 w-20 shrink-0 overflow-hidden rounded-full skeleton-shimmer">
                        </div>
                    </div>

                    <div className="my-5 border-t" />

                    <div className="relative h-3 w-24 overflow-hidden rounded skeleton-shimmer">
                    </div>

                    <div className="relative mt-3 h-6 w-28 overflow-hidden rounded skeleton-shimmer">
                    </div>

                    <div className="mt-6 flex gap-3">
                        <div className="relative h-11 flex-1 overflow-hidden rounded-xl skeleton-shimmer">
                        </div>

                        <div className="relative h-11 flex-1 overflow-hidden rounded-xl skeleton-shimmer">
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}