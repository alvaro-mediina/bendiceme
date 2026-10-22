export default function YouthSelectorSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-3">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="
            flex w-full
            items-center justify-between
            rounded-2xl border
            bg-white p-4
          "
        >
          <div className="min-w-0 flex-1">
            <div className="h-5 w-40 rounded-lg bg-gray-200" />

            <div className="mt-2 h-4 w-20 rounded-lg bg-gray-200" />
          </div>

          <div className="ml-4 size-5 rounded-md bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
