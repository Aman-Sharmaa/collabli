"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ClipboardList,
  Loader2,
  MoreHorizontal,
  Plus,
  X,
  MessageSquare,
  ArrowUpDown,
  CalendarDays,
  LayoutGrid,
  CheckCircle2,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Send,
  Reply,
  CornerDownRight,
  Zap,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RichTextEditor } from "@/components/rich-text-editor";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────
type Assignee = { id: string; name: string; email: string; avatarUrl?: string | null };
type SprintOption = { id: string; name: string; startDate: string | null; endDate: string | null; status: "planned" | "active" | "completed" };
type Comment = {
  id: string;
  taskId: string;
  parentId: string | null;
  authorEmail: string;
  authorName: string;
  body: string;
  createdAt: string;
};
type Task = {
  id: string;
  project?: string | null;
  sprint?: string | null;
  parentTask?: string | null;
  title: string;
  description: string;
  type: "task" | "bug" | "social_media_planner";
  status:
    | "backlog"
    | "todo"
    | "in_progress"
    | "hold"
    | "staging"
    | "production"
    | "in_review"
    | "done"
    | "rejected";
  assignee: Assignee | null;
  assignees: Assignee[];
  reporter?: Assignee | null;
  startDate?: string | null;
  dueDate: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  order: number;
  projectName?: string;
  reportingManager?: { id: string; name: string; email: string } | null;
  commentCount?: number;
  socialMediaPlanner?: SocialMediaPlannerData | null;
};
type ProjectOption = { id: string; name: string };
type Employee = { id: string; name: string; email: string; avatarUrl?: string | null };
type SocialMediaProgressStatus =
  | "content_planning"
  | "script_ready"
  | "design_ready"
  | "scheduled"
  | "posted"
  | "performance_tracking"
  | "completed";
type SocialMediaPlannerData = {
  platforms: string[];
  pagesAccounts: string[];
  linkedProjectIds: string[];
  postTypes: string[];
  goalTargets?: {
    targetViews?: number | null;
    targetLikes?: number | null;
    targetComments?: number | null;
    targetShares?: number | null;
    targetFollowersGain?: number | null;
  };
  contentPlan?: {
    richText?: string;
    captionIdea?: string;
    hook?: string;
    hashtags?: string;
    callToAction?: string;
  };
  postingDate?: string | null;
  postingTime?: string | null;
  progressStatus?: SocialMediaProgressStatus;
};
type SocialMediaPlannerFormState = {
  platforms: string[];
  pagesAccounts: string[];
  linkedProjectIds: string[];
  postTypes: string[];
  targetViews: string;
  targetLikes: string;
  targetComments: string;
  targetShares: string;
  targetFollowersGain: string;
  contentPlanRichText: string;
  captionIdea: string;
  hook: string;
  hashtags: string;
  callToAction: string;
  postDate: string;
  postTime: string;
  progressStatus: SocialMediaProgressStatus;
};

// ── Constants ──────────────────────────────────────
const STATUSES: { id: Task["status"]; label: string; dot: string; bg: string; border: string }[] = [
  { id: "backlog", label: "Backlog", dot: "bg-gray-400", bg: "bg-gray-50", border: "border-gray-200" },
  { id: "in_progress", label: "Inprogress", dot: "bg-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
  { id: "hold", label: "Hold", dot: "bg-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
  { id: "in_review", label: "Inreview", dot: "bg-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  { id: "done", label: "Completed", dot: "bg-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" },
  { id: "rejected", label: "Rejected", dot: "bg-rose-500", bg: "bg-rose-50", border: "border-rose-200" },
];

const PRIORITIES = [
  { id: "low", label: "Low", pillClass: "bg-slate-100 text-slate-700" },
  { id: "medium", label: "Normal", pillClass: "bg-blue-100 text-blue-700" },
  { id: "high", label: "High", pillClass: "bg-amber-100 text-amber-700" },
  { id: "urgent", label: "Urgent", pillClass: "bg-red-100 text-red-700" },
] as const;

const TASK_TYPES = [
  { id: "task", label: "Task", pillClass: "bg-slate-100 text-slate-700" },
  { id: "bug", label: "Bug", pillClass: "bg-rose-100 text-rose-700" },
  { id: "social_media_planner", label: "Social Media Planner", pillClass: "bg-violet-100 text-violet-700" },
] as const;

const SOCIAL_PLATFORM_OPTIONS = [
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "youtube", label: "YouTube" },
  { id: "twitter_x", label: "Twitter/X" },
  { id: "facebook", label: "Facebook" },
  { id: "multiple", label: "Multiple" },
] as const;

const SOCIAL_POST_TYPE_OPTIONS = [
  { id: "reel", label: "Reel" },
  { id: "carousel", label: "Carousel" },
  { id: "image_post", label: "Image Post" },
  { id: "story", label: "Story" },
  { id: "video", label: "Video" },
  { id: "thread", label: "Thread" },
] as const;

const SOCIAL_PROGRESS_STATUS_OPTIONS: Array<{ id: SocialMediaProgressStatus; label: string }> = [
  { id: "content_planning", label: "Content Planning" },
  { id: "script_ready", label: "Script Ready" },
  { id: "design_ready", label: "Design Ready" },
  { id: "scheduled", label: "Scheduled" },
  { id: "posted", label: "Posted" },
  { id: "performance_tracking", label: "Performance Tracking" },
  { id: "completed", label: "Completed" },
];

function getTaskTicket(taskId: string) {
  return `KLP-${taskId.slice(-6).toUpperCase()}`;
}

function normalizeBoardStatus(status: Task["status"]): Task["status"] {
  if (status === "todo") return "backlog";
  if (status === "staging" || status === "production") return "in_review";
  return status;
}

function getDefaultSocialMediaPlannerState(): SocialMediaPlannerFormState {
  return {
    platforms: [],
    pagesAccounts: [],
    linkedProjectIds: [],
    postTypes: [],
    targetViews: "",
    targetLikes: "",
    targetComments: "",
    targetShares: "",
    targetFollowersGain: "",
    contentPlanRichText: "",
    captionIdea: "",
    hook: "",
    hashtags: "",
    callToAction: "",
    postDate: "",
    postTime: "",
    progressStatus: "content_planning",
  };
}

function toStringNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

function fromTaskSocialMediaPlanner(data?: SocialMediaPlannerData | null): SocialMediaPlannerFormState {
  const initial = getDefaultSocialMediaPlannerState();
  if (!data) return initial;
  return {
    platforms: Array.isArray(data.platforms) ? data.platforms : [],
    pagesAccounts: Array.isArray(data.pagesAccounts) ? data.pagesAccounts : [],
    linkedProjectIds: Array.isArray(data.linkedProjectIds) ? data.linkedProjectIds : [],
    postTypes: Array.isArray(data.postTypes) ? data.postTypes : [],
    targetViews: toStringNumber(data.goalTargets?.targetViews),
    targetLikes: toStringNumber(data.goalTargets?.targetLikes),
    targetComments: toStringNumber(data.goalTargets?.targetComments),
    targetShares: toStringNumber(data.goalTargets?.targetShares),
    targetFollowersGain: toStringNumber(data.goalTargets?.targetFollowersGain),
    contentPlanRichText: data.contentPlan?.richText || "",
    captionIdea: data.contentPlan?.captionIdea || "",
    hook: data.contentPlan?.hook || "",
    hashtags: data.contentPlan?.hashtags || "",
    callToAction: data.contentPlan?.callToAction || "",
    postDate: data.postingDate ? new Date(data.postingDate).toISOString().slice(0, 10) : "",
    postTime: data.postingTime || "",
    progressStatus: data.progressStatus || "content_planning",
  };
}

function toNullableNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed);
}

function toPayloadSocialMediaPlanner(state: SocialMediaPlannerFormState) {
  return {
    platforms: state.platforms,
    pagesAccounts: state.pagesAccounts,
    linkedProjectIds: state.linkedProjectIds,
    postTypes: state.postTypes,
    goalTargets: {
      targetViews: toNullableNumber(state.targetViews),
      targetLikes: toNullableNumber(state.targetLikes),
      targetComments: toNullableNumber(state.targetComments),
      targetShares: toNullableNumber(state.targetShares),
      targetFollowersGain: toNullableNumber(state.targetFollowersGain),
    },
    contentPlan: {
      richText: state.contentPlanRichText,
      captionIdea: state.captionIdea,
      hook: state.hook,
      hashtags: state.hashtags,
      callToAction: state.callToAction,
    },
    postingDate: state.postDate || null,
    postingTime: state.postTime || null,
    progressStatus: state.progressStatus,
  };
}

