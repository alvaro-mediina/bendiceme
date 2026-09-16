import BrandLogo from "../brand-logo";

function Shimmer() {
    return (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-100/90 to-transparent" />
    );
}

export default function AdvisorViewSkeleton() {
    return (
        <section className="mx-auto w-full max-w-2xl">
            <BrandLogo />

            <div className="mt-8">
                <div className="relative h-3 w-40 overflow-hidden rounded bg-gray-200">
                    <Shimmer />
                </div>

                <div className="relative mt-5 h-8 w-56 overflow-hidden rounded bg-gray-200">
                    <Shimmer />
                </div>

                <div className="relative mt-3 h-4 w-80 max-w-full overflow-hidden rounded bg-gray-200">
                    <Shimmer />
                </div>

                <div className="mt-8 flex gap-2 overflow-hidden">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="relative h-11 w-40 shrink-0 overflow-hidden rounded-xl bg-gray-200"
                        >
                            <Shimmer />
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <div className="relative h-6 w-44 overflow-hidden rounded bg-gray-200">
                        <Shimmer />
                    </div>

                    <div className="mt-4 flex flex-col gap-3">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="relative h-[110px] overflow-hidden rounded-2xl border bg-gray-100"
                            >
                                <Shimmer />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 rounded-2xl border bg-white p-4 sm:p-5">
                    <div className="relative h-5 w-28 overflow-hidden rounded bg-gray-200">
                        <Shimmer />
                    </div>

                    <div className="mt-5 flex flex-col gap-4">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="flex items-center justify-between"
                            >
                                <div className="relative h-4 w-24 overflow-hidden rounded bg-gray-200">
                                    <Shimmer />
                                </div>

                                <div className="relative h-4 w-10 overflow-hidden rounded bg-gray-200">
                                    <Shimmer />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}