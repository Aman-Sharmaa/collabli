import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 opacity-20 [background-image:repeating-linear-gradient(90deg,transparent,transparent_120px,rgba(255,255,255,0.06)_120px,rgba(255,255,255,0.06)_180px)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(250,204,21,0.24),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(250,204,21,0.12),transparent_35%)]" />

      <section className="relative mx-auto max-w-7xl p-6 md:p-12">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.3em] text-yellow-300">Influencer web platform</p>
          <h1 className="mt-3 text-6xl font-black leading-none tracking-tight md:text-8xl">CREATE</h1>
          <p className="mt-4 max-w-2xl text-neutral-300">Leading campaign marketplace for brands and creators. Build trust with status-based deals and escrow-first payments.</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-lg bg-yellow-400 px-5 py-3 text-sm font-bold text-black">Brand / Creator Login</Link>
            <Link href="/signup" className="rounded-lg border border-neutral-700 px-5 py-3 text-sm text-neutral-200">Free Sign Up</Link>
            <Link href="/creators" className="rounded-lg border border-neutral-700 px-5 py-3 text-sm text-neutral-200">Top creators</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
