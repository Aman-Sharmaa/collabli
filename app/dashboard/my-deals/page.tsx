"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MyDealsListPage() {
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    void fetch("/api/collabli/deals")
      .then((r) => r.json())
      .then((d) => setDeals(d.deals || []));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Deals</h1>
        <p className="mt-1 text-sm text-neutral-600">Active collaborations, deadlines, and deliverables.</p>
      </div>
      <div className="space-y-4">
        {deals.length === 0 ? (
          <p className="text-sm text-neutral-500">No deals yet.</p>
        ) : (
          deals.map((d) => {
            const camp = d.campaignId;
            const title = typeof camp === "object" && camp?.title ? camp.title : "Campaign";
            const deadline =
              typeof camp === "object" && camp?.deadline ? new Date(camp.deadline).toLocaleString() : "—";
            return (
              <Card key={d._id} className="border-neutral-200">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>
                      Status: <span className="capitalize font-medium text-neutral-800">{d.status}</span> · Deadline {deadline}
                    </CardDescription>
                  </div>
                  <Link
                    href={`/dashboard/my-deals/${d._id}`}
                    className="shrink-0 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-500"
                  >
                    Open
                  </Link>
                </CardHeader>
                <CardContent className="text-sm text-neutral-600">
                  Amount ${Number(d.amount || 0).toLocaleString()} · Escrow {d.escrowPaid ? "funded" : "pending"}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
