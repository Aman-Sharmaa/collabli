"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Campaign = {
  _id: string;
  title: string;
  budget: number;
  niche: string;
  deliverables?: string;
  deadline: string;
  listingType?: "brand_hiring" | "creator_seeking";
};

export default function CampaignBoardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [niche, setNiche] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [applyId, setApplyId] = useState<string | null>(null);
  const [pitch, setPitch] = useState("");
  const [msg, setMsg] = useState("");
  const [briefOpen, setBriefOpen] = useState(false);
  const [brief, setBrief] = useState({
    title: "",
    budget: "",
    niche: "",
    deliverables: "",
    deadline: "",
    platforms: "",
    location: "",
  });

  async function load() {
    const qs = new URLSearchParams({ niche });
    const res = await fetch(`/api/collabli/campaigns?${qs.toString()}`);
    const data = await res.json();
    setCampaigns(data.campaigns || []);
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/collabli/auth/me");
      const data = await res.json();
      if (data.user?.role) setRole(data.user.role);
    })();
  }, []);

  async function submitBrief() {
    setMsg("");
    const res = await fetch("/api/collabli/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: brief.title,
        budget: Number(brief.budget),
        niche: brief.niche,
        deliverables: brief.deliverables,
        deadline: brief.deadline,
        platforms: brief.platforms,
        location: brief.location,
      }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.message || "Could not create campaign");
    setBriefOpen(false);
    setBrief({ title: "", budget: "", niche: "", deliverables: "", deadline: "", platforms: "", location: "" });
    setMsg("Campaign published.");
    void load();
  }

  async function submitReachOut() {
    if (!applyId) return;
    setMsg("");
    const res = await fetch(`/api/collabli/campaigns/${applyId}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pitch }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.message || "Failed");
    setApplyId(null);
    setPitch("");
    setMsg("Your message was sent to the creator.");
    void load();
  }

  return (
    <main className="space-y-4">
      <header className="flex flex-col gap-3 rounded-2xl border border-yellow-400/20 bg-black p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Campaign Board</h1>
          <p className="mt-1 text-sm text-neutral-300">Discover brand briefs and creators who are open for work.</p>
        </div>
        {role === "brand" ? (
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl bg-yellow-400 font-semibold text-black hover:bg-yellow-500"
            onClick={() => setBriefOpen((o) => !o)}
          >
            {briefOpen ? "Close" : "Post a brief"}
          </Button>
        ) : null}
      </header>

      {role === "brand" && briefOpen ? (
        <section className="grid gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-neutral-400">Title</Label>
            <Input
              className="rounded-xl border-neutral-700 bg-black text-white"
              value={brief.title}
              onChange={(e) => setBrief((s) => ({ ...s, title: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-neutral-400">Budget ($)</Label>
            <Input
              type="number"
              className="rounded-xl border-neutral-700 bg-black text-white"
              value={brief.budget}
              onChange={(e) => setBrief((s) => ({ ...s, budget: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-neutral-400">Niche</Label>
            <Input
              className="rounded-xl border-neutral-700 bg-black text-white"
              value={brief.niche}
              onChange={(e) => setBrief((s) => ({ ...s, niche: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-neutral-400">Deadline</Label>
            <Input
              type="date"
              className="rounded-xl border-neutral-700 bg-black text-white"
              value={brief.deadline}
              onChange={(e) => setBrief((s) => ({ ...s, deadline: e.target.value }))}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-neutral-400">Deliverables</Label>
            <Textarea
              className="rounded-xl border-neutral-700 bg-black text-white"
              rows={3}
              value={brief.deliverables}
              onChange={(e) => setBrief((s) => ({ ...s, deliverables: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-neutral-400">Platforms</Label>
            <Input
              className="rounded-xl border-neutral-700 bg-black text-white"
              value={brief.platforms}
              onChange={(e) => setBrief((s) => ({ ...s, platforms: e.target.value }))}
              placeholder="TikTok, IG…"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-neutral-400">Location</Label>
            <Input
              className="rounded-xl border-neutral-700 bg-black text-white"
              value={brief.location}
              onChange={(e) => setBrief((s) => ({ ...s, location: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="button" className="rounded-xl bg-yellow-400 font-semibold text-black hover:bg-yellow-500" onClick={() => void submitBrief()}>
              Publish brief
            </Button>
          </div>
        </section>
      ) : null}

      {msg ? <p className="text-sm text-emerald-400">{msg}</p> : null}

      <div className="flex gap-2">
        <input
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="Filter by niche"
          className="w-full rounded-xl border border-neutral-700 bg-black px-3 py-2 text-sm text-white"
        />
        <button type="button" onClick={() => void load()} className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-black">
          Filter
        </button>
      </div>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((c) => {
          const isCreatorListing = c.listingType === "creator_seeking";
          const showReachOut = role === "brand" && isCreatorListing;
          return (
            <article key={c._id} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-yellow-500">
                {isCreatorListing ? "Creator · open for work" : "Brand · hiring"}
              </p>
              <h2 className="font-bold text-white">{c.title}</h2>
              <p className="text-xs text-neutral-400">
                {c.niche} • Budget {c.budget}
              </p>
              <p className="mt-2 text-xs text-neutral-500">Deadline: {new Date(c.deadline).toLocaleDateString()}</p>
              {c.deliverables ? <p className="mt-2 line-clamp-3 text-xs text-neutral-400">{c.deliverables}</p> : null}
              {showReachOut ? (
                <Button
                  type="button"
                  className="mt-3 w-full rounded-xl bg-yellow-400 font-semibold text-black hover:bg-yellow-500"
                  onClick={() => setApplyId(c._id)}
                >
                  Reach out
                </Button>
              ) : null}
            </article>
          );
        })}
      </section>

      <Dialog open={!!applyId} onOpenChange={(o) => !o && setApplyId(null)}>
        <DialogContent className="rounded-2xl border-neutral-800 bg-neutral-950 text-white">
          <DialogHeader>
            <DialogTitle>Reach out to creator</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-neutral-300">Intro & pitch</Label>
            <Textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              rows={5}
              className="rounded-xl border-neutral-700 bg-black text-white"
              placeholder="Who you are, what you need, budget/timeline…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl border-neutral-600" onClick={() => setApplyId(null)}>
              Cancel
            </Button>
            <Button className="rounded-xl bg-yellow-400 text-black hover:bg-yellow-500" onClick={() => void submitReachOut()}>
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
