"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BrandApplicationsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [detailApp, setDetailApp] = useState<any | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/collabli/brand/applications");
    const data = await res.json();
    setRows(data.applications || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function decide(id: string, decision: "accepted" | "rejected") {
    setMsg("");
    const res = await fetch(`/api/collabli/applications/${id}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, rejectionNote: decision === "rejected" ? rejectNote : undefined }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.message || "Failed");
    setRejectId(null);
    setRejectNote("");
    void load();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Campaign applications</h1>
        <p className="mt-1 text-sm text-neutral-600">Accept creators or reject with a short note they will see.</p>
      </div>
      {msg ? <p className="text-sm text-red-600">{msg}</p> : null}
      <div className="space-y-4">
        {rows.filter((a) => a.status === "pending").length === 0 ? (
          <p className="text-sm text-neutral-500">No pending applications.</p>
        ) : null}
        {rows.map((a) => {
          const c = a.campaignId;
          const person = typeof a.applicantUserId === "object" ? a.applicantUserId : null;
          const cr = typeof a.creatorId === "object" ? a.creatorId : null;
          const who = person || cr;
          return (
            <Card key={a._id} className="border-neutral-200">
              <CardHeader>
                <CardTitle className="text-lg">{typeof c === "object" ? c?.title : "Campaign"}</CardTitle>
                <CardDescription>
                  {who ? who?.name || who?.email || "Applicant" : "Applicant"}{" "}
                  {who?.publicHandle ? `· @${who.publicHandle}` : ""} ·{" "}
                  <span className="capitalize">{a.status}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="line-clamp-3 text-neutral-700">{a.pitch}</p>
                {a.campaignRateInr != null ? (
                  <p className="text-xs text-neutral-600">
                    Quote: ₹{Number(a.campaignRateInr).toLocaleString("en-IN")} · {a.rateKind === "negotiable" ? "Negotiable" : "Fixed"}
                  </p>
                ) : null}
                <Button type="button" variant="secondary" size="sm" className="rounded-xl" onClick={() => setDetailApp(a)}>
                  View full application
                </Button>
                {a.status === "pending" ? (
                  <div className="flex flex-wrap gap-2">
                    <Button className="rounded-xl bg-yellow-400 text-black" onClick={() => void decide(a._id, "accepted")}>
                      Accept
                    </Button>
                    <Button variant="outline" className="rounded-xl" onClick={() => setRejectId(a._id)}>
                      Reject with note
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!detailApp} onOpenChange={(o) => !o && setDetailApp(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Application details</DialogTitle>
          </DialogHeader>
          {detailApp ? <ApplicationDetailBody app={detailApp} /> : null}
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectId} onOpenChange={(o) => !o && setRejectId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Optional note to the creator (why not a fit, what to improve…)"
            rows={4}
            className="rounded-xl"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => rejectId && void decide(rejectId, "rejected")}>
              Send rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ApplicationDetailBody({ app }: { app: Record<string, unknown> }) {
  const ps = app.profileSummary as Record<string, unknown> | undefined;
  const aud = app.audienceSnapshot as Record<string, unknown> | undefined;
  const plans = app.contentPlans as Array<Record<string, unknown>> | undefined;
  return (
    <div className="space-y-4 text-sm text-neutral-700">
      <section>
        <p className="text-xs font-semibold uppercase text-neutral-500">Profile summary</p>
        {ps ? (
          <ul className="mt-1 list-inside list-disc text-neutral-700">
            <li>Name: {String(ps.displayName || "—")}</li>
            <li>@{String(ps.publicHandle || "—")}</li>
            <li>Platforms: {Array.isArray(ps.platforms) ? (ps.platforms as string[]).join(", ") : "—"}</li>
            <li>Niche: {String(ps.niche || "—")}</li>
            {ps.engagementRatePct != null ? <li>Engagement: {String(ps.engagementRatePct)}%</li> : null}
          </ul>
        ) : (
          <p className="text-neutral-500">Not captured (legacy application)</p>
        )}
      </section>
      <section>
        <p className="text-xs font-semibold uppercase text-neutral-500">Why you</p>
        <p className="mt-1 whitespace-pre-wrap">{String(app.pitch || "")}</p>
        {app.pastSimilarWork ? (
          <div className="mt-2">
            <p className="text-xs font-medium text-neutral-500">Past work</p>
            <p className="whitespace-pre-wrap">{String(app.pastSimilarWork)}</p>
          </div>
        ) : null}
        {app.portfolioLink ? (
          <a href={String(app.portfolioLink)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-yellow-700 underline">
            Portfolio link
          </a>
        ) : null}
      </section>
      {app.campaignRateInr != null ? (
        <section>
          <p className="text-xs font-semibold uppercase text-neutral-500">Rate</p>
          <p>
            ₹{Number(app.campaignRateInr).toLocaleString("en-IN")} · {app.rateKind === "negotiable" ? "Negotiable" : "Fixed"}
          </p>
          {app.estimatedDeliveryDate ? (
            <p className="text-xs text-neutral-500">Est. delivery: {new Date(String(app.estimatedDeliveryDate)).toLocaleDateString()}</p>
          ) : null}
        </section>
      ) : null}
      {plans && plans.length > 0 ? (
        <section>
          <p className="text-xs font-semibold uppercase text-neutral-500">Content plan</p>
          <ul className="mt-1 space-y-2">
            {plans.map((p, i) => (
              <li key={i} className="rounded-lg border border-neutral-100 bg-neutral-50 p-2">
                <p className="font-medium">{String(p.platform)} · {String(p.format)}</p>
                <p className="whitespace-pre-wrap text-neutral-600">{String(p.contentIdea || "")}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {aud ? (
        <section>
          <p className="text-xs font-semibold uppercase text-neutral-500">Audience</p>
          <ul className="mt-1 list-inside list-disc">
            <li>Followers: {Number(aud.followers || 0).toLocaleString()}</li>
            <li>Views: {Number(aud.views || 0).toLocaleString()}</li>
            {aud.engagementRatePct != null ? <li>Engagement: {String(aud.engagementRatePct)}%</li> : null}
            <li>Location: {String(aud.location || "—")}</li>
            {aud.ageRange ? <li>Age: {String(aud.ageRange)}</li> : null}
            {aud.gender ? <li>Gender: {String(aud.gender)}</li> : null}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
