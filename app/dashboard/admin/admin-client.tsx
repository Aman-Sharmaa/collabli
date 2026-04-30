"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type UserRow = {
  _id: string;
  name: string;
  email: string;
  role: "creator" | "brand";
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt: string;
};

const statusVariant = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
} as const;

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [onboardRole, setOnboardRole] = useState<"creator" | "brand">("creator");

  useEffect(() => {
    void loadUsers();
  }, []);

  const pendingCount = useMemo(() => users.filter((u) => u.approvalStatus === "pending").length, [users]);
  const approvedCount = useMemo(() => users.filter((u) => u.approvalStatus === "approved").length, [users]);

  async function loadUsers() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/collabli/admin/users");
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.message || "Failed to load users");
    setUsers(data.users || []);
  }

  async function updateApproval(id: string, status: "approved" | "rejected") {
    const res = await fetch(`/api/collabli/admin/users/${id}/approval`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) void loadUsers();
  }

  async function onboardUser(formData: FormData) {
    const role = onboardRole;
    const payload: any = {
      role,
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      profile: role === "creator"
        ? {
            niche: formData.get("niche"),
            platforms: String(formData.get("platforms") || "").split(",").map((v) => v.trim()).filter(Boolean),
            audienceSize: Number(formData.get("audienceSize") || 0),
            location: formData.get("location"),
            rate: Number(formData.get("rate") || 0),
            bio: formData.get("bio"),
          }
        : {
            companyName: formData.get("companyName"),
            industry: formData.get("industry"),
            website: formData.get("website"),
            location: formData.get("location"),
            monthlyBudget: Number(formData.get("monthlyBudget") || 0),
          },
    };

    const res = await fetch("/api/collabli/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setDialogOpen(false);
      void loadUsers();
    }
  }

  return (
    <main className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        <strong className="font-semibold">Approvals:</strong> pending creators and brands appear in the list below. Use{" "}
        <strong>Approve</strong> or <strong>Reject</strong> — they can only log in at <code className="rounded bg-white/60 px-1 dark:bg-black/40">/login</code> after approval.
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Applicants</CardTitle><CardDescription>Creator + brand accounts</CardDescription></CardHeader>
          <CardContent><p className="text-3xl font-bold">{users.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pending Approval</CardTitle><CardDescription>Need admin action</CardDescription></CardHeader>
          <CardContent><p className="text-3xl font-bold">{pendingCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Approved</CardTitle><CardDescription>Live users</CardDescription></CardHeader>
          <CardContent><p className="text-3xl font-bold">{approvedCount}</p></CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Admin Panel</CardTitle>
            <CardDescription>Approve, reject, or onboard users directly.</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Onboard brand/creator</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Onboard User</DialogTitle>
                <DialogDescription>Create and approve a user in one step.</DialogDescription>
              </DialogHeader>

              <div className="mb-3 grid grid-cols-2 gap-2">
                <Button type="button" variant={onboardRole === "creator" ? "default" : "outline"} onClick={() => setOnboardRole("creator")}>Creator</Button>
                <Button type="button" variant={onboardRole === "brand" ? "default" : "outline"} onClick={() => setOnboardRole("brand")}>Brand</Button>
              </div>

              <form action={onboardUser} className="space-y-3">
                <Field name="name" label="Full name" required />
                <Field name="email" label="Email" type="email" required />
                <Field name="password" label="Temporary password" type="password" required />

                {onboardRole === "creator" ? (
                  <>
                    <Field name="niche" label="Niche" required />
                    <Field name="platforms" label="Platforms" required />
                    <Field name="audienceSize" label="Audience size" type="number" required />
                    <Field name="location" label="Location" required />
                    <Field name="rate" label="Rate" type="number" required />
                    <Field name="bio" label="Bio" required />
                  </>
                ) : (
                  <>
                    <Field name="companyName" label="Company name" required />
                    <Field name="industry" label="Industry" required />
                    <Field name="website" label="Website" required />
                    <Field name="location" label="Location" required />
                    <Field name="monthlyBudget" label="Monthly budget" type="number" required />
                  </>
                )}

                <Button className="w-full" type="submit">Create and approve user</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="space-y-2">
            {users.map((u) => (
              <div key={u._id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-muted-foreground">{u.email} • {u.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[u.approvalStatus]}>{u.approvalStatus}</Badge>
                  {u.approvalStatus === "pending" ? (
                    <>
                      <Button size="sm" onClick={() => void updateApproval(u._id, "approved")}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => void updateApproval(u._id, "rejected")}>Reject</Button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function Field({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} />
    </div>
  );
}
