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

export default function CreatorIncomingApplicationsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/collabli/creator/incoming-applications");
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
        <h1 className="text-2xl font-bold text-neutral-900">Brand inquiries</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Brands who responded to your &quot;available for work&quot; listings. Accept to open a deal or reject with a note.
        </p>
      </div>
      {msg ? <p className="text-sm text-red-600">{msg}</p> : null}
      <div className="space-y-4">
        {rows.filter((a) => a.status === "pending").length === 0 ? (
          <p className="text-sm text-neutral-500">No pending inquiries.</p>
        ) : null}
        {rows.map((a) => {
          const c = a.campaignId;
          const brand = a.applicantUserId;
          return (
            <Card key={a._id} className="border-neutral-200">
              <CardHeader>
                <CardTitle className="text-lg">{typeof c === "object" ? c?.title : "Listing"}</CardTitle>
                <CardDescription>
                  {typeof brand === "object" ? brand?.company || brand?.name || brand?.email : "Brand"}{" "}
                  {typeof brand === "object" && brand?.publicHandle ? `· @${brand.publicHandle}` : ""} ·{" "}
                  <span className="capitalize">{a.status}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-neutral-700">{a.pitch}</p>
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

      <Dialog open={!!rejectId} onOpenChange={(o) => !o && setRejectId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reject inquiry</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Optional note to the brand"
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
