"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MarketingFooter } from "@/components/collabli/marketing-footer";
import { MarketingHeader } from "@/components/collabli/marketing-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type CreatorRow = {
  _id: string;
  niche?: string;
  location?: string;
  rate?: number;
  audienceSize?: number;
  handle?: string;
  user?: { name?: string; avatarUrl?: string; publicHandle?: string };
};

export default function CreatorDirectoryPage() {
  const [creators, setCreators] = useState<CreatorRow[]>([]);
  const [niche, setNiche] = useState("");
  const [location, setLocation] = useState("");
  const [platform, setPlatform] = useState("");
  const [rateMin, setRateMin] = useState("");
  const [rateMax, setRateMax] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (niche) params.set("niche", niche);
    if (location) params.set("location", location);
    if (platform) params.set("platform", platform);
    if (rateMin) params.set("rateMin", rateMin);
    if (rateMax) params.set("rateMax", rateMax);
    const res = await fetch(`/api/collabli/creator-directory?${params.toString()}`);
    const data = await res.json();
    setCreators(data.creators || []);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <MarketingHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Creators</h1>
        <p className="mt-2 max-w-2xl text-neutral-600">
          Approved creators with a public profile. Filter by niche, location, typical campaign rate, or platform.
        </p>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-600">Niche</Label>
              <Input
                placeholder="e.g. fitness"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="h-10 rounded-xl border-neutral-200 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-600">Location</Label>
              <Input
                placeholder="City or country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-10 rounded-xl border-neutral-200 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-600">Platform</Label>
              <Input
                placeholder="TikTok, YouTube…"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="h-10 rounded-xl border-neutral-200 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-600">Min rate ($)</Label>
              <Input
                type="number"
                placeholder="0"
                value={rateMin}
                onChange={(e) => setRateMin(e.target.value)}
                className="h-10 rounded-xl border-neutral-200 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-600">Max rate ($)</Label>
              <Input
                type="number"
                placeholder="No max"
                value={rateMax}
                onChange={(e) => setRateMax(e.target.value)}
                className="h-10 rounded-xl border-neutral-200 bg-white"
              />
            </div>
          </div>
          <Button type="button" onClick={() => void load()} className="mt-5 h-10 rounded-xl bg-black text-white hover:bg-neutral-800">
            Apply filters
          </Button>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {creators.length === 0 ? (
            <p className="col-span-full text-sm text-neutral-500">
              No matching creators. Try broader filters — profiles appear after admin approval and setting a public @username.
            </p>
          ) : (
            creators.map((c) => {
              const handle = c.handle || c.user?.publicHandle;
              const href = handle ? `/u/${handle}` : "#";
              return (
                <Link
                  key={String(c._id)}
                  href={href}
                  className={`rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-yellow-300 hover:shadow-md ${!handle ? "pointer-events-none opacity-60" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 text-lg font-bold text-neutral-500">
                      {c.user?.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.user.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (c.user?.name || "C")[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-neutral-900">{c.user?.name || "Creator"}</p>
                      {handle ? (
                        <p className="text-sm text-yellow-700">@{handle}</p>
                      ) : (
                        <p className="text-xs text-neutral-400">No public handle</p>
                      )}
                      <p className="mt-1 text-sm text-neutral-600">{c.niche || "Creator"}</p>
                      {c.location ? <p className="text-xs text-neutral-500">{c.location}</p> : null}
                      <p className="text-xs text-neutral-500">
                        Audience {Number(c.audienceSize || 0).toLocaleString()}
                        {c.rate != null && Number(c.rate) > 0 ? ` · from $${Number(c.rate).toLocaleString()}` : ""}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
