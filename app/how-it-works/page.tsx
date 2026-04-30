export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h1 className="text-3xl font-bold">How it works</h1>
        <ol className="mt-4 list-decimal space-y-3 pl-6 text-slate-200">
          <li>Brands publish campaigns with budget, niche, deliverables, and deadline.</li>
          <li>Creators set profile, add portfolio, and apply with a pitch.</li>
          <li>Brand accepts or rejects applicants.</li>
          <li>Deal flow is strict: Pending to Active to Submitted to Completed.</li>
          <li>Escrow is funded on Active and creator payout is released on Completed with 15% commission.</li>
        </ol>
      </div>
    </main>
  );
}
