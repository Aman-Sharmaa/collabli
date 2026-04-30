"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Users } from "lucide-react";
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

type CreatorRow = {
  user: {
    _id: string;
    name?: string;
    email: string;
    approvalStatus?: string;
    createdAt?: string;
  };
  profile: {
    niche?: string;
    platforms?: string[];
    audienceSize?: number;
    location?: string;
    rate?: number;
    bio?: string;
  } | null;
};

export default function CreatorListClient() {
  const [creators, setCreators] = useState<CreatorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CreatorRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/collabli/admin/creators");
    const data = await res.json();
    if (res.ok) setCreators(data.creators || []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function openDetail(row: CreatorRow) {
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
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Creators</h1>
        <p className="mt-1 text-sm text-neutral-500">All registered creators. Click a row to view details and approve.</p>
      </div>

      <Card className="rounded-2xl border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-yellow-600" />
            Creator directory
          </CardTitle>
          <CardDescription>{loading ? "Loading…" : `${creators.length} creators`}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creator</TableHead>
                <TableHead>Niche</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {creators.map((row) => (
                <TableRow
                  key={row.user._id}
                  className="cursor-pointer hover:bg-neutral-50"
                  onClick={() => openDetail(row)}
                >
                  <TableCell>
                    <div className="font-medium text-neutral-900">{row.user.name || "—"}</div>
                    <div className="text-xs text-neutral-500">{row.user.email}</div>
                  </TableCell>
                  <TableCell className="text-neutral-700">{row.profile?.niche || "—"}</TableCell>
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
            <DialogTitle>Creator details</DialogTitle>
            <DialogDescription>Review profile and approval status</DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="grid gap-3 text-sm">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-neutral-50 p-3">
                <span className="text-neutral-500">Niche</span>
                <span className="font-medium text-neutral-900">{selected.profile?.niche || "—"}</span>
                <span className="text-neutral-500">Platforms</span>
                <span>{(selected.profile?.platforms || []).join(", ") || "—"}</span>
                <span className="text-neutral-500">Audience</span>
                <span>{selected.profile?.audienceSize?.toLocaleString() || "—"}</span>
                <span className="text-neutral-500">Location</span>
                <span>{selected.profile?.location || "—"}</span>
                <span className="text-neutral-500">Rate</span>
                <span>${Number(selected.profile?.rate || 0).toLocaleString()}</span>
              </div>
              {selected.profile?.bio ? (
                <div className="rounded-xl border border-neutral-200 p-3">
                  <p className="text-xs font-medium uppercase text-neutral-500">Bio</p>
                  <p className="mt-1 text-neutral-700">{selected.profile.bio}</p>
                </div>
              ) : null}
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
                  Approve creator
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
