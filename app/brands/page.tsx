"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MarketingFooter } from "@/components/collabli/marketing-footer";
import { MarketingHeader } from "@/components/collabli/marketing-header";

type Brand = { handle: string; name: string; industry: string; location: string; avatarUrl: string };

export default function BrandsDirectoryPage() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    void fetch("/api/collabli/public/directory")
      .then((r) => r.json())
      .then((d) => setBrands(d.brands || []));
  }, []);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <MarketingHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
        <p className="mt-2 text-neutral-600">Discover partner brands with public Collabli profiles.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {brands.length === 0 ? (
            <p className="col-span-full text-sm text-neutral-500">No brands published yet.</p>
          ) : (
            brands.map((b) => (
              <Link
                key={b.handle}
                href={`/u/${b.handle}`}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-yellow-300 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-neutral-900 text-yellow-400">
                    {b.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      b.name[0]?.toUpperCase() || "B"
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{b.name}</p>
                    <p className="text-sm text-yellow-700">@{b.handle}</p>
                    <p className="text-xs text-neutral-500">{b.industry} · {b.location || "—"}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
