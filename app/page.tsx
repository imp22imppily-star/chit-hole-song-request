import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-xl place-items-center text-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#d8ad24]">
            CHIT HOLE
          </p>
          <h1 className="mt-4 text-4xl font-black">Song Request</h1>
          <div className="mt-8 grid gap-3">
            <Link
              href="/request?table=1"
              className="rounded-md bg-[#d8ad24] px-5 py-4 text-lg font-black text-black"
            >
              หน้าลูกค้าขอเพลง
            </Link>
            <Link
              href="/musician"
              className="rounded-md border border-[#d8ad24]/40 px-5 py-4 text-lg font-black text-[#d8ad24]"
            >
              หน้าจอนักดนตรี
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
