export default function AdvisorViewSkeleton() {
  return (
    <section className="mx-auto w-full max-w-5xl px-1">
      <div className="animate-pulse">
        <div className="h-3 w-24 rounded-full bg-gray-200" />

        <div className="mt-3 h-9 w-40 rounded-xl bg-gray-200" />

        <div className="mt-3 h-4 w-32 rounded-full bg-gray-200" />

        <div className="mt-8 h-[300px] w-full rounded-[28px] bg-gray-200" />

        <div className="mt-8 h-5 w-32 rounded-lg bg-gray-200" />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="h-36 rounded-[24px] bg-gray-200" />
          <div className="h-36 rounded-[24px] bg-gray-200" />
        </div>
      </div>

      <div
        className="
          fixed bottom-4 left-1/2
          h-16 w-[calc(100%-2rem)]
          max-w-md
          -translate-x-1/2
          animate-pulse
          rounded-[24px]
          bg-gray-200
        "
      />
    </section>
  );
}
