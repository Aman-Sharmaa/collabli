"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Campaign = {
  _id: string;
  title: string;
  budget: number;
  niche: string;
  deliverables: string;
  deadline: string;
  platforms?: string[];
  location?: string;
  bookmarked?: boolean;
  listingType?: "brand_hiring" | "creator_seeking";
};

type BrandRow = {
  userId: string;
  companyName: string;
  publicHandle: string;
  industry: string;
  location: string;
};

export default function OpportunitiesPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("");
  const [location, setLocation] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [brandQuery, setBrandQuery] = useState("");
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [msg, setMsg] = useState("");
  const [listingOpen, setListingOpen] = useState(false);
  const [listing, setListing] = useState({
    title: "",
    budget: "",
    niche: "",
    deliverables: "",
    deadline: "",
    platforms: "",
    location: "",
  });

  async function loadCampaigns() {
    const qs = new URLSearchParams();
    if (niche) qs.set("niche", niche);
    if (platform) qs.set("platform", platform);
    if (location) qs.set("location", location);
    if (budgetMin) qs.set("budgetMin", budgetMin);
    if (budgetMax) qs.set("budgetMax", budgetMax);
    const res = await fetch(`/api/collabli/campaigns?${qs.toString()}`);
    const data = await res.json();
    setCampaigns(data.campaigns || []);
  }

  useEffect(() => {
    void loadCampaigns();
  }, []);

  async function searchBrands() {
    const res = await fetch(`/api/collabli/creator/brand-search?q=${encodeURIComponent(brandQuery)}`);
    const data = await res.json();
    setBrands(data.brands || []);
  }

  async function toggleBookmark(id: string, bookmarked: boolean) {
    await fetch(`/api/collabli/campaigns/${id}/bookmark`, { method: bookmarked ? "DELETE" : "POST" });
    void loadCampaigns();
  }

  async function submitListing() {
    setMsg("");
    const res = await fetch("/api/collabli/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: listing.title,
        budget: Number(listing.budget),
        niche: listing.niche,
        deliverables: listing.deliverables,
        deadline: listing.deadline,
        platforms: listing.platforms,
        location: listing.location,
      }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.message || "Could not post listing");
    setListingOpen(false);
    setListing({ title: "", budget: "", niche: "", deliverables: "", deadline: "", platforms: "", location: "" });
    setMsg("Your availability listing is live.");
    void loadCampaigns();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Browse campaigns</h1>
        <p className="mt-1 text-sm text-neutral-600">Filter open briefs, save bookmarks, and apply with the guided application flow.</p>
      </div>

      <Card className="border-neutral-200">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <div>
            <CardTitle className="text-base">Post availability</CardTitle>
            <CardDescription>Creators: list what you offer so brands can reach out.</CardDescription>
          </div>
          <Button type="button" variant="secondary" className="rounded-xl" onClick={() => setListingOpen((o) => !o)}>
            {listingOpen ? "Close" : "New listing"}
          </Button>
        </CardHeader>
        {listingOpen ? (
          <CardContent className="grid gap-3 border-t border-neutral-100 pt-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input className="rounded-xl" value={listing.title} onChange={(e) => setListing((s) => ({ ...s, title: e.target.value }))} placeholder="e.g. UGC + edits for beauty brands" />
            </div>
            <div className="space-y-1">
              <Label>Expected budget ($)</Label>
              <Input className="rounded-xl" type="number" value={listing.budget} onChange={(e) => setListing((s) => ({ ...s, budget: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Niche</Label>
              <Input className="rounded-xl" value={listing.niche} onChange={(e) => setListing((s) => ({ ...s, niche: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Deadline</Label>
              <Input className="rounded-xl" type="date" value={listing.deadline} onChange={(e) => setListing((s) => ({ ...s, deadline: e.target.value }))} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Deliverables</Label>
              <Textarea className="rounded-xl" rows={3} value={listing.deliverables} onChange={(e) => setListing((s) => ({ ...s, deliverables: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Platforms (comma-separated)</Label>
              <Input className="rounded-xl" value={listing.platforms} onChange={(e) => setListing((s) => ({ ...s, platforms: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Location</Label>
              <Input className="rounded-xl" value={listing.location} onChange={(e) => setListing((s) => ({ ...s, location: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Button type="button" className="rounded-xl bg-yellow-400 font-semibold text-black hover:bg-yellow-500" onClick={() => void submitListing()}>
                Publish listing
              </Button>
            </div>
          </CardContent>
        ) : null}
      </Card>

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-base">Search brands</CardTitle>
          <CardDescription>Find companies by name, industry, or @handle.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={brandQuery}
            onChange={(e) => setBrandQuery(e.target.value)}
            placeholder="Try a brand name…"
            className="max-w-md rounded-xl"
          />
          <Button type="button" variant="secondary" className="rounded-xl" onClick={() => void searchBrands()}>
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
        </CardContent>
        {brands.length > 0 ? (
          <CardContent className="border-t border-neutral-100 pt-4">
            <ul className="space-y-2 text-sm">
              {brands.map((b) => (
                <li key={b.userId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2">
                  <span className="font-medium">{b.companyName}</span>
                  {b.publicHandle ? (
                    <a href={`/u/${b.publicHandle}`} target="_blank" rel="noreferrer" className="text-yellow-700 hover:underline">
                      @{b.publicHandle}
                    </a>
                  ) : null}
                  <span className="text-neutral-500">{b.industry} · {b.location || "—"}</span>
                  <Button type="button" size="sm" variant="outline" className="rounded-lg text-xs" asChild>
                    <a href={`/dashboard/messages?to=${encodeURIComponent(b.userId)}`}>Message</a>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        ) : null}
      </Card>

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input placeholder="Niche" value={niche} onChange={(e) => setNiche(e.target.value)} className="rounded-xl" />
          <Input placeholder="Platform" value={platform} onChange={(e) => setPlatform(e.target.value)} className="rounded-xl" />
          <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-xl" />
          <Input placeholder="Min budget" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} className="rounded-xl" />
          <Input placeholder="Max budget" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} className="rounded-xl" />
        </CardContent>
        <CardContent>
          <Button className="rounded-xl bg-black text-white hover:bg-neutral-800" onClick={() => void loadCampaigns()}>
            Apply filters
          </Button>
        </CardContent>
      </Card>

      {msg ? <p className="text-sm text-emerald-600">{msg}</p> : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((c) => (
          <Card key={c._id} className="border-neutral-200 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
              <div>
                <CardTitle className="text-lg">{c.title}</CardTitle>
                <CardDescription>
                  <span className="mr-2 inline-block rounded-md bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-neutral-700">
                    {c.listingType === "creator_seeking" ? "Creator listing" : "Brand brief"}
                  </span>
                  {c.niche} · ${Number(c.budget).toLocaleString()} · {new Date(c.deadline).toLocaleDateString()}
                </CardDescription>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="shrink-0 rounded-xl"
                aria-label="Bookmark"
                onClick={() => void toggleBookmark(c._id, !!c.bookmarked)}
              >
                <Bookmark className={c.bookmarked ? "h-5 w-5 fill-yellow-400 text-yellow-600" : "h-5 w-5"} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-neutral-600">
              <p className="line-clamp-3">{c.deliverables}</p>
              <p className="text-xs text-neutral-500">
                {(c.platforms || []).join(", ") || "Any platform"} · {c.location || "Location open"}
              </p>
              <div className="flex gap-2">
                {c.listingType === "creator_seeking" ? (
                  <p className="flex-1 text-xs text-neutral-500">This is another creator&apos;s listing — browse brand briefs to apply.</p>
                ) : (
                  <Button className="flex-1 rounded-xl bg-yellow-400 font-semibold text-black hover:bg-yellow-500" asChild>
                    <Link href={`/dashboard/apply/${c._id}`}>Apply</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
