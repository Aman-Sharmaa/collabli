"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const STEPS = ["Profile", "Why you", "Your rate", "Content plan", "Audience", "Agreement"] as const;

type CampaignBrief = {
  _id: string;
  title: string;
  deliverables: string;
  deadline: string;
  niche: string;
  budget: number;
  platforms: string[];
  location: string;
};

type ContentPlanRow = { contentIdea: string; platform: string; format: "Reel" | "Story" | "Post" | "Video" };

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2 text-sm text-neutral-900">{value}</p>
    </div>
  );
}

export default function ApplyWizardPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = String(params?.campaignId ?? "");

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [campaign, setCampaign] = useState<CampaignBrief | null>(null);

  const [profileEngagementPct, setProfileEngagementPct] = useState<string>("");
  const [profileDisplay, setProfileDisplay] = useState({
    displayName: "",
    publicHandle: "",
    platforms: [] as string[],
    niche: "",
  });

  const [pitch, setPitch] = useState("");
  const [pastSimilarWork, setPastSimilarWork] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");

  const [campaignRateInr, setCampaignRateInr] = useState("");
  const [rateKind, setRateKind] = useState<"fixed" | "negotiable" | "">("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");

  const [contentPlans, setContentPlans] = useState<ContentPlanRow[]>([
    { contentIdea: "", platform: "", format: "Reel" },
  ]);

  const [audience, setAudience] = useState({
    followers: "",
    views: "",
    engagementRatePct: "",
    location: "",
    ageRange: "",
    gender: "",
  });

  const [deadlineConfirmed, setDeadlineConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadPrefill = useCallback(async () => {
    setLoading(true);
    setErr("");
    const res = await fetch(`/api/collabli/campaigns/${campaignId}/apply-prefill`);
    const data = await res.json();
    if (!res.ok) {
      setErr(data.message || "Could not load application");
      setLoading(false);
      return;
    }
    setCampaign(data.campaign);
    const ps = data.profileSummary || {};
    setProfileDisplay({
      displayName: ps.displayName || "",
      publicHandle: ps.publicHandle || "",
      platforms: ps.platforms || [],
      niche: ps.niche || "",
    });
    if (ps.engagementRatePct != null && ps.engagementRatePct !== "") {
      setProfileEngagementPct(String(ps.engagementRatePct));
    }
    const ad = data.audienceDefaults || {};
    setAudience({
      followers: ad.followers != null ? String(ad.followers) : "",
      views: ad.views != null ? String(ad.views) : "",
      engagementRatePct: ad.engagementRatePct != null ? String(ad.engagementRatePct) : "",
      location: ad.location || "",
      ageRange: ad.ageRange || "",
      gender: ad.gender || "",
    });
    setLoading(false);
  }, [campaignId]);

  useEffect(() => {
    void loadPrefill();
  }, [loadPrefill]);

  function updatePlan(idx: number, patch: Partial<ContentPlanRow>) {
    setContentPlans((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function addPlan() {
    setContentPlans((rows) => [...rows, { contentIdea: "", platform: "", format: "Reel" }]);
  }

  function removePlan(idx: number) {
    setContentPlans((rows) => rows.filter((_, i) => i !== idx));
  }

  function validateStep(i: number): string | null {
    if (i === 0) {
      if (profileEngagementPct !== "") {
        const n = Number(profileEngagementPct);
        if (!Number.isFinite(n) || n < 0 || n > 100) return "Engagement rate must be between 0 and 100";
      }
      return null;
    }
    if (i === 1) {
      if (pitch.trim().length < 20) return "Pitch should be at least 20 characters";
      if (pastSimilarWork.trim().length < 20) return "Past similar work should be at least 20 characters";
      if (portfolioLink.trim() && !/^https?:\/\//i.test(portfolioLink.trim())) return "Portfolio link must start with http:// or https://";
      return null;
    }
    if (i === 2) {
      const r = Number(campaignRateInr);
      if (!Number.isFinite(r) || r < 0) return "Enter a valid rate in ₹";
      if (!rateKind) return "Choose fixed or negotiable";
      if (!estimatedDeliveryDate) return "Pick an estimated delivery date";
      return null;
    }
    if (i === 3) {
      for (const row of contentPlans) {
        if (row.contentIdea.trim().length < 5) return "Each content idea needs at least 5 characters";
        if (!row.platform.trim()) return "Platform required for each row";
      }
      return null;
    }
    if (i === 4) {
      if (!audience.location.trim()) return "Audience location is required";
      if (audience.engagementRatePct !== "") {
        const n = Number(audience.engagementRatePct);
        if (!Number.isFinite(n) || n < 0 || n > 100) return "Audience engagement must be 0–100";
      }
      return null;
    }
    if (i === 5) {
      if (!deadlineConfirmed) return "Confirm you’ve reviewed the campaign deadline";
      if (!termsAccepted) return "Accept the terms to submit";
      return null;
    }
    return null;
  }

  function next() {
    const e = validateStep(step);
    if (e) {
      setErr(e);
      return;
    }
    setErr("");
    if (step === 3 && profileEngagementPct && !audience.engagementRatePct) {
      setAudience((a) => ({ ...a, engagementRatePct: profileEngagementPct }));
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setErr("");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    const e = validateStep(5);
    if (e) {
      setErr(e);
      return;
    }
    setSubmitting(true);
    setErr("");
    const res = await fetch(`/api/collabli/campaigns/${campaignId}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pitch: pitch.trim(),
        pastSimilarWork: pastSimilarWork.trim(),
        portfolioLink: portfolioLink.trim(),
        campaignRateInr: Number(campaignRateInr),
        rateKind,
        estimatedDeliveryDate,
        contentPlans,
        audienceSnapshot: {
          followers: Number(audience.followers) || 0,
          views: Number(audience.views) || 0,
          engagementRatePct: audience.engagementRatePct === "" ? undefined : Number(audience.engagementRatePct),
          location: audience.location.trim(),
          ageRange: audience.ageRange.trim(),
          gender: audience.gender.trim(),
        },
        profileSummaryEngagementPct: profileEngagementPct === "" ? undefined : Number(profileEngagementPct),
        deadlineConfirmed,
        termsAccepted,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setErr(data.message || "Submit failed");
      return;
    }
    router.push("/dashboard/my-applications");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-neutral-500">Loading application…</p>
      </div>
    );
  }

  if (err && !campaign) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <p className="text-sm text-red-600">{err}</p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/dashboard/opportunities">Back to opportunities</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-16">
      <div>
        <Button asChild variant="ghost" className="mb-2 -ml-2 rounded-xl text-neutral-600">
          <Link href="/dashboard/opportunities">← Back</Link>
        </Button>
        <h1 className="text-2xl font-bold text-neutral-900">Apply to campaign</h1>
        {campaign ? <p className="mt-1 text-sm text-neutral-600">{campaign.title}</p> : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              if (i <= step) {
                setErr("");
                setStep(i);
              }
            }}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              i === step ? "bg-yellow-400 text-black" : i < step ? "bg-neutral-200 text-neutral-700" : "bg-neutral-100 text-neutral-400"
            )}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {err ? <p className="text-sm text-red-600">{err}</p> : null}

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-lg">
            Step {step + 1}: {STEPS[step]}
          </CardTitle>
          <CardDescription>
            {step === 0 && "Pulled from your Collabli profile — add a typical engagement rate if you track it."}
            {step === 1 && "Help the brand understand why you’re the right fit."}
            {step === 2 && "Your quote in Indian Rupees (₹) for this campaign."}
            {step === 3 && "Outline what you’d actually create."}
            {step === 4 && "Defaults come from your profile and stats — adjust if needed."}
            {step === 5 && "Review the brief and confirm before submitting."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <ReadOnly label="Name" value={profileDisplay.displayName || "—"} />
              <ReadOnly label="Handle" value={profileDisplay.publicHandle ? `@${profileDisplay.publicHandle}` : "—"} />
              <ReadOnly label="Platforms" value={profileDisplay.platforms.length ? profileDisplay.platforms.join(", ") : "—"} />
              <ReadOnly label="Niche" value={profileDisplay.niche || "—"} />
              <div className="space-y-1.5">
                <Label>Typical engagement rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  placeholder="e.g. 3.2"
                  value={profileEngagementPct}
                  onChange={(e) => setProfileEngagementPct(e.target.value)}
                  className="rounded-xl"
                />
                <p className="text-xs text-neutral-500">Optional. Shown in your application summary.</p>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-1.5">
                <Label>Pitch message</Label>
                <Textarea value={pitch} onChange={(e) => setPitch(e.target.value)} rows={6} className="rounded-xl" placeholder="Why you’re a fit for this brief, tone, and what you’ll deliver…" />
              </div>
              <div className="space-y-1.5">
                <Label>Past similar work</Label>
                <Textarea
                  value={pastSimilarWork}
                  onChange={(e) => setPastSimilarWork(e.target.value)}
                  rows={5}
                  className="rounded-xl"
                  placeholder="Brands, verticals, results, links to relevant posts…"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Portfolio link (optional)</Label>
                <Input value={portfolioLink} onChange={(e) => setPortfolioLink(e.target.value)} className="rounded-xl" placeholder="https://…" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-1.5">
                <Label>Rate for this campaign (₹)</Label>
                <Input type="number" min={0} value={campaignRateInr} onChange={(e) => setCampaignRateInr(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Pricing</Label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="radio" name="rateKind" checked={rateKind === "fixed"} onChange={() => setRateKind("fixed")} />
                    Fixed
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="radio" name="rateKind" checked={rateKind === "negotiable"} onChange={() => setRateKind("negotiable")} />
                    Negotiable
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Estimated delivery date</Label>
                <Input type="date" value={estimatedDeliveryDate} onChange={(e) => setEstimatedDeliveryDate(e.target.value)} className="rounded-xl" />
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {contentPlans.map((row, idx) => (
                <div key={idx} className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-4 space-y-3">
                  <p className="text-xs font-semibold text-neutral-500">Row {idx + 1}</p>
                  <div className="space-y-1.5">
                    <Label>Content idea</Label>
                    <Textarea value={row.contentIdea} onChange={(e) => updatePlan(idx, { contentIdea: e.target.value })} rows={3} className="rounded-xl bg-white" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Platform</Label>
                      <Input value={row.platform} onChange={(e) => updatePlan(idx, { platform: e.target.value })} className="rounded-xl bg-white" placeholder="Instagram, YouTube…" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Format</Label>
                      <select
                        value={row.format}
                        onChange={(e) => updatePlan(idx, { format: e.target.value as ContentPlanRow["format"] })}
                        className="flex h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm"
                      >
                        <option value="Reel">Reel</option>
                        <option value="Story">Story</option>
                        <option value="Post">Post</option>
                        <option value="Video">Video</option>
                      </select>
                    </div>
                  </div>
                  {contentPlans.length > 1 ? (
                    <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => removePlan(idx)}>
                      Remove row
                    </Button>
                  ) : null}
                </div>
              ))}
              <Button type="button" variant="outline" className="rounded-xl" onClick={addPlan}>
                + Add content row
              </Button>
            </div>
          )}

          {step === 4 && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Followers (total)</Label>
                  <Input type="number" min={0} value={audience.followers} onChange={(e) => setAudience((a) => ({ ...a, followers: e.target.value }))} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Views (portfolio / recent)</Label>
                  <Input type="number" min={0} value={audience.views} onChange={(e) => setAudience((a) => ({ ...a, views: e.target.value }))} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Engagement rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  value={audience.engagementRatePct}
                  onChange={(e) => setAudience((a) => ({ ...a, engagementRatePct: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input value={audience.location} onChange={(e) => setAudience((a) => ({ ...a, location: e.target.value }))} className="rounded-xl" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Age range (audience)</Label>
                  <Input value={audience.ageRange} onChange={(e) => setAudience((a) => ({ ...a, ageRange: e.target.value }))} className="rounded-xl" placeholder="e.g. 18–34" />
                </div>
                <div className="space-y-1.5">
                  <Label>Gender split / note</Label>
                  <Input value={audience.gender} onChange={(e) => setAudience((a) => ({ ...a, gender: e.target.value }))} className="rounded-xl" placeholder="e.g. 70% women" />
                </div>
              </div>
            </>
          )}

          {step === 5 && campaign && (
            <>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm space-y-2">
                <p className="font-semibold text-neutral-900">Campaign brief</p>
                <p className="whitespace-pre-wrap text-neutral-700">{campaign.deliverables}</p>
                <p className="text-neutral-600">
                  <span className="font-medium">Deadline:</span> {new Date(campaign.deadline).toLocaleDateString(undefined, { dateStyle: "long" })}
                </p>
                <p className="text-neutral-600">
                  <span className="font-medium">Budget:</span> ₹{Number(campaign.budget).toLocaleString("en-IN")} (reference)
                </p>
              </div>
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <Checkbox checked={deadlineConfirmed} onCheckedChange={(c) => setDeadlineConfirmed(c === true)} className="mt-0.5" />
                <span>I confirm I can work toward this deadline (or will align in writing with the brand).</span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <Checkbox checked={termsAccepted} onCheckedChange={(c) => setTermsAccepted(c === true)} className="mt-0.5" />
                <span>I agree that my application details are accurate and I accept Collabli&apos;s collaboration terms for this campaign.</span>
              </label>
            </>
          )}

          <div className="flex flex-wrap justify-between gap-3 pt-4">
            <Button type="button" variant="outline" className="rounded-xl" disabled={step === 0} onClick={back}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" className="rounded-xl bg-yellow-400 text-black hover:bg-yellow-500" onClick={next}>
                Next
              </Button>
            ) : (
              <Button type="button" className="rounded-xl bg-black text-white hover:bg-neutral-800" disabled={submitting} onClick={() => void submit()}>
                {submitting ? "Submitting…" : "Submit application"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
