"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type User = { id: string; email: string; name: string; role: "brand" | "creator" | "admin" };

type AdminStats = {
  totalBrands: number;
  totalCreators: number;
  pendingApprovals: number;
  approvedBrands: number;
  approvedCreators: number;
  totalDeals: number;
  activeDeals: number;
  totalCampaigns: number;
  openCampaigns: number;
};

type DealStatus = "pending" | "active" | "submitted" | "completed";
const ORDER: DealStatus[] = ["pending", "active", "submitted", "completed"];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/collabli/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user);
        if (d.user?.role === "admin") {
          fetch("/api/collabli/admin/stats")
            .then((r) => r.json())
            .then((s) => setAdminStats(s))
            .catch(() => setAdminStats(null));
        }
      });
    fetch("/api/collabli/deals").then((r) => r.json()).then((d) => setDeals(d.deals || []));
    fetch("/api/collabli/notifications").then((r) => r.json()).then((d) => setNotifications(d.notifications || []));
    fetch("/api/collabli/campaigns").then((r) => r.json()).then((d) => setCampaigns(d.campaigns || []));
    fetch("/api/collabli/creator-profile").then((r) => r.json()).then((d) => setCreatorProfile(d.profile || null)).catch(() => undefined);
    fetch("/api/collabli/brand-profile").then((r) => r.json()).then((d) => setBrandProfile(d.profile || null)).catch(() => undefined);
  }, []);

  const byStatus = useMemo(
    () => ({
      pending: deals.filter((d) => d.status === "pending").length,
      active: deals.filter((d) => d.status === "active").length,
      submitted: deals.filter((d) => d.status === "submitted").length,
      completed: deals.filter((d) => d.status === "completed").length,
    }),
    [deals]
  );

  const totalRevenue = useMemo(() => deals.reduce((sum, d) => sum + Number(d.amount || 0), 0), [deals]);
  const openCampaignsCount = campaigns.length;
  const completionRate = deals.length ? Math.round((byStatus.completed / deals.length) * 100) : 0;

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-neutral-500">Loading dashboard…</div>
    );
  }

  if (user.role === "admin" && adminStats) {
    const statCards = [
      { label: "Total brands", value: adminStats.totalBrands, sub: `${adminStats.approvedBrands} approved` },
      { label: "Total creators", value: adminStats.totalCreators, sub: `${adminStats.approvedCreators} approved` },
      { label: "Pending approval", value: adminStats.pendingApprovals, sub: "Awaiting review", highlight: adminStats.pendingApprovals > 0 },
      { label: "Active deals", value: adminStats.activeDeals, sub: `of ${adminStats.totalDeals} total` },
      { label: "Campaigns", value: adminStats.totalCampaigns, sub: `${adminStats.openCampaigns} open` },
      { label: "Platform deals", value: adminStats.totalDeals, sub: "All statuses" },
    ];

    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Dashboard</h1>
            <p className="mt-1 text-sm text-neutral-500">Overview of brands, creators, and platform activity.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-xl bg-yellow-400 font-semibold text-black hover:bg-yellow-500">
              <Link href="/dashboard/brand">Manage brands</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl border-neutral-300">
              <Link href="/dashboard/creator">Manage creators</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((s) => (
            <Card key={s.label} className={cnCard(s.highlight)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-600">{s.label}</CardTitle>
                <div className="rounded-full bg-yellow-400/20 p-2">
                  <TrendingUp className="h-4 w-4 text-yellow-700" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-neutral-900">{s.value}</p>
                <p className="text-xs text-neutral-500">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-neutral-200 shadow-sm">
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Review and approve signups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/dashboard/brand"
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
              >
                View all brands
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/creator"
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
              >
                View all creators
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/admin"
                className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
              >
                Bulk approvals & onboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-neutral-200 shadow-sm">
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Recent notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {notifications.slice(0, 6).map((n) => (
                  <li key={n._id} className="flex items-start justify-between gap-2 rounded-lg border border-neutral-100 bg-neutral-50/80 px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium text-neutral-900">{n.title}</p>
                      <p className="text-xs text-neutral-500 line-clamp-2">{n.body}</p>
                    </div>
                  </li>
                ))}
                {notifications.length === 0 ? (
                  <p className="text-sm text-neutral-500">No notifications yet.</p>
                ) : null}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (user.role === "admin" && !adminStats) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-neutral-500">Loading stats…</div>
    );
  }

  const needsCreatorOnboarding = user.role === "creator" && !creatorProfile?.niche;
  const needsBrandOnboarding = user.role === "brand" && !brandProfile?.companyName;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          {user.role === "brand" ? "Brand workspace" : "Creator workspace"}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">Welcome back{user.name ? `, ${user.name}` : ""}.</p>
      </div>

      {(needsCreatorOnboarding || needsBrandOnboarding) && (
        <Card className="border-yellow-200 bg-yellow-50/80">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <p className="text-sm font-medium text-neutral-900">Complete your profile to get the most from Collabli.</p>
            <Button asChild size="sm" className="bg-yellow-400 text-black hover:bg-yellow-500">
              <Link href={user.role === "brand" ? "/dashboard/onboarding/brand" : "/dashboard/onboarding/creator"}>
                Continue onboarding
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatLight title="Deals" value={String(deals.length)} sub="All tracked" />
        <StatLight title="Campaigns" value={String(openCampaignsCount)} sub="Visible to you" />
        <StatLight title="Completion" value={`${completionRate}%`} sub="Deals completed" />
        <StatLight title="Volume" value={`$${totalRevenue.toLocaleString()}`} sub="Deal amounts" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Deal pipeline</CardTitle>
            <CardDescription>Status breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ORDER.map((status) => {
              const value = byStatus[status];
              const pct = deals.length ? Math.round((value / deals.length) * 100) : 0;
              return (
                <div key={status}>
                  <div className="mb-1 flex justify-between text-xs font-medium capitalize text-neutral-600">
                    <span>{status}</span>
                    <span>
                      {value} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full bg-yellow-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-between rounded-xl">
              <Link href="/dashboard/campaign-board">
                Campaign board <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between rounded-xl">
              <Link href="/creators">
                Creator directory <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-xs text-neutral-500">
                    <th className="pb-2 font-medium">Title</th>
                    <th className="pb-2 font-medium">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.slice(0, 5).map((c) => (
                    <tr key={c._id} className="border-b border-neutral-100">
                      <td className="py-2 font-medium text-neutral-900">{c.title}</td>
                      <td className="py-2 text-neutral-600">${Number(c.budget || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {notifications.slice(0, 5).map((n) => (
                <li key={n._id} className="rounded-lg border border-neutral-100 px-3 py-2 text-sm">
                  <p className="font-medium text-neutral-900">{n.title}</p>
                  <p className="text-xs text-neutral-500">{n.body}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cnCard(highlight?: boolean) {
  return highlight
    ? "rounded-2xl border-amber-200 bg-amber-50/50 shadow-sm"
    : "rounded-2xl border-neutral-200 shadow-sm";
}

function StatLight({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <Card className="rounded-2xl border-neutral-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-neutral-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-neutral-900">{value}</p>
        <p className="text-xs text-neutral-500">{sub}</p>
      </CardContent>
    </Card>
  );
}
