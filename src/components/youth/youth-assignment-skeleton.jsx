import BrandLogo from "../brand-logo";

export default function YouthAssignmentSkeleton() {
    return (
        <section className="mx-auto w-full max-w-xl">
            <BrandLogo />

            <div className="mt-8">
                <div className="relative h-4 w-20 overflow-hidden rounded bg-gray-200">
                    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-100/90 to-transparent" />
                </div>

                <div className="relative mt-4 h-8 w-40 overflow-hidden rounded bg-gray-200">
                    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-100/90 to-transparent" />
                </div>

                <div className="mt-8 rounded-2xl border bg-white p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="relative h-3 w-24 overflow-hidden rounded bg-gray-200">
                                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-100/90 to-transparent" />
                            </div>

                            <div className="relative mt-3 h-5 w-44 overflow-hidden rounded bg-gray-200">
                                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-100/90 to-transparent" />
                            </div>
                        </div>

                        <div className="relative h-6 w-20 overflow-hidden rounded-full bg-gray-200">
                            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-100/90 to-transparent" />
                        </div>
                    </div>

                    <div className="my-5 border-t" />

                    <div className="relative h-3 w-24 overflow-hidden rounded bg-gray-200">
                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-100/90 to-transparent" />
                    </div>

                    <div className="relative mt-3 h-6 w-28 overflow-hidden rounded bg-gray-200">
                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-100/90 to-transparent" />
                    </div>

                    <div className="mt-6 flex gap-3">
                        <div className="relative h-11 flex-1 overflow-hidden rounded-xl bg-gray-200">
                            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-100/90 to-transparent" />
                        </div>

                        <div className="relative h-11 flex-1 overflow-hidden rounded-xl bg-gray-200">
                            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-100/90 to-transparent" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}