export default function YouthSelectorSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="
                        relative flex min-h-[82px] w-full
                        overflow-hidden rounded-2xl border
                        bg-gray-100 p-4
                    "
                >
                    <div
                        className="
                            absolute inset-0
                            -translate-x-full
                            animate-shimmer
                            bg-gradient-to-r
                            from-transparent
                            via-gray-200/80
                            to-transparent
                        "
                    />

                    <div className="flex-1">
                        <div className="h-5 w-36 rounded-md bg-gray-300" />
                        <div className="mt-2 h-6 w-20 rounded-full bg-gray-300" />
                    </div>

                    <div className="my-auto size-5 rounded-md bg-muted" />
                </div>
            ))}
        </div>
    );
}