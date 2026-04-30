"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AppRow = {
  _id: string;
  status: string;
  pitch: string;
  campaignRateInr?: number;
  rateKind?: string;
  rejectionNote?: string;
  campaignId: {
    title?: string;
    budget?: number;
    niche?: string;
    deadline?: string;
    status?: string;
  } | null;
};

export default function MyApplicationsPage() {
  const [rows, setRows] = useState<AppRow[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/collabli/creator/applications");
    const data = await res.json();
    setRows(data.applications || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function withdraw(id: string) {
    setMsg("");
    const res = await fetch(`/api/collabli/applications/${id}/withdraw`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) return setMsg(data.message || "Could not withdraw");
    void load();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">My applications</h1>
        <p className="mt-1 text-sm text-neutral-600">Withdraw while pending. If rejected, the brand may leave a note.</p>
      </div>
      {msg ? <p className="text-sm text-red-600">{msg}</p> : null}
      <div className="space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-neutral-500">No applications yet. Browse campaigns to apply.</p>
        ) : (
          rows.map((a) => {
            const c = a.campaignId;
            return (
              <Card key={a._id} className="border-neutral-200">
                <CardHeader>
                  <CardTitle className="text-lg">{c?.title || "Campaign"}</CardTitle>
                  <CardDescription>
                    Status: <span className="font-semibold capitalize text-neutral-800">{a.status}</span>
                    {c?.niche ? ` · ${c.niche}` : ""}
                    {c?.budget != null ? ` · $${Number(c.budget).toLocaleString()}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-neutral-700">
                    <span className="font-medium text-neutral-900">Pitch:</span> {a.pitch}
                  </p>
                  {a.campaignRateInr != null ? (
                    <p className="text-xs text-neutral-600">
                      Your quote: ₹{Number(a.campaignRateInr).toLocaleString("en-IN")}
                      {a.rateKind === "negotiable" ? " (negotiable)" : " (fixed)"}
                    </p>
                  ) : null}
                  {a.status === "rejected" && a.rejectionNote ? (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-red-900">
                      <p className="text-xs font-semibold uppercase">Brand note</p>
                      <p>{a.rejectionNote}</p>
                    </div>
                  ) : null}
                  {a.status === "pending" ? (
                    <Button variant="outline" className="rounded-xl text-red-700" onClick={() => void withdraw(a._id)}>
                      Withdraw application
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
