"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FolderOpen, Search, LayoutGrid, List } from "lucide-react";
import { ProjectFolderCard } from "@/components/project-folder-card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";

export type ProjectFolderRow = {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  totalMonths: number | null;
  monthlyRecurringCost: number;
  assignedMembers?: { id: string; name: string }[];
  taskTotal?: number;
  taskDone?: number;
  isPinned?: boolean;
  isPinnedToSidebar?: boolean;
};

type Props = {
  projects: ProjectFolderRow[];
  /** When true (e.g. employee view), hide monthly cost on cards */
  hideCost?: boolean;
};

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "in_progress", label: "In Progress", statuses: ["planned", "active", "on_hold"] },
  { value: "completed", label: "Completed", statuses: ["completed"] },
  { value: "maintenance", label: "Maintenance", statuses: ["maintenance"] },
];

export function ProjectsFolderClient({ projects: initialProjects, hideCost }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("in_progress");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const filtered = useMemo(() => {
    let list = initialProjects;
    if (statusFilter !== "all") {
      const filter = STATUS_FILTERS.find((f) => f.value === statusFilter);
      if (filter?.statuses) {
        list = list.filter((p) => filter.statuses!.includes(p.status));
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [initialProjects, statusFilter, search]);

  const counts = useMemo(() => {
    const all = initialProjects.length;
    const inProgress = initialProjects.filter((p) =>
      ["planned", "active", "on_hold"].includes(p.status)
    ).length;
    const completed = initialProjects.filter((p) => p.status === "completed").length;
    const maintenance = initialProjects.filter((p) => p.status === "maintenance").length;
    return { all, inProgress, completed, maintenance };
  }, [initialProjects]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={statusFilter === f.value ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "rounded-lg h-8",
                statusFilter === f.value && "bg-muted font-medium"
              )}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
              {f.value === "all" && counts.all > 0 && (
                <span className="ml-1.5 text-muted-foreground">({counts.all})</span>
              )}
              {f.value === "in_progress" && counts.inProgress > 0 && (
                <span className="ml-1.5 text-muted-foreground">({counts.inProgress})</span>
              )}
              {f.value === "completed" && counts.completed > 0 && (
                <span className="ml-1.5 text-muted-foreground">({counts.completed})</span>
              )}
              {f.value === "maintenance" && counts.maintenance > 0 && (
                <span className="ml-1.5 text-muted-foreground">({counts.maintenance})</span>
              )}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-lg border-muted-foreground/20"
            />
          </div>
          <div className="flex rounded-lg border bg-muted/30 p-0.5">
            <Button
              variant={viewMode === "card" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("card")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/30 py-16 text-center">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-3 text-muted-foreground">
            {initialProjects.length === 0
              ? "No projects yet. Add a client and create a project."
              : "No projects match your search."}
          </p>
        </div>
      ) : viewMode === "list" ? (
        <div className="rounded-xl border divide-y animate-in fade-in duration-300">
          {filtered.map((p) => (
            <ProjectFolderCard
              key={p.id}
              id={p.id}
              clientId={p.clientId}
              clientName={p.clientName}
              name={p.name}
              status={p.status}
              endDate={p.endDate}
              totalMonths={p.totalMonths}
              monthlyRecurringCost={hideCost ? 0 : p.monthlyRecurringCost}
              hideCost={hideCost}
              assignedMembers={p.assignedMembers}
              taskTotal={p.taskTotal}
              taskDone={p.taskDone}
              isPinned={p.isPinned}
              isPinnedToSidebar={p.isPinnedToSidebar}
              variant="list"
              onEdit={() => router.push(`/dashboard/projects/clients/${p.clientId}/projects/${p.id}`)}
              onDelete={() => setDeleteId(p.id)}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-300">
          {filtered.map((p) => (
            <ProjectFolderCard
              key={p.id}
              id={p.id}
              clientId={p.clientId}
              clientName={p.clientName}
              name={p.name}
              status={p.status}
              endDate={p.endDate}
              totalMonths={p.totalMonths}
              monthlyRecurringCost={hideCost ? 0 : p.monthlyRecurringCost}
              hideCost={hideCost}
              assignedMembers={p.assignedMembers}
              taskTotal={p.taskTotal}
              taskDone={p.taskDone}
              isPinned={p.isPinned}
              isPinnedToSidebar={p.isPinnedToSidebar}
              variant="card"
              onEdit={() => router.push(`/dashboard/projects/clients/${p.clientId}/projects/${p.id}`)}
              onDelete={() => setDeleteId(p.id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        onConfirm={async () => {
          if (!deleteId) return;
          setIsDeleting(true);
          try {
            const res = await fetch(`/api/projects/${deleteId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete project");
            toast.success("Project deleted");
            router.refresh();
          } catch (err) {
            toast.error("Failed to delete project");
          } finally {
            setIsDeleting(false);
            setDeleteId(null);
          }
        }}
        isLoading={isDeleting}
      />
    </div>
  );
}