// ── Main Component ─────────────────────────────────
export function OrgTodoClient({ userRole }: { userRole: "admin" | "employee" }) {
  const isAdmin = userRole === "admin";
  const router = useRouter();
  const searchParams = useSearchParams();

  // Data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sprints, setSprints] = useState<SprintOption[]>([]);
  const [loading, setLoading] = useState(true);

  // View mode
  const [viewMode, setViewMode] = useState<"board" | "calendar">("board");

  // Filters
  const [filterProject, setFilterProject] = useState("__all__");
  const [filterPriority, setFilterPriority] = useState("__all__");
  const [filterMember, setFilterMember] = useState(isAdmin ? "__all__" : "__me__");
  const [filterSprint, setFilterSprint] = useState("__all__");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "date" | "priority">("default");
  const [isOutsider, setIsOutsider] = useState(false);

  // Drag state
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<Task["status"] | null>(null);

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [addDefaultStatus, setAddDefaultStatus] = useState<Task["status"]>("backlog");
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editInitialTab, setEditInitialTab] = useState<"details" | "comments" | "subtasks">("details");
  const [editViewMode, setEditViewMode] = useState<"modal" | "full">("modal");
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sprintDialogOpen, setSprintDialogOpen] = useState(false);

  // Track whether initial meta (projects, employees) has been loaded
  const [metaLoaded, setMetaLoaded] = useState(false);

  // Fetch isOutsider flag on mount
  useEffect(() => {
    if (isAdmin) return;
    fetch("/api/me", { cache: "no-store" })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.user?.isOutsider) {
          setIsOutsider(true);
          setFilterMember("__me__");
        }
      })
      .catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("org_todo_active_tab");
    if (saved === "details" || saved === "comments" || saved === "subtasks") {
      setEditInitialTab(saved);
    }
  }, []);

  const setTicketInUrl = useCallback((ticket: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (ticket) params.set("ticket", ticket);
    else params.delete("ticket");
    const query = params.toString();
    router.replace(query ? `/dashboard/todo?${query}` : "/dashboard/todo", { scroll: false });
  }, [router, searchParams]);

  const openEditTaskModal = useCallback((task: Task, tab: "details" | "comments" | "subtasks" = editInitialTab) => {
    setViewTask(null);
    setEditTask(task);
    setEditInitialTab(tab);
    setEditViewMode("modal");
    setTicketInUrl(null);
  }, [editInitialTab, setTicketInUrl]);

  // ── Load tasks (+ meta on first call) ───────────
  const refreshTasks = useCallback(async (includeMeta = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterProject !== "__all__") params.set("projectId", filterProject);
      if (filterMember === "__me__") params.set("assigneeId", "__me__");
      else if (filterMember !== "__all__") params.set("assigneeId", filterMember);
      if (filterPriority !== "__all__") params.set("priority", filterPriority);
      if (filterSprint !== "__all__") params.set("sprintId", filterSprint);
      if (includeMeta) params.set("include", "meta");

      const res = await fetch(`/api/org-tasks?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Failed to load tasks");
        return;
      }
      const data = await res.json();
      setTasks(data.tasks || []);

      // Populate filter options from the same response
      if (data.projects) setProjects(data.projects);
      if (data.employees) setEmployees(data.employees);
      if (data.sprints) setSprints(data.sprints);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filterProject, filterPriority, filterMember, filterSprint]);

  // Initial load: fetch tasks + meta in one call
  useEffect(() => {
    if (!metaLoaded) {
      refreshTasks(true).then(() => setMetaLoaded(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subsequent filter changes: fetch only tasks
  useEffect(() => {
    if (metaLoaded) {
      refreshTasks(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterProject, filterPriority, filterMember, filterSprint]);

  useEffect(() => {
    const ticket = searchParams?.get("ticket");
    if (!ticket || tasks.length === 0) return;
    const match = tasks.find((t) => getTaskTicket(t.id) === ticket);
    if (match) {
      const tabParam = searchParams?.get("tab");
      const nextTab =
        tabParam === "comments" || tabParam === "subtasks" ? tabParam : "details";
      setEditTask(match);
      setEditInitialTab(nextTab);
      setEditViewMode("full");
    }
  }, [searchParams, tasks]);

  const openTaskInNewTab = useCallback(
    (task: Task, tab: "details" | "comments" | "subtasks" = "details") => {
      const params = new URLSearchParams();
      params.set("ticket", getTaskTicket(task.id));
      if (tab !== "details") params.set("tab", tab);
      window.open(`/dashboard/todo?${params.toString()}`, "_blank", "noopener,noreferrer");
    },
    []
  );

  // ── Filtered & sorted tasks ──────────────────────
  const filteredTasks = tasks.filter((t) => {
    if (!search.trim()) return true;
    const descText = t.description ? t.description.replace(/<[^>]+>/g, " ") : "";
    return (
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      descText.toLowerCase().includes(search.toLowerCase())
    );
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "date") {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return da - db;
    }
    if (sortBy === "priority") {
      const order = { urgent: 0, high: 1, medium: 2, low: 3 };
      return (order[a.priority] ?? 2) - (order[b.priority] ?? 2);
    }
    return (a.order ?? 0) - (b.order ?? 0);
  });

  const subtaskStatsByParent = useMemo(() => {
    return sortedTasks.reduce<Record<string, { total: number; completed: number }>>((acc, t) => {
      if (!t.parentTask) return acc;
      if (!acc[t.parentTask]) acc[t.parentTask] = { total: 0, completed: 0 };
      acc[t.parentTask].total += 1;
      if (t.status === "done") acc[t.parentTask].completed += 1;
      return acc;
    }, {});
  }, [sortedTasks]);

  const tasksByStatus = STATUSES.map((s) => ({
    ...s,
    // Board should show parent tasks only; subtasks are managed in the Subtasks tab.
    tasks: sortedTasks.filter((t) => normalizeBoardStatus(t.status) === s.id && !t.parentTask),
  }));

  // ── Task actions ─────────────────────────────────
  async function handleUpdateStatus(taskId: string, newStatus: Task["status"]) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { toast.error("Failed to update"); return; }
      const data = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...data.task } : t)));
    } catch { toast.error("Failed to update"); }
  }

  async function handleAddTask(form: any) {
    setSaving(true);
    try {
      const res = await fetch("/api/org-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: form.projectId || undefined,
          sprintId: form.sprintId || undefined,
          title: form.title.trim(),
          description: form.description?.trim() || undefined,
          type: form.type || "task",
          status: form.status || "backlog",
          assigneeIds: form.assigneeIds || [],
          reporterId: form.reporterId || undefined,
          startDate: form.startDate || undefined,
          dueDate: form.dueDate || undefined,
          priority: form.priority || "medium",
          socialMediaPlanner:
            form.type === "social_media_planner" ? form.socialMediaPlanner : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to create task"); return; }
      toast.success("Task created");
      setAddOpen(false);
      refreshTasks();
    } catch { toast.error("Failed to create task"); }
    finally { setSaving(false); }
  }

  async function handleSaveEdit(form: any) {
    if (!editTask) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${editTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description?.trim() || undefined,
          type: form.type || "task",
          status: form.status,
          assigneeIds: form.assigneeIds || [],
          reporterId: form.reporterId || null,
          startDate: form.startDate || undefined,
          dueDate: form.dueDate || undefined,
          priority: form.priority,
          projectId: form.projectId || null,
          sprintId: form.sprintId || null,
          socialMediaPlanner:
            form.type === "social_media_planner" ? form.socialMediaPlanner : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to update"); return; }
      toast.success("Task updated");
      setEditTask(null);
      setTasks((prev) => prev.map((t) => (t.id === editTask.id ? { ...t, ...data.task } : t)));
      refreshTasks();
    } catch { toast.error("Failed to update"); }
    finally { setSaving(false); }
  }

  async function confirmDeleteTask() {
    if (!deleteTaskId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${deleteTaskId}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to delete"); return; }
      setEditTask(null);
      setTasks((prev) => prev.filter((t) => t.id !== deleteTaskId));
      toast.success("Task deleted");
    } catch { toast.error("Failed to delete"); }
    finally { setIsDeleting(false); setDeleteTaskId(null); }
  }

  // ── Drag handlers ────────────────────────────────
  function handleDragStart(e: React.DragEvent, task: Task) {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
    (e.target as HTMLElement).style.opacity = "0.5";
  }
  function handleDragEnd(e: React.DragEvent) {
    setDraggedTask(null); setDragOverStatus(null);
    (e.target as HTMLElement).style.opacity = "1";
  }
  function handleDragOver(e: React.DragEvent, status: Task["status"]) {
    e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverStatus(status);
  }
  function handleDrop(e: React.DragEvent, newStatus: Task["status"]) {
    e.preventDefault(); setDragOverStatus(null);
    const taskId = e.dataTransfer.getData("text/plain");
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) handleUpdateStatus(taskId, newStatus);
  }

  // ── Active filter count (Only Mine doesn't count since it's a toggle) ──
  const activeFilterCount = [
    filterProject !== "__all__",
    filterPriority !== "__all__",
    filterMember !== "__all__" && filterMember !== "__me__",
    filterSprint !== "__all__",
  ].filter(Boolean).length;

  // ── Render ───────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] -m-2">
      {/* Header */}
      <div className="shrink-0 px-4 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-primary" />
              Organisation Tasks
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {tasks.length} total tasks across all projects
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex rounded-xl border border-neutral-200 overflow-hidden">
              <button
                className={cn("px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors", viewMode === "board" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50")}
                onClick={() => setViewMode("board")}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Board
              </button>
              <button
                className={cn("px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors", viewMode === "calendar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50")}
                onClick={() => setViewMode("calendar")}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Calendar
              </button>
            </div>
            <Button
              className="rounded-xl gap-2"
              onClick={() => { setAddDefaultStatus("backlog"); setAddOpen(true); }}
            >
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Only Mine toggle — hidden for outsiders (always forced) */}
          {!isOutsider && (
          <Button
            variant={filterMember === "__me__" ? "default" : "outline"}
            size="sm"
            className="h-9 rounded-xl gap-1.5 border-neutral-200 shrink-0"
            onClick={() => setFilterMember(filterMember === "__me__" ? "__all__" : "__me__")}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Only Mine
          </Button>
          )}

          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-xl border-neutral-200 bg-white"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>

          {/* Project filter */}
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-[180px] h-9 rounded-xl border-neutral-200 text-sm">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority filter */}
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[150px] h-9 rounded-xl border-neutral-200 text-sm">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Priorities</SelectItem>
              {PRIORITIES.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sprint filter */}
          <Select value={filterSprint} onValueChange={setFilterSprint}>
            <SelectTrigger className="w-[170px] h-9 rounded-xl border-neutral-200 text-sm">
              <SelectValue placeholder="All Sprints" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Sprints</SelectItem>
              <SelectItem value="__none__">No Sprint</SelectItem>
              {sprints.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", s.status === "active" ? "bg-emerald-500" : s.status === "planned" ? "bg-blue-400" : "bg-neutral-300")} />
                    {s.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Manage sprints (admin) */}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl gap-1.5 border-neutral-200 shrink-0"
              onClick={() => setSprintDialogOpen(true)}
            >
              <Zap className="h-3.5 w-3.5" />
              Sprints
            </Button>
          )}

          {/* Team member filter — hidden for outsiders */}
          {!isOutsider && (
          <Select value={filterMember} onValueChange={setFilterMember}>
            <SelectTrigger className="w-[180px] h-9 rounded-xl border-neutral-200 text-sm">
              <SelectValue placeholder="All Members" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__me__">My Tasks</SelectItem>
              <SelectItem value="__all__">All Members</SelectItem>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          )}

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 rounded-xl gap-1.5 border-neutral-200">
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl w-48">
              <DropdownMenuItem onClick={() => setSortBy("default")}>Default</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("date")}>Due date</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("priority")}>Priority</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl gap-1 text-muted-foreground hover:text-foreground"
              onClick={() => { setFilterProject("__all__"); setFilterPriority("__all__"); setFilterMember(isAdmin && !isOutsider ? "__all__" : "__me__"); setFilterSprint("__all__"); }}
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Board / Calendar */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : viewMode === "calendar" ? (
        <div className="flex-1 overflow-auto scrollbar-none min-h-0 px-4">
          <TaskCalendarView
            tasks={sortedTasks}
            onEditTask={(task) => setEditTask(task)}
            onAddTask={(date) => {
              setAddDefaultStatus("backlog");
              setAddOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="flex-1 w-full overflow-x-auto overflow-y-hidden scrollbar-none min-h-0 px-4">
          <div className="flex gap-4 h-full min-w-max pb-2">
            {tasksByStatus.map((col) => (
              <div
                key={col.id}
                className={cn(
                  "flex-shrink-0 w-[336px] rounded-2xl border flex flex-col transition-all duration-200",
                  dragOverStatus === col.id
                    ? "border-primary bg-primary/5 border-2 shadow-lg shadow-primary/10"
                    : "border-neutral-200 bg-neutral-50/50"
                )}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={() => setDragOverStatus(null)}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column header */}
                <div className={cn(
                  "px-4 py-3 border-b flex items-center justify-between gap-2 shrink-0 rounded-t-2xl",
                  col.bg, col.border
                )}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", col.dot)} />
                    <span className="font-semibold text-sm text-neutral-800">{col.label}</span>
                    <span className="rounded-full bg-white/80 border border-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600 tabular-nums">
                      {col.tasks.length}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg shrink-0 hover:bg-white/60"
                    onClick={() => { setAddDefaultStatus(col.id); setAddOpen(true); }}
                  >
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>

                {/* Scrollable tasks */}
                <div className="flex-1 overflow-y-auto scrollbar-none min-h-0 p-3">
                  <div className="space-y-3">
                    {col.tasks.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
                          <Plus className="h-4 w-4" />
                        </div>
                        <p className="text-xs">No tasks yet</p>
                      </div>
                    )}
                    {col.tasks.map((task) => (
                      <OrgTaskCard
                        key={task.id}
                        task={task}
                        subtaskStats={subtaskStatsByParent[task.id]}
                        onMove={(status) => handleUpdateStatus(task.id, status)}
                        onView={() => {
                          openEditTaskModal(task);
                        }}
                        onEdit={() => {
                          openEditTaskModal(task);
                        }}
                        onOpenSubtasks={() => {
                          openEditTaskModal(task, "subtasks");
                        }}
                        onOpenFullPage={() => {
                          openTaskInNewTab(task, "details");
                        }}
                        onDelete={() => setDeleteTaskId(task.id)}
                        canDelete={isAdmin}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        isDragging={draggedTask?.id === task.id}
                      />
                    ))}
                  </div>
                </div>

                {/* Fixed add button */}
                <div className="px-3 py-2.5 border-t border-neutral-200 shrink-0 bg-white/80 backdrop-blur-sm rounded-b-2xl">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center gap-2 text-muted-foreground hover:text-neutral-900 hover:bg-neutral-100 rounded-xl h-9"
                    onClick={() => { setAddDefaultStatus(col.id); setAddOpen(true); }}
                  >
                    <Plus className="h-4 w-4" />
                    Add task
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Task Dialog */}
      <OrgAddTaskDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultStatus={addDefaultStatus}
        employees={employees}
        projects={projects}
        sprints={sprints}
        onAdd={handleAddTask}
        saving={saving}
      />

      {viewTask && (
        <TaskViewDialog
          task={viewTask}
          open={!!viewTask}
          onOpenChange={(open) => {
            if (!open) setViewTask(null);
          }}
          onEdit={() => openEditTaskModal(viewTask, "details")}
        />
      )}

      {/* Edit Task Dialog */}
      {editTask && (
        <OrgEditTaskDialog
          task={editTask}
          allTasks={tasks}
          employees={employees}
          projects={projects}
          sprints={sprints}
          initialTab={editInitialTab}
          viewMode={editViewMode}
          open={!!editTask}
          onOpenChange={(open) => {
            if (!open) {
              setEditTask(null);
              setEditViewMode("modal");
              setTicketInUrl(null);
              // Refresh to update comment counts on cards
              refreshTasks(false);
            }
          }}
          onSave={handleSaveEdit}
          onTaskMutated={() => refreshTasks(false)}
          onOpenTaskFullPage={(selectedTask, tab = "details") => {
            openTaskInNewTab(selectedTask, tab);
          }}
          onTabChange={(tab) => {
            setEditInitialTab(tab);
            if (typeof window !== "undefined") {
              window.localStorage.setItem("org_todo_active_tab", tab);
            }
          }}
          onDelete={() => setDeleteTaskId(editTask.id)}
          canDelete={isAdmin}
          saving={saving}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTaskId}
        onOpenChange={(open) => !open && setDeleteTaskId(null)}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={confirmDeleteTask}
        isLoading={isDeleting}
      />

      {/* Sprint management dialog (admin) */}
      {isAdmin && (
        <SprintManagerDialog
          open={sprintDialogOpen}
          onOpenChange={setSprintDialogOpen}
          sprints={sprints}
          onSprintsChange={(updated) => setSprints(updated)}
        />
      )}
    </div>
  );
}

// ── Task Card (with project name badge) ────────────
function OrgTaskCard({
  task,
  subtaskStats,
  onMove,
  onView,
  onEdit,
  onOpenSubtasks,
  onOpenFullPage,
  onDelete,
  canDelete,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  task: Task;
  subtaskStats?: { total: number; completed: number };
  onMove: (status: Task["status"]) => void;
  onView: () => void;
  onEdit: () => void;
  onOpenSubtasks: () => void;
  onOpenFullPage: () => void;
  onDelete: () => void;
  canDelete?: boolean;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
}) {
  const priority = PRIORITIES.find((p) => p.id === task.priority);
  const taskType = TASK_TYPES.find((t) => t.id === (task.type ?? "task"));
  const hasSubtasks = !!subtaskStats && subtaskStats.total > 0;
  const progressPct = hasSubtasks
    ? Math.round((subtaskStats.completed / Math.max(1, subtaskStats.total)) * 100)
    : task.status === "done"
      ? 100
      : task.status === "in_review"
        ? 75
        : task.status === "in_progress"
          ? 50
          : 5;
  const dueLabel = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", { day: "numeric", month: "long" })
    : null;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, task)}
      onDragEnd={onDragEnd}
      role="button"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(e) => e.key === "Enter" && onView()}
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-3.5 text-left shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-2 group",
        isDragging && "opacity-50"
      )}
    >
      {/* Top row: priority + project */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {taskType && (
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0", taskType.pillClass)}>
              {taskType.label}
            </span>
          )}
          {priority && (
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0", priority.pillClass)}>
              {priority.label}
            </span>
          )}
          {task.projectName && task.projectName !== "—" && (
            <span className="rounded-full bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 text-[10px] font-medium truncate max-w-[120px]">
              {task.projectName}
            </span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-lg shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl w-48">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>View</DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            {STATUSES.map((s) =>
              s.id !== task.status ? (
                <DropdownMenuItem key={s.id} onClick={(e) => { e.stopPropagation(); onMove(s.id); }}>
                  Move to {s.label}
                </DropdownMenuItem>
              ) : null
            )}
            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title */}
      <p
        className={cn(
          "font-semibold text-sm text-neutral-900 line-clamp-2 mb-1",
          task.status === "done" && "line-through opacity-50"
        )}
      >
        {task.title}
      </p>
      <div className="mb-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenFullPage();
          }}
          className="text-[10px] text-primary hover:underline"
        >
          {getTaskTicket(task.id)}
        </button>
      </div>

      {/* Description preview */}
      {task.description && task.description !== "<p></p>" && (
        <div
          className="text-xs text-muted-foreground line-clamp-2 mb-3 [&_a]:text-primary [&_a]:underline"
          dangerouslySetInnerHTML={{
            __html: task.description.includes("<") ? task.description : `<p>${task.description}</p>`,
          }}
        />
      )}

      {hasSubtasks && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenSubtasks();
          }}
          className="text-xs font-medium text-primary hover:underline mb-2"
        >
          {subtaskStats.completed}/{subtaskStats.total}
        </button>
      )}

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-neutral-100 overflow-hidden mb-3">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            task.status === "done" ? "bg-emerald-500" :
            task.status === "in_review" ? "bg-amber-500" :
            task.status === "in_progress" ? "bg-blue-500" : "bg-neutral-200"
          )}
          style={{
            width: `${progressPct}%`,
          }}
        />
      </div>

      {/* Footer: assignees + meta */}
      <div className="flex items-center justify-between gap-2">
        {(task.assignees?.length > 0) ? (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1.5">
              {task.assignees.slice(0, 3).map((a) => (
                <Avatar key={a.id} className="h-5 w-5 border-2 border-white" title={a.name}>
                  {a.avatarUrl ? <AvatarImage src={a.avatarUrl} alt={a.name} /> : null}
                  <AvatarFallback className="text-[9px] bg-neutral-200 text-neutral-700">
                    {a.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {task.assignees.length > 3 && (
              <span className="text-[10px] text-muted-foreground ml-1">+{task.assignees.length - 3}</span>
            )}
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground">Unassigned</span>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          {dueLabel && (
            <span className="flex items-center gap-1 text-xs">
              <Clock3 className="h-3 w-3" />
              {dueLabel}
            </span>
          )}
          <span className="flex items-center gap-0.5 text-[10px]"><MessageSquare className="h-3 w-3" /> {task.commentCount || 0}</span>
        </div>
      </div>
    </div>
  );
}

function TaskViewDialog({
  task,
  open,
  onOpenChange,
  onEdit,
}: {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}) {
  const taskType = TASK_TYPES.find((t) => t.id === (task.type ?? "task"));
  const priority = PRIORITIES.find((p) => p.id === task.priority);
  const social = task.socialMediaPlanner;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{task.title}</span>
            {taskType ? (
              <Badge variant="secondary" className={cn("text-[10px]", taskType.pillClass)}>
                {taskType.label}
              </Badge>
            ) : null}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 text-xs">
            {priority ? (
              <Badge variant="secondary" className={cn("text-[10px]", priority.pillClass)}>
                {priority.label}
              </Badge>
            ) : null}
            <Badge variant="outline">{STATUSES.find((s) => s.id === task.status)?.label || task.status}</Badge>
            {task.projectName && task.projectName !== "—" ? <Badge variant="outline">{task.projectName}</Badge> : null}
            <Badge variant="outline">{getTaskTicket(task.id)}</Badge>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Description</Label>
            <div
              className="mt-1 text-sm [&_a]:text-primary [&_a]:underline"
              dangerouslySetInnerHTML={{
                __html: task.description && task.description !== "<p></p>"
                  ? (task.description.includes("<") ? task.description : `<p>${task.description}</p>`)
                  : "<p>No description</p>",
              }}
            />
          </div>

          {task.type === "social_media_planner" && social && (
            <div className="rounded-xl border p-4 space-y-3 bg-violet-50/30">
              <h3 className="text-sm font-semibold">Social Media Planner</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Platforms</Label>
                  <p>{(social.platforms || []).join(", ") || "—"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Pages / Accounts</Label>
                  <p>{(social.pagesAccounts || []).join(", ") || "—"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Post Types</Label>
                  <p>{(social.postTypes || []).join(", ") || "—"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Planner Status</Label>
                  <p>{SOCIAL_PROGRESS_STATUS_OPTIONS.find((s) => s.id === social.progressStatus)?.label || "—"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Post Date / Time</Label>
                  <p>{social.postingDate ? new Date(social.postingDate).toLocaleDateString("en-IN") : "—"} {social.postingTime || ""}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Close
          </Button>
          <Button onClick={onEdit} className="rounded-xl">
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Multi-select Assignees Component ───────────────
function AssigneeMultiSelect({
  employees,
  selected,
  onChange,
}: {
  employees: Employee[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = employees.filter(
    (e) => e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder="Search team members..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="rounded-xl h-8 text-sm"
      />
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((id) => {
            const emp = employees.find((e) => e.id === id);
            return emp ? (
              <Badge
                key={id}
                variant="secondary"
                className="gap-1 pr-1 rounded-lg text-xs cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors"
                onClick={() => toggle(id)}
              >
                {emp.name}
                <X className="h-3 w-3" />
              </Badge>
            ) : null;
          })}
        </div>
      )}
      <div className="max-h-[160px] overflow-y-auto border rounded-xl divide-y">
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">No members found</p>
        )}
        {filtered.map((e) => (
          <button
            key={e.id}
            type="button"
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors",
              selected.includes(e.id) && "bg-primary/5"
            )}
            onClick={() => toggle(e.id)}
          >
            <div className={cn(
              "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
              selected.includes(e.id) ? "bg-primary border-primary text-white" : "border-neutral-300"
            )}>
              {selected.includes(e.id) && (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <Avatar className="h-5 w-5">
              {e.avatarUrl ? <AvatarImage src={e.avatarUrl} alt={e.name} /> : null}
              <AvatarFallback className="text-[9px] bg-neutral-200 text-neutral-700">{e.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <span className="block truncate font-medium text-sm">{e.name}</span>
              <span className="block truncate text-[11px] text-muted-foreground">{e.email}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function OptionMultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Search...",
}: {
  options: Array<{ id: string; label: string }>;
  selected: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="rounded-xl h-8 text-sm"
      />
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((id) => {
            const selectedOption = options.find((option) => option.id === id);
            return selectedOption ? (
              <Badge
                key={id}
                variant="secondary"
                className="gap-1 pr-1 rounded-lg text-xs cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors"
                onClick={() => toggle(id)}
              >
                {selectedOption.label}
                <X className="h-3 w-3" />
              </Badge>
            ) : null;
          })}
        </div>
      )}
      <div className="max-h-[160px] overflow-y-auto border rounded-xl divide-y">
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">No options found</p>
        )}
        {filtered.map((option) => (
          <button
            key={option.id}
            type="button"
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors",
              selected.includes(option.id) && "bg-primary/5"
            )}
            onClick={() => toggle(option.id)}
          >
            <div className={cn(
              "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
              selected.includes(option.id) ? "bg-primary border-primary text-white" : "border-neutral-300"
            )}>
              {selected.includes(option.id) && (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StringTagInput({
  value,
  onChange,
  placeholder = "Add and press Enter",
}: {
  value: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const next = input.trim();
    if (!next) return;
    if (!value.includes(next)) onChange([...value, next]);
    setInput("");
  };

  const removeTag = (tag: string) => onChange(value.filter((item) => item !== tag));

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="rounded-xl"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            }
          }}
        />
        <Button type="button" variant="outline" className="rounded-xl" onClick={addTag}>
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="gap-1 pr-1 rounded-lg text-xs cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors"
              onClick={() => removeTag(item)}
            >
              {item}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Add Task Dialog (full-size, matching Edit) ─────
function OrgAddTaskDialog({
  open,
  onOpenChange,
  defaultStatus,
  employees,
  projects,
  sprints,
  onAdd,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus: Task["status"];
  employees: Employee[];
  projects: ProjectOption[];
  sprints: SprintOption[];
  onAdd: (form: any) => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<Task["type"]>("task");
  const [status, setStatus] = useState(defaultStatus);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [reporterId, setReporterId] = useState("__none__");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [projectId, setProjectId] = useState("__none__");
  const [sprintId, setSprintId] = useState("__none__");
  const [socialMediaPlanner, setSocialMediaPlanner] = useState<SocialMediaPlannerFormState>(
    getDefaultSocialMediaPlannerState()
  );

  useEffect(() => {
    if (open) {
      setStatus(defaultStatus);
      setAssigneeIds([]);
      setReporterId("__none__");
      setSocialMediaPlanner(getDefaultSocialMediaPlannerState());
    }
  }, [open, defaultStatus]);

  function submit() {
    if (!title.trim()) { toast.error("Task name is required"); return; }
    if (assigneeIds.length === 0) { toast.error("At least one assignee is required"); return; }
    if (type !== "social_media_planner") {
      if (!startDate) { toast.error("Start date is required"); return; }
      if (!dueDate) { toast.error("End date is required"); return; }
    }
    onAdd({
      title, description, type, status, assigneeIds,
      reporterId: reporterId !== "__none__" ? reporterId : undefined,
      startDate, dueDate, priority,
      projectId: projectId !== "__none__" ? projectId : undefined,
      sprintId: sprintId !== "__none__" ? sprintId : undefined,
      socialMediaPlanner:
        type === "social_media_planner"
          ? toPayloadSocialMediaPlanner(socialMediaPlanner)
          : undefined,
    });
    setTitle(""); setDescription(""); setType("task"); setStatus(defaultStatus);
    setAssigneeIds([]); setStartDate(""); setDueDate("");
    setReporterId("__none__");
    setPriority("medium"); setProjectId("__none__"); setSprintId("__none__");
    setSocialMediaPlanner(getDefaultSocialMediaPlannerState());
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Task name <span className="text-red-500">*</span></Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" className="rounded-xl" />
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <RichTextEditor value={description} onChange={setDescription} placeholder="Add details, links, formatting..." minHeight="120px" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as Task["type"])}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{TASK_TYPES.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Task["status"])}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {type !== "social_media_planner" && (
              <div className="grid gap-2">
                <Label>Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No project</SelectItem>
                    {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Sprint</Label>
              <Select value={sprintId} onValueChange={setSprintId}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No sprint</SelectItem>
                  {sprints.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", s.status === "active" ? "bg-emerald-500" : s.status === "planned" ? "bg-blue-400" : "bg-neutral-300")} />
                        {s.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {type !== "social_media_planner" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start date <span className="text-red-500">*</span></Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-xl" required />
              </div>
              <div className="grid gap-2">
                <Label>End date <span className="text-red-500">*</span></Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-xl" required />
              </div>
            </div>
          )}
          {type === "social_media_planner" && (
            <div className="rounded-xl border p-4 space-y-4 bg-violet-50/30">
              <h3 className="text-sm font-semibold">Social Media Planner Fields</h3>

              <div className="grid gap-2">
                <Label>Platform</Label>
                <OptionMultiSelect
                  options={SOCIAL_PLATFORM_OPTIONS.map((p) => ({ id: p.id, label: p.label }))}
                  selected={socialMediaPlanner.platforms}
                  onChange={(platforms) => setSocialMediaPlanner((prev) => ({ ...prev, platforms }))}
                  placeholder="Search platforms..."
                />
              </div>

              <div className="grid gap-2">
                <Label>Pages / Accounts</Label>
                <StringTagInput
                  value={socialMediaPlanner.pagesAccounts}
                  onChange={(pagesAccounts) => setSocialMediaPlanner((prev) => ({ ...prev, pagesAccounts }))}
                  placeholder="Add account/page name"
                />
              </div>

              <div className="grid gap-2">
                <Label>Projects</Label>
                <OptionMultiSelect
                  options={projects.map((p) => ({ id: p.id, label: p.name }))}
                  selected={socialMediaPlanner.linkedProjectIds}
                  onChange={(linkedProjectIds) => setSocialMediaPlanner((prev) => ({ ...prev, linkedProjectIds }))}
                  placeholder="Search projects..."
                />
              </div>

              <div className="grid gap-2">
                <Label>Post Type</Label>
                <OptionMultiSelect
                  options={SOCIAL_POST_TYPE_OPTIONS.map((p) => ({ id: p.id, label: p.label }))}
                  selected={socialMediaPlanner.postTypes}
                  onChange={(postTypes) => setSocialMediaPlanner((prev) => ({ ...prev, postTypes }))}
                  placeholder="Search post types..."
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="grid gap-1.5">
                  <Label>Target Views</Label>
                  <Input
                    type="number"
                    min={0}
                    value={socialMediaPlanner.targetViews}
                    onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, targetViews: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Target Likes</Label>
                  <Input
                    type="number"
                    min={0}
                    value={socialMediaPlanner.targetLikes}
                    onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, targetLikes: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Target Comments</Label>
                  <Input
                    type="number"
                    min={0}
                    value={socialMediaPlanner.targetComments}
                    onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, targetComments: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Target Shares</Label>
                  <Input
                    type="number"
                    min={0}
                    value={socialMediaPlanner.targetShares}
                    onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, targetShares: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Followers Gain</Label>
                  <Input
                    type="number"
                    min={0}
                    value={socialMediaPlanner.targetFollowersGain}
                    onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, targetFollowersGain: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Content Plan</Label>
                <RichTextEditor
                  value={socialMediaPlanner.contentPlanRichText}
                  onChange={(contentPlanRichText) => setSocialMediaPlanner((prev) => ({ ...prev, contentPlanRichText }))}
                  placeholder="Write content plan..."
                  minHeight="120px"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Caption Idea</Label>
                  <Input
                    value={socialMediaPlanner.captionIdea}
                    onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, captionIdea: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Hook</Label>
                  <Input
                    value={socialMediaPlanner.hook}
                    onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, hook: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Hashtags</Label>
                  <Input
                    value={socialMediaPlanner.hashtags}
                    onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, hashtags: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Call To Action</Label>
                  <Input
                    value={socialMediaPlanner.callToAction}
                    onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, callToAction: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="grid gap-1.5">
                  <Label>Post Date</Label>
                  <Input
                    type="date"
                    value={socialMediaPlanner.postDate}
                    onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, postDate: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Post Time</Label>
                  <Input
                    type="time"
                    value={socialMediaPlanner.postTime}
                    onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, postTime: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Status</Label>
                  <Select
                    value={socialMediaPlanner.progressStatus}
                    onValueChange={(progressStatus) =>
                      setSocialMediaPlanner((prev) => ({ ...prev, progressStatus: progressStatus as SocialMediaProgressStatus }))
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOCIAL_PROGRESS_STATUS_OPTIONS.map((statusOption) => (
                        <SelectItem key={statusOption.id} value={statusOption.id}>
                          {statusOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <Label>Assignees <span className="text-red-500">*</span></Label>
            <AssigneeMultiSelect employees={employees} selected={assigneeIds} onChange={setAssigneeIds} />
          </div>
          <div className="grid gap-2">
            <Label>Reporter</Label>
            <Select value={reporterId} onValueChange={setReporterId}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {employees.map((e) => (
                  <SelectItem key={`add-reporter-${e.id}`} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={submit} disabled={saving} className="rounded-xl">{saving ? "Creating…" : "Create Task"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Task Dialog ───────────────────────────────
function OrgEditTaskDialog({
  task,
  allTasks,
  employees,
  projects,
  sprints,
  initialTab,
  viewMode,
  open,
  onOpenChange,
  onSave,
  onTaskMutated,
  onOpenTaskFullPage,
  onTabChange,
  onDelete,
  canDelete,
  saving,
}: {
  task: Task;
  allTasks: Task[];
  employees: Employee[];
  projects: ProjectOption[];
  sprints: SprintOption[];
  initialTab: "details" | "comments" | "subtasks";
  viewMode: "modal" | "full";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (form: any) => void;
  onTaskMutated: () => void;
  onOpenTaskFullPage: (task: Task, tab?: "details" | "comments" | "subtasks") => void;
  onTabChange: (tab: "details" | "comments" | "subtasks") => void;
  onDelete: () => void;
  canDelete?: boolean;
  saving: boolean;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [type, setType] = useState<Task["type"]>(task.type ?? "task");
  const [status, setStatus] = useState(normalizeBoardStatus(task.status));
  const [reporterId, setReporterId] = useState(task.reporter?.id ?? "__none__");
  const [assigneeIds, setAssigneeIds] = useState<string[]>(
    (task.assignees?.length > 0) ? task.assignees.map((a) => a.id) : (task.assignee ? [task.assignee.id] : [])
  );
  const [startDate, setStartDate] = useState(task.startDate ? new Date(task.startDate).toISOString().slice(0, 10) : "");
  const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "");
  const [priority, setPriority] = useState<string>(task.priority);
  const [projectId, setProjectId] = useState(task.project ?? "__none__");
  const [sprintId, setSprintId] = useState(task.sprint ?? "__none__");
  const [socialMediaPlanner, setSocialMediaPlanner] = useState<SocialMediaPlannerFormState>(
    fromTaskSocialMediaPlanner(task.socialMediaPlanner)
  );

  // Tab: details or comments
  const [activeTab, setActiveTab] = useState<"details" | "comments" | "subtasks">("details");
  const [subtaskDialogOpen, setSubtaskDialogOpen] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [previewSubtask, setPreviewSubtask] = useState<Task | null>(null);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [subtaskDescription, setSubtaskDescription] = useState("");
  const [subtaskType, setSubtaskType] = useState<Task["type"]>("task");
  const [subtaskStatus, setSubtaskStatus] = useState<Task["status"]>("backlog");
  const [subtaskPriority, setSubtaskPriority] = useState<Task["priority"]>("medium");
  const [subtaskProjectId, setSubtaskProjectId] = useState("__none__");
  const [subtaskSprintId, setSubtaskSprintId] = useState("__none__");
  const [subtaskStartDate, setSubtaskStartDate] = useState(
    task.startDate ? new Date(task.startDate).toISOString().slice(0, 10) : ""
  );
  const [subtaskDueDate, setSubtaskDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ""
  );
  const [subtaskAssigneeIds, setSubtaskAssigneeIds] = useState<string[]>(
    task.assignees?.length ? task.assignees.map((a) => a.id) : task.assignee ? [task.assignee.id] : []
  );
  const [childReporterId, setChildReporterId] = useState("__none__");
  const [subtaskSaving, setSubtaskSaving] = useState(false);
  const childTasks = allTasks.filter((t) => t.parentTask === task.id);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      onTabChange(initialTab);
    }
  }, [open, initialTab, task.id, onTabChange]);

  useEffect(() => {
    setSocialMediaPlanner(fromTaskSocialMediaPlanner(task.socialMediaPlanner));
  }, [task.id, task.socialMediaPlanner]);

  useEffect(() => {
    setReporterId(task.reporter?.id ?? "__none__");
  }, [task.id, task.reporter?.id]);

  function submit() {
    if (!title.trim()) { toast.error("Task name is required"); return; }
    if (assigneeIds.length === 0) { toast.error("At least one assignee is required"); return; }
    if (type !== "social_media_planner") {
      if (!startDate) { toast.error("Start date is required"); return; }
      if (!dueDate) { toast.error("End date is required"); return; }
    }
    onSave({
      title, description, type, status, assigneeIds,
      reporterId: reporterId !== "__none__" ? reporterId : null,
      startDate, dueDate, priority,
      projectId: projectId !== "__none__" ? projectId : null,
      sprintId: sprintId !== "__none__" ? sprintId : null,
      socialMediaPlanner:
        type === "social_media_planner"
          ? toPayloadSocialMediaPlanner(socialMediaPlanner)
          : null,
    });
  }

  function openSubtaskDialog(subtask?: Task) {
    if (subtask) {
      setEditingSubtaskId(subtask.id);
      setSubtaskTitle(subtask.title || "");
      setSubtaskDescription(subtask.description || "");
      setSubtaskType(subtask.type || "task");
      setSubtaskStatus(normalizeBoardStatus(subtask.status || "backlog"));
      setSubtaskPriority(subtask.priority || "medium");
      setSubtaskProjectId(subtask.project || "__none__");
      setSubtaskSprintId(subtask.sprint || "__none__");
      setSubtaskStartDate(subtask.startDate ? new Date(subtask.startDate).toISOString().slice(0, 10) : "");
      setSubtaskDueDate(subtask.dueDate ? new Date(subtask.dueDate).toISOString().slice(0, 10) : "");
      setSubtaskAssigneeIds(
        subtask.assignees?.length ? subtask.assignees.map((a) => a.id) : subtask.assignee ? [subtask.assignee.id] : []
      );
      setChildReporterId(subtask.reporter?.id ?? "__none__");
    } else {
      setEditingSubtaskId(null);
      setSubtaskTitle("");
      setSubtaskDescription("");
      setSubtaskType("task");
      setSubtaskStatus("backlog");
      setSubtaskPriority("medium");
      setSubtaskProjectId(projectId || "__none__");
      setSubtaskSprintId(sprintId || "__none__");
      setSubtaskStartDate(task.startDate ? new Date(task.startDate).toISOString().slice(0, 10) : "");
      setSubtaskDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "");
      setSubtaskAssigneeIds(
        task.assignees?.length ? task.assignees.map((a) => a.id) : task.assignee ? [task.assignee.id] : []
      );
      setChildReporterId(task.reporter?.id ?? "__none__");
    }
    setSubtaskDialogOpen(true);
  }

  async function saveSubtask() {
    if (!subtaskTitle.trim()) {
      toast.error("Subtask title is required");
      return;
    }
    if (subtaskAssigneeIds.length === 0) {
      toast.error("Select at least one assignee");
      return;
    }
    if (!subtaskStartDate || !subtaskDueDate) {
      toast.error("Start and end date are required");
      return;
    }
    setSubtaskSaving(true);
    try {
      const isEdit = !!editingSubtaskId;
      const res = await fetch(isEdit ? `/api/tasks/${editingSubtaskId}` : "/api/org-tasks", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEdit
            ? {
                title: subtaskTitle.trim(),
                description: subtaskDescription.trim(),
                type: subtaskType,
                status: subtaskStatus,
                priority: subtaskPriority,
                assigneeIds: subtaskAssigneeIds,
                reporterId: childReporterId !== "__none__" ? childReporterId : null,
                startDate: subtaskStartDate,
                dueDate: subtaskDueDate,
                projectId: subtaskProjectId !== "__none__" ? subtaskProjectId : null,
                sprintId: subtaskSprintId !== "__none__" ? subtaskSprintId : null,
              }
            : {
                title: subtaskTitle.trim(),
                description: subtaskDescription.trim(),
                type: subtaskType,
                status: subtaskStatus,
                assigneeIds: subtaskAssigneeIds,
                reporterId: childReporterId !== "__none__" ? childReporterId : null,
                startDate: subtaskStartDate,
                dueDate: subtaskDueDate,
                priority: subtaskPriority,
                projectId: subtaskProjectId !== "__none__" ? subtaskProjectId : null,
                sprintId: subtaskSprintId !== "__none__" ? subtaskSprintId : null,
                parentTaskId: task.id,
              }
        ),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Failed to save subtask");
        return;
      }
      toast.success(isEdit ? "Subtask updated" : "Subtask created");
      setSubtaskDialogOpen(false);
      onTaskMutated();
    } catch {
      toast.error("Failed to save subtask");
    } finally {
      setSubtaskSaving(false);
    }
  }

  async function deleteSubtask(subtaskId: string) {
    setSubtaskSaving(true);
    try {
      const res = await fetch(`/api/tasks/${subtaskId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete subtask");
        return;
      }
      toast.success("Subtask deleted");
      onTaskMutated();
    } catch {
      toast.error("Failed to delete subtask");
    } finally {
      setSubtaskSaving(false);
    }
  }

  async function toggleSubtaskDone(subtask: Task) {
    const nextStatus = subtask.status === "done" ? "in_progress" : "done";
    setSubtaskSaving(true);
    try {
      const res = await fetch(`/api/tasks/${subtask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        toast.error("Failed to update subtask");
        return;
      }
      onTaskMutated();
    } catch {
      toast.error("Failed to update subtask");
    } finally {
      setSubtaskSaving(false);
    }
  }

  async function shareSubtask(subtask: Task) {
    const url = `${window.location.origin}/dashboard/todo?ticket=${getTaskTicket(subtask.id)}&tab=subtasks`;
    try {
      if (navigator.share) {
        await navigator.share({ title: subtask.title, text: `Subtask: ${subtask.title}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Subtask link copied");
      }
    } catch {
      // noop
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "overflow-hidden flex flex-col",
        viewMode === "full"
          ? "w-[100vw] h-[100vh] max-w-none max-h-none rounded-none"
          : "max-w-3xl max-h-[90vh] rounded-2xl"
      )}>
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-3">
            Edit Task
          </DialogTitle>
          <div className="text-xs text-muted-foreground">
            <button
              type="button"
              className="hover:underline"
              onClick={() => {
                setActiveTab("details");
                onTabChange("details");
              }}
            >
              Tasks
            </button>
            {" / "}
            <span>{getTaskTicket(task.id)}</span>
          </div>
          {/* Tab switcher */}
          <div className="flex gap-1 mt-2 border-b -mx-6 px-6">
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === "details"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab("details")}
            >
              Task Overview
            </button>
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5",
                activeTab === "subtasks"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
              onClick={() => {
                setActiveTab("subtasks");
                onTabChange("subtasks");
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Subtask
              {childTasks.length > 0 && (
                <span className="bg-neutral-100 text-neutral-600 text-[10px] font-semibold rounded-full px-1.5 py-0.5 tabular-nums">
                  {childTasks.filter((t) => t.status === "done").length}/{childTasks.length}
                </span>
              )}
            </button>
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5",
                activeTab === "comments"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
              onClick={() => {
                setActiveTab("comments");
                onTabChange("comments");
              }}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Comments
              {(task.commentCount || 0) > 0 && (
                <span className="bg-neutral-100 text-neutral-600 text-[10px] font-semibold rounded-full px-1.5 py-0.5 tabular-nums">
                  {task.commentCount}
                </span>
              )}
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTab === "details" ? (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Task name</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <RichTextEditor value={description} onChange={setDescription} placeholder="Description..." minHeight="120px" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as Task["type"])}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{TASK_TYPES.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as Task["status"])}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {type !== "social_media_planner" && (
                  <div className="grid gap-2">
                    <Label>Project</Label>
                    <Select value={projectId} onValueChange={setProjectId}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label>Sprint</Label>
                  <Select value={sprintId} onValueChange={setSprintId}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {sprints.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          <div className="flex items-center gap-1.5">
                            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", s.status === "active" ? "bg-emerald-500" : s.status === "planned" ? "bg-blue-400" : "bg-neutral-300")} />
                            {s.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(task.projectName || task.reportingManager) && (
                <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                  {task.projectName && task.projectName !== "—" && (
                    <div><span className="text-muted-foreground">Project</span><div className="font-medium">{task.projectName}</div></div>
                  )}
                  {task.reportingManager && (
                    <div><span className="text-muted-foreground">Manager</span><div className="font-medium">{task.reportingManager.name}</div></div>
                  )}
                </div>
              )}
              {type !== "social_media_planner" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start date</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="grid gap-2">
                    <Label>End date</Label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-xl" />
                  </div>
                </div>
              )}
              {type === "social_media_planner" && (
                <div className="rounded-xl border p-4 space-y-4 bg-violet-50/30">
                  <h3 className="text-sm font-semibold">Social Media Planner Fields</h3>

                  <div className="grid gap-2">
                    <Label>Platform</Label>
                    <OptionMultiSelect
                      options={SOCIAL_PLATFORM_OPTIONS.map((p) => ({ id: p.id, label: p.label }))}
                      selected={socialMediaPlanner.platforms}
                      onChange={(platforms) => setSocialMediaPlanner((prev) => ({ ...prev, platforms }))}
                      placeholder="Search platforms..."
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Pages / Accounts</Label>
                    <StringTagInput
                      value={socialMediaPlanner.pagesAccounts}
                      onChange={(pagesAccounts) => setSocialMediaPlanner((prev) => ({ ...prev, pagesAccounts }))}
                      placeholder="Add account/page name"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Projects</Label>
                    <OptionMultiSelect
                      options={projects.map((p) => ({ id: p.id, label: p.name }))}
                      selected={socialMediaPlanner.linkedProjectIds}
                      onChange={(linkedProjectIds) => setSocialMediaPlanner((prev) => ({ ...prev, linkedProjectIds }))}
                      placeholder="Search projects..."
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Post Type</Label>
                    <OptionMultiSelect
                      options={SOCIAL_POST_TYPE_OPTIONS.map((p) => ({ id: p.id, label: p.label }))}
                      selected={socialMediaPlanner.postTypes}
                      onChange={(postTypes) => setSocialMediaPlanner((prev) => ({ ...prev, postTypes }))}
                      placeholder="Search post types..."
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="grid gap-1.5">
                      <Label>Target Views</Label>
                      <Input
                        type="number"
                        min={0}
                        value={socialMediaPlanner.targetViews}
                        onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, targetViews: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Target Likes</Label>
                      <Input
                        type="number"
                        min={0}
                        value={socialMediaPlanner.targetLikes}
                        onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, targetLikes: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Target Comments</Label>
                      <Input
                        type="number"
                        min={0}
                        value={socialMediaPlanner.targetComments}
                        onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, targetComments: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Target Shares</Label>
                      <Input
                        type="number"
                        min={0}
                        value={socialMediaPlanner.targetShares}
                        onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, targetShares: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Followers Gain</Label>
                      <Input
                        type="number"
                        min={0}
                        value={socialMediaPlanner.targetFollowersGain}
                        onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, targetFollowersGain: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Content Plan</Label>
                    <RichTextEditor
                      value={socialMediaPlanner.contentPlanRichText}
                      onChange={(contentPlanRichText) => setSocialMediaPlanner((prev) => ({ ...prev, contentPlanRichText }))}
                      placeholder="Write content plan..."
                      minHeight="120px"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label>Caption Idea</Label>
                      <Input
                        value={socialMediaPlanner.captionIdea}
                        onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, captionIdea: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Hook</Label>
                      <Input
                        value={socialMediaPlanner.hook}
                        onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, hook: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Hashtags</Label>
                      <Input
                        value={socialMediaPlanner.hashtags}
                        onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, hashtags: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Call To Action</Label>
                      <Input
                        value={socialMediaPlanner.callToAction}
                        onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, callToAction: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="grid gap-1.5">
                      <Label>Post Date</Label>
                      <Input
                        type="date"
                        value={socialMediaPlanner.postDate}
                        onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, postDate: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Post Time</Label>
                      <Input
                        type="time"
                        value={socialMediaPlanner.postTime}
                        onChange={(e) => setSocialMediaPlanner((prev) => ({ ...prev, postTime: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Status</Label>
                      <Select
                        value={socialMediaPlanner.progressStatus}
                        onValueChange={(progressStatus) =>
                          setSocialMediaPlanner((prev) => ({ ...prev, progressStatus: progressStatus as SocialMediaProgressStatus }))
                        }
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SOCIAL_PROGRESS_STATUS_OPTIONS.map((statusOption) => (
                            <SelectItem key={statusOption.id} value={statusOption.id}>
                              {statusOption.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid gap-2">
                <Label>Assignees</Label>
                <AssigneeMultiSelect employees={employees} selected={assigneeIds} onChange={setAssigneeIds} />
              </div>
              <div className="grid gap-2">
                <Label>Reporter</Label>
                <Select value={reporterId} onValueChange={setReporterId}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {employees.map((e) => (
                      <SelectItem key={`reporter-${e.id}`} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : activeTab === "comments" ? (
            <TaskCommentThread taskId={task.id} />
          ) : (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Subtasks</h3>
                <Button onClick={() => openSubtaskDialog()} className="rounded-xl" size="sm">
                  Add new sub-task
                </Button>
              </div>

              <div className="space-y-2">
                {childTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No subtasks yet.</p>
                ) : (
                  childTasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="rounded-xl border p-3 cursor-pointer hover:bg-muted/30"
                      onClick={() => setPreviewSubtask(subtask)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p
                            className={cn(
                              "font-medium",
                              subtask.status === "done" && "line-through opacity-50"
                            )}
                          >
                            {subtask.title}
                          </p>
                          {subtask.description ? (
                            <p
                              className={cn(
                                "text-sm text-muted-foreground mt-1",
                                subtask.status === "done" && "line-through opacity-50"
                              )}
                            >
                              {subtask.description.replace(/<[^>]+>/g, " ").trim() || "—"}
                            </p>
                          ) : null}
                          <p className="text-xs text-muted-foreground mt-1">
                            {subtask.startDate ? new Date(subtask.startDate).toLocaleDateString("en-IN") : "—"} to{" "}
                            {subtask.dueDate ? new Date(subtask.dueDate).toLocaleDateString("en-IN") : "—"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={subtask.status === "done" ? "secondary" : "outline"}
                            size="sm"
                            className="rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSubtaskDone(subtask);
                            }}
                            disabled={subtaskSaving}
                          >
                            {subtask.status === "done" ? "Mark not completed" : "Mark completed"}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                                disabled={subtaskSaving}
                              >
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl w-40">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void shareSubtask(subtask);
                                }}
                              >
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openSubtaskDialog(subtask);
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              {canDelete && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteSubtask(subtask.id);
                                    }}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Dialog open={subtaskDialogOpen} onOpenChange={setSubtaskDialogOpen}>
          <DialogContent className="max-w-xl rounded-2xl">
            <DialogHeader>
              <DialogTitle>{editingSubtaskId ? "Edit sub-task" : "Add new sub-task"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid gap-2">
                <Label>Subtask name</Label>
                <Input
                  value={subtaskTitle}
                  onChange={(e) => setSubtaskTitle(e.target.value)}
                  placeholder="Enter subtask title"
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <RichTextEditor
                  value={subtaskDescription}
                  onChange={setSubtaskDescription}
                  placeholder="Add subtask description"
                  minHeight="120px"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="grid gap-1.5">
                  <Label>Type</Label>
                  <Select value={subtaskType} onValueChange={(v) => setSubtaskType(v as Task["type"])}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{TASK_TYPES.map((t) => <SelectItem key={`st-type-${t.id}`} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Status</Label>
                  <Select value={subtaskStatus} onValueChange={(v) => setSubtaskStatus(v as Task["status"])}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={`st-status-${s.id}`} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Priority</Label>
                  <Select value={subtaskPriority} onValueChange={(v) => setSubtaskPriority(v as Task["priority"])}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{PRIORITIES.map((p) => <SelectItem key={`st-pri-${p.id}`} value={p.id}>{p.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Project</Label>
                  <Select value={subtaskProjectId} onValueChange={setSubtaskProjectId}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {projects.map((p) => <SelectItem key={`st-proj-${p.id}`} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Sprint</Label>
                  <Select value={subtaskSprintId} onValueChange={setSubtaskSprintId}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {sprints.map((s) => <SelectItem key={`st-sprint-${s.id}`} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Start date</Label>
                  <Input type="date" value={subtaskStartDate} onChange={(e) => setSubtaskStartDate(e.target.value)} className="rounded-xl" />
                </div>
                <div className="grid gap-1.5">
                  <Label>End date</Label>
                  <Input type="date" value={subtaskDueDate} onChange={(e) => setSubtaskDueDate(e.target.value)} className="rounded-xl" />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Assignees</Label>
                <AssigneeMultiSelect
                  employees={employees}
                  selected={subtaskAssigneeIds}
                  onChange={setSubtaskAssigneeIds}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Reporter</Label>
                <Select value={childReporterId} onValueChange={setChildReporterId}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {employees.map((e) => (
                      <SelectItem key={`child-reporter-${e.id}`} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-xl" onClick={() => setSubtaskDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveSubtask} disabled={subtaskSaving} className="rounded-xl">
                {subtaskSaving ? "Saving..." : editingSubtaskId ? "Update sub-task" : "Create sub-task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!previewSubtask} onOpenChange={(next) => !next && setPreviewSubtask(null)}>
          <DialogContent className="max-w-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle>Subtask preview</DialogTitle>
            </DialogHeader>
            {previewSubtask && (
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  <button
                    type="button"
                    className="hover:underline"
                    onClick={() => setPreviewSubtask(null)}
                  >
                    {getTaskTicket(task.id)}
                  </button>
                  {" / "}
                  <button
                    type="button"
                    className="hover:underline"
                    onClick={() => setPreviewSubtask(null)}
                  >
                    Subtasks
                  </button>
                  {" / "}
                  <span>{getTaskTicket(previewSubtask.id)}</span>
                </div>
                <h3 className="text-lg font-semibold">{previewSubtask.title}</h3>
                <div
                  className="text-sm text-muted-foreground [&_a]:text-primary [&_a]:underline"
                  dangerouslySetInnerHTML={{
                    __html: previewSubtask.description && previewSubtask.description !== "<p></p>"
                      ? (previewSubtask.description.includes("<") ? previewSubtask.description : `<p>${previewSubtask.description}</p>`)
                      : "<p>No description</p>",
                  }}
                />
                <div className="flex justify-between">
                  <Button variant="outline" className="rounded-xl" onClick={() => setPreviewSubtask(null)}>
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => {
                        onOpenTaskFullPage(previewSubtask, "subtasks");
                        setPreviewSubtask(null);
                      }}
                    >
                      Open full page
                    </Button>
                    <Button
                      className="rounded-xl"
                      onClick={() => {
                        openSubtaskDialog(previewSubtask);
                        setPreviewSubtask(null);
                      }}
                    >
                      Edit subtask
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {activeTab === "details" && (
          <DialogFooter className="flex-row justify-between sm:justify-between gap-2 shrink-0 border-t pt-4">
            {canDelete ? (
              <Button variant="destructive" onClick={onDelete} className="rounded-xl">Delete</Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={submit} disabled={saving} className="rounded-xl">{saving ? "Saving…" : "Save"}</Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Comment Thread ────────────────────────────────
function TaskCommentThread({ taskId }: { taskId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [sending, setSending] = useState(false);

  // Fetch comments
  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`);
      if (!res.ok) return;
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  async function handleSend() {
    const text = newComment.trim();
    if (!text) return;
    setSending(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: text,
          parentId: replyTo?.id || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Failed to post comment");
        return;
      }
      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setNewComment("");
      setReplyTo(null);
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setSending(false);
    }
  }

  // Build thread tree: top-level comments + replies grouped under parent
  const topLevel = comments.filter((c) => !c.parentId);
  const repliesMap = new Map<string, Comment[]>();
  for (const c of comments) {
    if (c.parentId) {
      if (!repliesMap.has(c.parentId)) repliesMap.set(c.parentId, []);
      repliesMap.get(c.parentId)!.push(c);
    }
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function CommentBubble({ comment, isReply }: { comment: Comment; isReply?: boolean }) {
    const initials = comment.authorName.slice(0, 2).toUpperCase();
    return (
      <div className={cn("flex gap-2.5", isReply && "ml-10")}>
        {isReply && <CornerDownRight className="h-3.5 w-3.5 text-neutral-300 shrink-0 mt-2" />}
        <Avatar className={cn("shrink-0", isReply ? "h-6 w-6" : "h-8 w-8")}>
          <AvatarFallback className={cn("text-neutral-700 bg-neutral-200", isReply ? "text-[9px]" : "text-[10px]")}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn("font-semibold truncate", isReply ? "text-xs" : "text-sm")}>{comment.authorName}</span>
            <span className="text-[10px] text-muted-foreground shrink-0">{formatTime(comment.createdAt)}</span>
          </div>
          <div className={cn("rounded-xl px-3 py-2 text-sm whitespace-pre-wrap break-words", isReply ? "bg-neutral-50 border border-neutral-100" : "bg-neutral-100")}>
            {comment.body}
          </div>
          {!isReply && (
            <button
              className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setReplyTo(comment)}
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full py-4">
      {/* Comments list */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-4 mb-4">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs mt-0.5">Be the first to comment on this task</p>
          </div>
        ) : (
          topLevel.map((comment) => (
            <div key={comment.id} className="space-y-2">
              <CommentBubble comment={comment} />
              {(repliesMap.get(comment.id) || []).map((reply) => (
                <CommentBubble key={reply.id} comment={reply} isReply />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Reply indicator */}
      {replyTo && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl mb-2 text-xs shrink-0">
          <Reply className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <span className="text-blue-700 truncate">
            Replying to <strong>{replyTo.authorName}</strong>
          </span>
          <button
            className="ml-auto text-blue-400 hover:text-blue-600"
            onClick={() => setReplyTo(null)}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Comment input */}
      <div className="flex gap-2 shrink-0">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={replyTo ? `Reply to ${replyTo.authorName}...` : "Write a comment..."}
          className="rounded-xl flex-1"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        />
        <Button
          size="icon"
          className="rounded-xl shrink-0 h-10 w-10"
          onClick={handleSend}
          disabled={sending || !newComment.trim()}
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

// ── Calendar View ─────────────────────────────────
const STATUS_DOT_COLORS: Record<string, string> = {
  backlog: "bg-slate-400",
  todo: "bg-slate-400",
  in_progress: "bg-blue-500",
  hold: "bg-orange-500",
  staging: "bg-amber-500",
  production: "bg-amber-500",
  in_review: "bg-amber-500",
  done: "bg-emerald-500",
  rejected: "bg-rose-500",
};

const PRIORITY_BORDER: Record<string, string> = {
  urgent: "border-l-red-500",
  high: "border-l-amber-500",
  medium: "border-l-blue-400",
  low: "border-l-slate-300",
};

function TaskCalendarView({
  tasks,
  onEditTask,
  onAddTask,
}: {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onAddTask: (date: Date) => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDay = firstDayOfMonth.getDay(); // 0=Sun
  const daysInMonth = lastDayOfMonth.getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Build task map by date (using dueDate, fallback to startDate)
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      const d = t.dueDate || t.startDate;
      if (!d) continue;
      const dt = new Date(d);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [tasks]);

  // Tasks without any date
  const undatedTasks = useMemo(() => tasks.filter((t) => !t.dueDate && !t.startDate), [tasks]);

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }
  function goToday() {
    setCurrentDate(new Date());
  }

  // Build calendar grid (6 weeks max)
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const monthLabel = currentDate.toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Calendar header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">{monthLabel}</h3>
          <Button variant="outline" size="sm" className="h-7 rounded-lg text-xs" onClick={goToday}>
            Today
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px shrink-0">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px flex-1 border rounded-xl overflow-hidden bg-neutral-200">
        {weeks.flat().map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="bg-neutral-50/80 min-h-[100px]" />;
          }
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayTasks = tasksByDate.get(dateStr) || [];
          const isToday = dateStr === todayStr;
          const isWeekend = i % 7 === 0 || i % 7 === 6;

          return (
            <div
              key={dateStr}
              className={cn(
                "bg-white min-h-[100px] p-1.5 flex flex-col group relative",
                isWeekend && "bg-neutral-50/50",
              )}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1 shrink-0">
                <span
                  className={cn(
                    "text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full",
                    isToday ? "bg-primary text-primary-foreground" : "text-neutral-600"
                  )}
                >
                  {day}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[9px] text-muted-foreground font-medium">{dayTasks.length}</span>
                )}
              </div>

              {/* Tasks in this day */}
              <div className="flex-1 space-y-0.5 overflow-y-auto max-h-[80px]">
                {dayTasks.slice(0, 4).map((task) => (
                  <button
                    key={task.id}
                    className={cn(
                      "w-full text-left rounded px-1.5 py-0.5 text-[10px] leading-tight truncate border-l-2 transition-colors hover:bg-muted/60",
                      PRIORITY_BORDER[task.priority] || "border-l-neutral-300",
                      task.status === "done" ? "bg-emerald-50/60 line-through text-muted-foreground" : "bg-white"
                    )}
                    onClick={() => onEditTask(task)}
                    title={task.title}
                  >
                    <span className={cn("inline-block h-1.5 w-1.5 rounded-full mr-1 align-middle", STATUS_DOT_COLORS[task.status] || "bg-slate-400")} />
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 4 && (
                  <p className="text-[9px] text-muted-foreground text-center font-medium">
                    +{dayTasks.length - 4} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Undated tasks */}
      {undatedTasks.length > 0 && (
        <div className="shrink-0 rounded-xl border bg-neutral-50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">No date set</span>
            <span className="text-xs text-muted-foreground">({undatedTasks.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {undatedTasks.slice(0, 12).map((task) => (
              <button
                key={task.id}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-xs truncate max-w-[200px] hover:bg-white transition-colors border-l-2",
                  PRIORITY_BORDER[task.priority] || "border-l-neutral-300",
                  task.status === "done" ? "line-through text-muted-foreground" : ""
                )}
                onClick={() => onEditTask(task)}
              >
                <span className={cn("inline-block h-1.5 w-1.5 rounded-full mr-1 align-middle", STATUS_DOT_COLORS[task.status])} />
                {task.title}
              </button>
            ))}
            {undatedTasks.length > 12 && (
              <span className="text-xs text-muted-foreground self-center ml-1">+{undatedTasks.length - 12} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sprint Manager Dialog ───────────────────────────
function SprintManagerDialog({
  open,
  onOpenChange,
  sprints,
  onSprintsChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sprints: SprintOption[];
  onSprintsChange: (s: SprintOption[]) => void;
}) {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingSprint, setEditingSprint] = useState<SprintOption | null>(null);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<string>("planned");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setStartDate("");
    setEndDate("");
    setStatus("planned");
    setEditingSprint(null);
  }

  function openCreate() {
    resetForm();
    setMode("create");
  }

  function openEdit(s: SprintOption) {
    setEditingSprint(s);
    setName(s.name);
    setStartDate(s.startDate ? s.startDate.slice(0, 10) : "");
    setEndDate(s.endDate ? s.endDate.slice(0, 10) : "");
    setStatus(s.status);
    setMode("edit");
  }

  async function handleSave() {
    if (!name.trim()) { toast.error("Sprint name is required"); return; }
    setSaving(true);
    try {
      if (mode === "create") {
        const res = await fetch("/api/sprints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), startDate: startDate || null, endDate: endDate || null, status }),
        });
        if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || "Failed to create sprint"); }
        const { sprint } = await res.json();
        onSprintsChange([...sprints, sprint]);
        toast.success("Sprint created");
      } else if (mode === "edit" && editingSprint) {
        const res = await fetch("/api/sprints", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingSprint.id, name: name.trim(), startDate: startDate || null, endDate: endDate || null, status }),
        });
        if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || "Failed to update sprint"); }
        const { sprint } = await res.json();
        onSprintsChange(sprints.map((s) => (s.id === sprint.id ? sprint : s)));
        toast.success("Sprint updated");
      }
      resetForm();
      setMode("list");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/sprints?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete sprint");
      onSprintsChange(sprints.filter((s) => s.id !== id));
      toast.success("Sprint deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete sprint");
    } finally {
      setDeletingId(null);
    }
  }

  const statusColors: Record<string, string> = {
    planned: "bg-blue-100 text-blue-700",
    active: "bg-emerald-100 text-emerald-700",
    completed: "bg-neutral-100 text-neutral-600",
  };

  const statusDotColors: Record<string, string> = {
    planned: "bg-blue-400",
    active: "bg-emerald-500",
    completed: "bg-neutral-400",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setMode("list"); resetForm(); } onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {mode === "list" ? "Manage Sprints" : mode === "create" ? "Create Sprint" : "Edit Sprint"}
          </DialogTitle>
        </DialogHeader>

        {mode === "list" ? (
          <div className="space-y-3">
            {sprints.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No sprints yet. Create one to organize tasks.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {sprints.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full shrink-0", statusDotColors[s.status] || "bg-neutral-300")} />
                        <span className="font-medium text-sm truncate">{s.name}</span>
                        <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", statusColors[s.status])}>
                          {s.status}
                        </Badge>
                      </div>
                      {(s.startDate || s.endDate) && (
                        <p className="text-xs text-muted-foreground mt-0.5 ml-4">
                          {s.startDate ? new Date(s.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                          {" → "}
                          {s.endDate ? new Date(s.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(s.id)}
                        disabled={deletingId === s.id}
                      >
                        {deletingId === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <DialogFooter className="pt-2">
              <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>Close</Button>
              <Button className="rounded-xl gap-1.5" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                New Sprint
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sprint Name *</Label>
              <Input
                placeholder="e.g. Sprint 1 – Launch prep"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-400" />
                      Planned
                    </div>
                  </SelectItem>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-neutral-400" />
                      Completed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" className="rounded-xl" onClick={() => { resetForm(); setMode("list"); }}>
                Back
              </Button>
              <Button className="rounded-xl gap-1.5" onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "create" ? "Create Sprint" : "Save Changes"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
