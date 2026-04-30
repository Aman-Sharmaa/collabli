"use client";

import { useEffect, useState } from "react";
import { Building2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type BrandRow = {
  user: {
    _id: string;
    name?: string;
    email: string;
    approvalStatus?: string;
    createdAt?: string;
  };
  profile: {
    companyName?: string;
    industry?: string;
    website?: string;
    location?: string;
    monthlyBudget?: number;
  } | null;
};

export default function BrandListClient() {
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BrandRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/collabli/admin/brands");
    const data = await res.json();
    if (res.ok) setBrands(data.brands || []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function openDetail(row: BrandRow) {
    setSelected(row);
    setDialogOpen(true);
  }

  async function setApproval(status: "approved" | "rejected") {
    if (!selected) return;
    setActionLoading(true);
    await fetch(`/api/collabli/admin/users/${selected.user._id}/approval`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setActionLoading(false);
    setDialogOpen(false);
    setSelected(null);
    void load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Brands</h1>
        <p className="mt-1 text-sm text-neutral-500">All registered brands. Click a row to view details and approve.</p>
      </div>

      <Card className="rounded-2xl border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-yellow-600" />
            Brand directory
          </CardTitle>
          <CardDescription>{loading ? "Loading…" : `${brands.length} brands`}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((row) => (
                <TableRow
                  key={row.user._id}
                  className="cursor-pointer hover:bg-neutral-50"
                  onClick={() => openDetail(row)}
                >
                  <TableCell className="font-medium">
                    {row.profile?.companyName || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-neutral-900">{row.user.name || "—"}</div>
                    <div className="text-xs text-neutral-500">{row.user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.user.approvalStatus === "approved"
                          ? "default"
                          : row.user.approvalStatus === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {row.user.approvalStatus || "pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Brand details</DialogTitle>
            <DialogDescription>Review profile and approval status</DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="grid gap-3 text-sm">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-neutral-50 p-3">
                <span className="text-neutral-500">Company</span>
                <span className="font-medium text-neutral-900">{selected.profile?.companyName || "—"}</span>
                <span className="text-neutral-500">Industry</span>
                <span>{selected.profile?.industry || "—"}</span>
                <span className="text-neutral-500">Website</span>
                <span className="truncate">{selected.profile?.website || "—"}</span>
                <span className="text-neutral-500">Location</span>
                <span>{selected.profile?.location || "—"}</span>
                <span className="text-neutral-500">Monthly budget</span>
                <span>${Number(selected.profile?.monthlyBudget || 0).toLocaleString()}</span>
              </div>
              <div className="rounded-xl border border-neutral-200 p-3">
                <p className="text-xs font-medium uppercase text-neutral-500">Account</p>
                <p className="mt-1 font-medium text-neutral-900">{selected.user.name || "—"}</p>
                <p className="text-sm text-neutral-600">{selected.user.email}</p>
                <p className="mt-2 text-xs text-neutral-400">
                  Joined {selected.user.createdAt ? new Date(selected.user.createdAt).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            {selected?.user.approvalStatus === "pending" ? (
              <>
                <Button variant="outline" disabled={actionLoading} onClick={() => void setApproval("rejected")}>
                  Reject
                </Button>
                <Button
                  className="bg-yellow-400 text-black hover:bg-yellow-500"
                  disabled={actionLoading}
                  onClick={() => void setApproval("approved")}
                >
                  Approve brand
                </Button>
              </>
            ) : (
              <p className="text-sm text-neutral-500">No pending action for this account.</p>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
