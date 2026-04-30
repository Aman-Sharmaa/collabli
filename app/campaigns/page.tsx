"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MarketingFooter } from "@/components/collabli/marketing-footer";
import { MarketingHeader } from "@/components/collabli/marketing-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Campaign = {
  _id: string;
  title: string;
  budget: number;
  niche: string;
  deliverables: string;
  deadline: string;
  platforms?: string[];
  location?: string;
  listingType?: "brand_hiring" | "creator_seeking";
};

export default function PublicCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [niche, setNiche] = useState("");
  const [location, setLocation] = useState("");
  const [platform, setPlatform] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [listingType, setListingType] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (niche) params.set("niche", niche);
    if (location) params.set("location", location);
    if (platform) params.set("platform", platform);
    if (budgetMin) params.set("budgetMin", budgetMin);
    if (budgetMax) params.set("budgetMax", budgetMax);
    if (listingType) params.set("listingType", listingType);
    const res = await fetch(`/api/collabli/campaigns?${params.toString()}`);
    const data = await res.json();
    setCampaigns(data.campaigns || []);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <MarketingHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Open campaigns</h1>
        <p className="mt-2 max-w-2xl text-neutral-600">
          Browse brand briefs and creator availability listings. Filter by niche, location, budget, and type — no account required to explore.
        </p>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-600">Niche</Label>
              <Input
                placeholder="e.g. beauty, tech"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="h-10 rounded-xl border-neutral-200 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-600">Location</Label>
              <Input
                placeholder="City or region"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-10 rounded-xl border-neutral-200 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-600">Platform</Label>
              <Input
                placeholder="TikTok, Instagram…"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="h-10 rounded-xl border-neutral-200 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-600">Min budget ($)</Label>
              <Input
                type="number"
                placeholder="0"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="h-10 rounded-xl border-neutral-200 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-600">Max budget ($)</Label>
              <Input
                type="number"
                placeholder="No max"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="h-10 rounded-xl border-neutral-200 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-600">Listing type</Label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm"
              >
                <option value="">All</option>
                <option value="brand_hiring">Brand hiring</option>
                <option value="creator_seeking">Creator available</option>
              </select>
            </div>
          </div>
          <Button type="button" onClick={() => void load()} className="mt-5 h-10 rounded-xl bg-black text-white hover:bg-neutral-800">
            Apply filters
          </Button>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.length === 0 ? (
            <p className="col-span-full text-sm text-neutral-500">No open campaigns match these filters.</p>
          ) : (
            campaigns.map((c) => (
              <Link
                key={c._id}
                href={`/campaigns/${c._id}`}
                className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-yellow-300 hover:shadow-md"
              >
                <span className="text-[10px] font-bold uppercase tracking-wide text-yellow-700">
                  {c.listingType === "creator_seeking" ? "Creator listing" : "Brand brief"}
                </span>
                <h2 className="mt-1 text-lg font-semibold text-neutral-900">{c.title}</h2>
                <p className="mt-1 text-sm text-neutral-600">
                  {c.niche} · ${Number(c.budget).toLocaleString()} · {new Date(c.deadline).toLocaleDateString()}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-neutral-500">{c.deliverables}</p>
                <p className="mt-3 text-xs text-neutral-400">
                  {(c.platforms || []).join(", ") || "Any platform"}
                  {c.location ? ` · ${c.location}` : ""}
                </p>
              </Link>
            ))
          )}
        </div>

        <p className="mt-10 text-center text-sm text-neutral-500">
          Ready to collaborate?{" "}
          <Link href="/signup" className="font-medium text-yellow-700 hover:underline">
            Join Collabli
          </Link>
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
