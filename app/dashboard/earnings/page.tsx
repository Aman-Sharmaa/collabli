"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EarningsPage() {
  const [role, setRole] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [tx, setTx] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"upi" | "bank">("upi");
  const [payoutDetails, setPayoutDetails] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const [eRes, tRes] = await Promise.all([
      fetch("/api/collabli/creator/earnings"),
      fetch("/api/collabli/creator/transactions"),
    ]);
    if (eRes.ok) setData(await eRes.json());
    if (tRes.ok) {
      const j = await tRes.json();
      setTx(j.transactions || []);
    }
    await fetch("/api/collabli/creator/deadline-scan", { method: "POST" });
  }

  useEffect(() => {
    void fetch("/api/collabli/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setRole(d.user?.role || null);
        if (d.user?.role === "creator") void load();
      });
  }, []);

  async function withdraw() {
    setMsg("");
    const res = await fetch("/api/collabli/creator/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), method, payoutDetails }),
    });
    const j = await res.json();
    if (!res.ok) return setMsg(j.message || "Withdrawal failed");
    setAmount("");
    setPayoutDetails("");
    void load();
  }

  if (role !== "creator") {
    return <p className="text-sm text-neutral-600">Earnings and withdrawals are available for creator accounts.</p>;
  }

  if (!data) return <p className="text-sm text-neutral-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Earnings</h1>
        <p className="mt-1 text-sm text-neutral-600">Recorded payouts, balance, and withdrawals to UPI or bank.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-neutral-200">
          <CardHeader>
            <CardDescription>Total earned (recorded)</CardDescription>
            <CardTitle className="text-2xl">${Number(data.totalEarned || 0).toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-neutral-200">
          <CardHeader>
            <CardDescription>Withdrawn</CardDescription>
            <CardTitle className="text-2xl">${Number(data.totalWithdrawn || 0).toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-neutral-200">
          <CardHeader>
            <CardDescription>Available balance</CardDescription>
            <CardTitle className="text-2xl text-yellow-700">${Number(data.balance || 0).toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-base">Withdraw</CardTitle>
          <CardDescription>Demo flow: requests are logged as completed transactions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as "upi" | "bank")}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="bank">Bank</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>{method === "upi" ? "UPI ID" : "Bank details (account / IFSC)"}</Label>
            <Input value={payoutDetails} onChange={(e) => setPayoutDetails(e.target.value)} className="rounded-xl" />
          </div>
          {msg ? <p className="sm:col-span-2 text-sm text-red-600">{msg}</p> : null}
          <Button className="rounded-xl bg-black text-white sm:col-span-2" onClick={() => void withdraw()}>
            Request withdrawal
          </Button>
        </CardContent>
      </Card>

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-base">Active deals (pending value)</CardTitle>
          <CardDescription>Estimated gross if all complete — not yet in balance until marked completed.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-neutral-600">
          <p className="mb-2 font-medium text-neutral-900">Pipeline ~ ${Number(data.pendingEstimate || 0).toLocaleString()}</p>
          <ul className="space-y-1">
            {(data.activeDeals || []).map((d: any) => {
              const c = d.campaignId;
              const t = typeof c === "object" ? c?.title : "";
              const dl = typeof c === "object" && c?.deadline ? new Date(c.deadline).toLocaleDateString() : "";
              return (
                <li key={d._id}>
                  {t || "Deal"} — {d.status} · due {dl}{" "}
                  <a href={`/dashboard/my-deals/${d._id}`} className="text-yellow-700 hover:underline">
                    Open
                  </a>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-base">Transaction history</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {tx.length === 0 ? <li className="text-neutral-400">No transactions yet.</li> : null}
            {tx.map((t) => (
              <li key={t._id} className="flex flex-wrap justify-between gap-2 border-b border-neutral-100 py-2">
                <span className="capitalize">{t.type}</span>
                <span className={t.type === "earning" ? "text-emerald-700" : ""}>
                  {t.type === "withdrawal" ? "-" : "+"}${Number(t.amount).toLocaleString()}
                </span>
                <span className="w-full text-xs text-neutral-500">{t.description}</span>
                <span className="text-xs text-neutral-400">{new Date(t.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
