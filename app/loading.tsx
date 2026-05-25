export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <header className="border-b border-[#d8dee8] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="h-8 w-32 animate-pulse rounded-md bg-[#d8dee8]" />
          <div className="hidden gap-2 sm:flex">
            <div className="h-10 w-24 animate-pulse rounded-md bg-[#d8dee8]" />
            <div className="h-10 w-24 animate-pulse rounded-md bg-[#d8dee8]" />
            <div className="h-10 w-24 animate-pulse rounded-md bg-[#d8dee8]" />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <div className="h-9 w-52 animate-pulse rounded-md bg-[#d8dee8]" />
          <div className="mt-3 h-5 w-full max-w-xl animate-pulse rounded-md bg-[#e5eaf1]" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-28 animate-pulse rounded-lg border border-[#d8dee8] bg-white" />
          <div className="h-28 animate-pulse rounded-lg border border-[#d8dee8] bg-white" />
          <div className="h-28 animate-pulse rounded-lg border border-[#d8dee8] bg-white" />
        </div>

        <div className="mt-6 grid gap-3">
          <div className="h-16 animate-pulse rounded-lg border border-[#d8dee8] bg-white" />
          <div className="h-16 animate-pulse rounded-lg border border-[#d8dee8] bg-white" />
          <div className="h-16 animate-pulse rounded-lg border border-[#d8dee8] bg-white" />
        </div>
      </section>
    </main>
  );
}
