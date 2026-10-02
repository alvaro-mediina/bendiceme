export default function DateOptionSkeleton() {
    return (
        <div
            className="
                relative flex h-20 w-full
                items-center justify-between
                overflow-hidden rounded-2xl border
                bg-gray-100 px-4
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

            <div className="space-y-2">
                <div className="h-4 w-40 rounded-md bg-gray-300" />
                <div className="h-3 w-24 rounded-md bg-gray-300" />
            </div>

            <div className="size-5 rounded-full bg-gray-300" />
        </div>
    );
}