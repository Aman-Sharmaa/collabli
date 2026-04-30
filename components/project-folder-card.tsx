"use client";

import Link from "next/link";
import { FolderOpen, Eye, Calendar, IndianRupee, Pin, LayoutPanelLeft, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type ProjectFolderCardProps = {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  status: string;
  endDate?: string | null;
  totalMonths?: number | null;
  monthlyRecurringCost?: number;
  /** When true, hide cost row (e.g. for employee view) */
  hideCost?: boolean;
  actions?: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  /** Assigned team members for avatar display */
  assignedMembers?: { id: string; name: string }[];
  /** Task progress: total tasks */
  taskTotal?: number;
  /** Task progress: completed tasks */
  taskDone?: number;
  isPinned?: boolean;
  isPinnedToSidebar?: boolean;
  /** Layout variant */
  variant?: "card" | "list";
};

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(n: number | undefined) {
  if (n == null || n === 0) return "—";
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

export function ProjectFolderCard({
  id,
  clientId,
  clientName,
  name,
  status,
  endDate,
  totalMonths,
  monthlyRecurringCost = 0,
  hideCost,
  actions,
  assignedMembers = [],
  taskTotal = 0,
  taskDone = 0,
  variant = "card",
  isPinned = false,
  isPinnedToSidebar = false,
  onEdit,
  onDelete,
}: ProjectFolderCardProps) {
  const router = useRouter();
  const href = `/dashboard/projects/clients/${clientId}/projects/${id}`;
  const progressPct = taskTotal > 0 ? Math.round((taskDone / taskTotal) * 100) : 0;

  const content = (
    <>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 shrink-0 text-primary/70" />
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {name}
            </h3>
          </div>
          {clientName ? (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{clientName}</p>
          ) : null}
        </div>
        <span className="text-xs font-medium capitalize shrink-0 px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground">
          {status.replace("_", " ")}
        </span>
      </div>

      <div className="absolute top-3 right-3 z-20" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted/80">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            {(onEdit || actions) && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEdit) onEdit();
                }}
                className="gap-2 cursor-pointer"
              >
                <Pencil className="h-4 w-4" />
                <span>Edit Project</span>
              </DropdownMenuItem>
            )}
            {(onDelete) && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Project</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {taskTotal > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">
              {taskDone}/{taskTotal} completed
            </span>
            <span className="font-medium text-foreground">{progressPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2 mt-auto">
        {assignedMembers.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground shrink-0">Assigned to:</span>
            <div className="flex -space-x-2">
              {assignedMembers.slice(0, 4).map((m) => (
                <Avatar key={m.id} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {m.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {assignedMembers.length > 4 && (
                <span className="pl-2 text-xs text-muted-foreground">
                  +{assignedMembers.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>Deadline: {endDate ? formatDate(endDate) : "—"}</span>
        </div>
        {!hideCost && monthlyRecurringCost > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <IndianRupee className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="font-medium text-foreground tabular-nums">
              {formatCurrency(monthlyRecurringCost)}/mo
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
          View
          <Eye className="h-4 w-4" />
        </span>
      </div>
    </>
  );

  if (variant === "list") {
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors group",
          "flex-wrap sm:flex-nowrap"
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 shrink-0 text-primary/70" />
            <span className="font-medium truncate group-hover:text-primary">{name}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{clientName}</p>
        </div>
        {taskTotal > 0 && (
          <span className="text-xs text-muted-foreground shrink-0">
            {taskDone}/{taskTotal}
          </span>
        )}
        <div className="flex items-center gap-2 shrink-0">
          {assignedMembers.slice(0, 3).map((m) => (
            <Avatar key={m.id} className="h-6 w-6 border border-background">
              <AvatarFallback className="text-[10px]">{m.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {endDate ? formatDate(endDate) : "—"}
        </span>
        <span className="text-xs capitalize text-muted-foreground shrink-0">
          {status.replace("_", " ")}
        </span>
      </Link>
    );
  }

  return (
    <div className="group relative flex flex-col h-full min-h-[220px]">
      <Link href={href} className="flex-1 flex flex-col min-w-0">
        <div
          className={cn(
            "relative rounded-xl border bg-card overflow-hidden flex-1 flex flex-col p-4",
            "shadow-sm hover:shadow-md transition-all duration-200 ease-out",
            "hover:border-primary/30 hover:-translate-y-0.5 active:translate-y-0"
          )}
        >
          {content}
        </div>
      </Link>
      {actions ? (
        <div
          className="absolute bottom-3 right-3 flex items-center gap-1 z-10"
          onClick={(e) => e.preventDefault()}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}
