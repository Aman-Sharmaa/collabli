"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
  FolderTree,
  FileText,
  ExternalLink,
  Eye,
  Search,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type PlanPage = {
  _id: string;
  planId: string;
  name: string;
  url?: string;
  projectId?: string;
  order: number;
};

type PlanNode = {
  _id: string;
  name: string;
  parentId?: string | null;
  visibility: "me" | "org" | "shared";
  createdBy: string;
  sharedWith: string[];
  order: number;
  pages: PlanPage[];
  children: PlanNode[];
  createdAt: string;
  updatedAt: string;
};

export function PlansPageClient() {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [pageDialogOpen, setPageDialogOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [parentPlanId, setParentPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState("");
  const [pageName, setPageName] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [currentPlanIdForPage, setCurrentPlanIdForPage] = useState<string | null>(null);

  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
  const [deletePageId, setDeletePageId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [users, setUsers] = useState<any[]>([]);
  const [visibility, setVisibility] = useState<"me" | "org" | "shared">("org");
  const [sharedWith, setSharedWith] = useState<string[]>([]);

  const searchParams = useSearchParams();

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (dateFilter) params.append("startDate", dateFilter);
      if (userFilter !== "all") params.append("createdBy", userFilter);

      const res = await fetch(`/api/plans?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load documents");
      setPlans(data.plans || []);

      // Load users for filters
      const usersRes = await fetch("/api/employees");
      const usersData = await usersRes.json();
      setUsers(usersData.employees || []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (searchParams?.get("action") === "new-plan") {
      openAddPlan(null);
      // Clean up URL
      const newParams = new URLSearchParams(searchParams?.toString());
      newParams.delete("action");
      const newUrl = `${window.location.pathname}${newParams.toString() ? `?${newParams.toString()}` : ""}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openAddPlan(parentId: string | null) {
    setEditingPlanId(null);
    setParentPlanId(parentId);
    setPlanName("");
    setVisibility("org");
    setSharedWith([]);
    setPlanDialogOpen(true);
  }

  function openEditPlan(node: PlanNode) {
    setEditingPlanId(node._id);
    setParentPlanId(node.parentId || null);
    setPlanName(node.name);
    setVisibility(node.visibility || "org");
    setSharedWith(node.sharedWith || []);
    setPlanDialogOpen(true);
  }

  async function onPlanSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!planName.trim()) return;

    try {
      const isEditing = !!editingPlanId;
      const url = isEditing ? `/api/plans/${editingPlanId}` : "/api/plans";
      const method = isEditing ? "PUT" : "POST";

      const body = {
        name: planName.trim(),
        visibility,
        sharedWith,
        parentId: parentPlanId || undefined
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save document");

      toast.success(isEditing ? "Document updated" : "Document created");
      setPlanDialogOpen(false);

      if (isEditing) {
        load();
      } else {
        // Redirect to the new plan
        router.push(`/view-plan/${data.plan._id}`);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save document");
    }
  }

  async function deletePlan(id: string) {
    setDeletePlanId(id);
  }

  async function confirmDeletePlan() {
    if (!deletePlanId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/plans/${deletePlanId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete document");
      toast.success("Document deleted");
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete document");
    } finally {
      setIsDeleting(false);
      setDeletePlanId(null);
    }
  }

  function openAddPage(planId: string) {
    setEditingPageId(null);
    setCurrentPlanIdForPage(planId);
    setPageName("");
    setPageUrl("");
    setPageDialogOpen(true);
  }

  function openEditPage(page: PlanPage) {
    setEditingPageId(page._id);
    setCurrentPlanIdForPage(page.planId);
    setPageName(page.name);
    setPageUrl(page.url || "");
    setPageDialogOpen(true);
  }

  async function onPageSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pageName.trim() || !currentPlanIdForPage) return;
    try {
      const url = editingPageId ? `/api/plans/pages/${editingPageId}` : `/api/plans/${currentPlanIdForPage}/pages`;
      const method = editingPageId ? "PUT" : "POST";
      const body = { name: pageName.trim(), url: pageUrl.trim() || undefined };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save page");
      toast.success(editingPageId ? "Page updated" : "Page added");
      setPageDialogOpen(false);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save page");
    }
  }

  async function deletePage(pageId: string) {
    setDeletePageId(pageId);
  }

  async function confirmDeletePage() {
    if (!deletePageId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/plans/pages/${deletePageId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete page");
      toast.success("Page deleted");
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete page");
    } finally {
      setIsDeleting(false);
      setDeletePageId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  function renderPlanCard(node: PlanNode) {
    const creator = users.find((u: any) => u.userId === node.createdBy);

    return (
      <Card
        key={node._id}
        className="group relative hover:border-primary/50 transition-all duration-200 cursor-pointer overflow-hidden shadow-sm hover:shadow-md h-full"
        onClick={() => router.push(`/view-plan/${node._id}`)} // Redirect to full-page view
      >
        <CardContent className="p-5 flex flex-col h-full space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/5 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-lg truncate leading-none mb-1 group-hover:text-primary transition-colors">
                  {node.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {creator?.name || "Organisation"}
                  </span>
                  <span>•</span>
                  <span>{new Date(node.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => openEditPlan(node)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => deletePlan(node._id)}
                  >
                    Delete Document
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t mt-auto">
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider",
                node.visibility === "org" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                  node.visibility === "shared" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
              )}>
                {node.visibility}
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1 group-hover:text-primary transition-colors">
              View Document <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pt-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-background/50 backdrop-blur-sm p-6 rounded-2xl border shadow-sm sticky top-0 z-20">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-9 bg-background/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Created By</Label>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.filter((u: any) => u.userId).map((u: any) => (
                  <SelectItem key={u.userId} value={u.userId}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Date Range</Label>
            <Input
              type="date"
              className="bg-background/50"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <div className="flex items-end gap-2">
            <Button variant="outline" className="flex-1" onClick={() => {
              setSearchQuery("");
              setDateFilter("");
              setUserFilter("all");
            }}>
              Reset
            </Button>
            <Button className="flex-1 shadow-md hover:shadow-lg transition-all" onClick={load}>
              Apply Filters
            </Button>
          </div>
        </div>

        <Button className="rounded-xl" onClick={() => openAddPlan(null)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Document
        </Button>

        <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">{editingPlanId ? "Edit Document" : "Create Document"}</DialogTitle>
              <DialogDescription>
                {editingPlanId ? "Update the details for this document." : "Create a new document with a name and visibility settings."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onPlanSubmit} className="space-y-6 pt-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Document Title</Label>
                <Input
                  placeholder="e.g. Project Roadmap"
                  className="h-12 text-lg"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Visibility & Sharing</Label>
                <Select value={visibility} onValueChange={(v: any) => setVisibility(v)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="me">Only me (Private)</SelectItem>
                    <SelectItem value="org">Organisation (Everyone)</SelectItem>
                    <SelectItem value="shared">Share with specific members</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {visibility === "shared" && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-sm font-semibold">Select Members</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto p-3 border rounded-lg">
                    {users.filter((u: any) => u.userId).map((u: any) => (
                      <div key={u.userId} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`user-${u.userId}`}
                          checked={sharedWith.includes(u.userId)}
                          onChange={(e) => {
                            if (e.target.checked) setSharedWith([...sharedWith, u.userId]);
                            else setSharedWith(sharedWith.filter(id => id !== u.userId));
                          }}
                        />
                        <label htmlFor={`user-${u.userId}`} className="text-sm cursor-pointer">{u.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="pt-4">
                <Button type="submit" size="lg" className="w-full" disabled={!planName.trim()}>
                  {editingPlanId ? "Update Document" : "Create Document"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {plans.length === 0 ? (
          <div className="col-span-full border-2 border-dashed rounded-3xl py-24 text-center space-y-4 opacity-70">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <FolderTree className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-lg text-foreground">No documents found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or create a new document.</p>
            </div>
          </div>
        ) : (
          plans.map((node) => renderPlanCard(node))
        )}
      </div>

      <ConfirmDialog
        open={!!deletePlanId}
        onOpenChange={(open) => !open && setDeletePlanId(null)}
        title="Delete Document"
        description="Are you sure you want to delete this document and all nested folders/pages? This action cannot be undone."
        onConfirm={confirmDeletePlan}
        isLoading={isDeleting}
      />

      <ConfirmDialog
        open={!!deletePageId}
        onOpenChange={(open) => !open && setDeletePageId(null)}
        title="Delete Page"
        description="Are you sure you want to delete this page? This action cannot be undone."
        onConfirm={confirmDeletePage}
        isLoading={isDeleting}
      />
    </div>
  );
}
