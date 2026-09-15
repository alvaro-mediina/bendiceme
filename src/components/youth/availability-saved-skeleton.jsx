import BrandLogo from "../brand-logo";

export default function AvailabilitySavedSkeleton() {
    const Shimmer = () => (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-100/90 to-transparent" />
    );

    return (
        <section className="mx-auto w-full max-w-xl">
            <BrandLogo />

            <div className="mt-8">
                <div className="relative h-4 w-40 overflow-hidden rounded bg-gray-200">
                    <Shimmer />
                </div>

                <div className="relative mt-6 size-12 overflow-hidden rounded-full bg-gray-200">
                    <Shimmer />
                </div>

                <div className="relative mt-6 h-3 w-44 overflow-hidden rounded bg-gray-200">
                    <Shimmer />
                </div>

                <div className="relative mt-4 h-8 w-48 overflow-hidden rounded bg-gray-200">
                    <Shimmer />
                </div>

                <div className="relative mt-3 h-4 w-72 max-w-full overflow-hidden rounded bg-gray-200">
                    <Shimmer />
                </div>

                <div className="mt-8 rounded-2xl border bg-white p-4 sm:p-5">
                    <div className="relative h-4 w-40 overflow-hidden rounded bg-gray-200">
                        <Shimmer />
                    </div>

                    <div className="mt-5 flex flex-col gap-3">
                        {[1, 2].map((item) => (
                            <div
                                key={item}
                                className="flex items-center gap-3"
                            >
                                <div className="relative size-8 overflow-hidden rounded-full bg-gray-200">
                                    <Shimmer />
                                </div>

                                <div className="relative h-4 w-44 overflow-hidden rounded bg-gray-200">
                                    <Shimmer />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative mt-8 h-12 overflow-hidden rounded-xl bg-gray-200">
                    <Shimmer />
                </div>

                <div className="relative mt-2 h-11 overflow-hidden rounded-xl bg-gray-200">
                    <Shimmer />
                </div>
            </div>
        </section>
    );
}