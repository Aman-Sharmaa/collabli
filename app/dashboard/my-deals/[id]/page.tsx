"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DealDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const [deal, setDeal] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [chat, setChat] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [proofKind, setProofKind] = useState<"link" | "screenshot">("link");
  const [proofNote, setProofNote] = useState("");
  const [disputeNote, setDisputeNote] = useState("");
  const [msg, setMsg] = useState("");

  async function loadAll() {
    const [dRes, mRes, me] = await Promise.all([
      fetch(`/api/collabli/deals/${id}`),
      fetch(`/api/collabli/deals/${id}/messages`),
      fetch("/api/collabli/auth/me").then((r) => r.json()),
    ]);
    setRole(me.user?.role || null);
    if (dRes.ok) {
      const d = await dRes.json();
      setDeal(d.deal);
    }
    if (mRes.ok) {
      const m = await mRes.json();
      setMessages(m.messages || []);
    }
  }

  useEffect(() => {
    if (id) void loadAll();
  }, [id]);

  async function sendChat() {
    setMsg("");
    const res = await fetch(`/api/collabli/deals/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: chat }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.message || "Failed");
    setChat("");
    void loadAll();
  }

  async function addProof() {
    setMsg("");
    const res = await fetch(`/api/collabli/deals/${id}/proof`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: proofUrl, kind: proofKind, note: proofNote }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.message || "Failed");
    setProofUrl("");
    setProofNote("");
    void loadAll();
  }

  async function advanceStatus(next: string) {
    setMsg("");
    const res = await fetch(`/api/collabli/deals/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        next === "submitted"
          ? { status: "submitted", submittedContentUrl: proofUrl || undefined, proofUrl: proofUrl || undefined, proofKind }
          : { status: next }
      ),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.message || "Failed");
    void loadAll();
  }

  async function raiseDispute() {
    setMsg("");
    const res = await fetch(`/api/collabli/deals/${id}/dispute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: disputeNote }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.message || "Failed");
    setDisputeNote("");
    void loadAll();
  }

  function downloadInvoice() {
    window.open(`/api/collabli/deals/${id}/invoice`, "_blank");
  }

  if (!deal) return <p className="text-sm text-neutral-500">Loading…</p>;

  const camp = deal.campaignId;
  const title = typeof camp === "object" && camp?.title ? camp.title : "Deal";
  const deadline = typeof camp === "object" && camp?.deadline ? new Date(camp.deadline).toLocaleString() : "—";
  const isCreator = role === "creator";
  const isBrand = role === "brand";
  const proofs = deal.contentProofs || [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/my-deals" className="text-sm text-neutral-500 hover:text-neutral-800">
          ← Back
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Status <span className="font-semibold capitalize">{deal.status}</span> · Deadline {deadline}
        </p>
      </div>
      {msg ? <p className="text-sm text-red-600">{msg}</p> : null}

      {deal.dispute?.raised ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-base text-amber-900">Dispute open</CardTitle>
            <CardDescription className="text-amber-800">{deal.dispute.note}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-base">Deal actions</CardTitle>
          <CardDescription>Move the deal forward or download paperwork.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {isBrand && deal.status === "pending" ? (
            <Button className="rounded-xl bg-black text-white" onClick={() => void advanceStatus("active")}>
              Mark escrow / active
            </Button>
          ) : null}
          {isCreator && deal.status === "active" ? (
            <Button className="rounded-xl bg-yellow-400 text-black" onClick={() => void advanceStatus("submitted")}>
              Mark submitted (use proof URL below)
            </Button>
          ) : null}
          {isBrand && deal.status === "submitted" ? (
            <Button className="rounded-xl bg-black text-white" onClick={() => void advanceStatus("completed")}>
              Complete & release payout
            </Button>
          ) : null}
          <Button variant="outline" className="rounded-xl" onClick={downloadInvoice}>
            Download invoice (.txt)
          </Button>
        </CardContent>
      </Card>

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-base">Content proof</CardTitle>
          <CardDescription>Links or image URLs + optional note.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isCreator ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={proofKind} onValueChange={(v) => setProofKind(v as "link" | "screenshot")}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="screenshot">Screenshot / asset URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Textarea value={proofNote} onChange={(e) => setProofNote(e.target.value)} placeholder="Note" className="rounded-xl" rows={2} />
              <Button className="rounded-xl" variant="secondary" onClick={() => void addProof()}>
                Add proof entry
              </Button>
            </>
          ) : null}
          <ul className="space-y-2 text-sm">
            {proofs.length === 0 ? <li className="text-neutral-400">No proofs yet.</li> : null}
            {proofs.map((p: any, i: number) => (
              <li key={i} className="rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2">
                <a href={p.url} className="text-yellow-700 underline" target="_blank" rel="noreferrer">
                  {p.url}
                </a>
                <span className="ml-2 text-xs text-neutral-500">{p.kind}</span>
                {p.note ? <p className="text-neutral-600">{p.note}</p> : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-base">Chat</CardTitle>
          <CardDescription>Message the other party on this deal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-sm">
            {messages.map((m) => (
              <div key={m._id} className="rounded-lg bg-white px-2 py-1 shadow-sm">
                {m.body}
                <p className="text-[10px] text-neutral-400">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={chat} onChange={(e) => setChat(e.target.value)} className="rounded-xl" placeholder="Type a message…" />
            <Button className="rounded-xl bg-black text-white" onClick={() => void sendChat()}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {isCreator && !deal.dispute?.raised ? (
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="text-base text-red-900">Dispute</CardTitle>
            <CardDescription>If the brand is unresponsive, raise a dispute for admin review.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea value={disputeNote} onChange={(e) => setDisputeNote(e.target.value)} className="rounded-xl" rows={3} />
            <Button variant="destructive" className="rounded-xl" onClick={() => void raiseDispute()}>
              Raise dispute
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
