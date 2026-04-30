"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  MoreHorizontal,
  Eye,
  MessageSquare,
  Paperclip,
  Filter,
  ArrowUpDown,
  Loader2,
  Reply,
  Send,
  X,
  CornerDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/confirm-dialog";

type TaskStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "hold"
  | "code_review"
  | "qa"
  | "staging"
  | "production"
  | "in_review"
  | "done"
  | "rejected";

type BoardColumnStatus = "backlog" | "in_progress" | "hold" | "in_review" | "done" | "rejected";

const STATUSES: { id: BoardColumnStatus; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "in_progress", label: "In Progress" },
  { id: "hold", label: "Hold" },
  { id: "in_review", label: "In Review" },
  { id: "done", label: "Completed" },
  { id: "rejected", label: "Rejected" },
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
] as const;

type TaskAssignee = { id: string; name: string; email: string };
type Task = {
  id: string;
  project?: string | null;
  parentTask?: string | null;
  reporter?: TaskAssignee | null;
  title: string;
  description: string;
  type: "task" | "bug";
  status: TaskStatus;
  assignee: TaskAssignee | null;
  assignees?: TaskAssignee[];
  startDate?: string | null;
  dueDate: string | null;
  timeEstimateMinutes?: number | null;
  priority: "low" | "medium" | "high" | "urgent";
  order: number;
  createdAt?: string | Date | null;
  projectName?: string;
  reportingManager?: { id: string; name: string; email: string } | null;
};

type ProjectOption = { id: string; name: string };
type Comment = {
  id: string;
  taskId: string;
  parentId: string | null;
  authorEmail: string;
  authorName: string;
  body: string;
  createdAt: string;
};

function normalizeTaskStatus(status: TaskStatus): BoardColumnStatus {
  if (status === "todo" || status === "backlog") return "backlog";
  if (status === "in_progress") return "in_progress";
  if (status === "hold") return "hold";
  if (status === "in_review" || status === "code_review" || status === "qa" || status === "staging" || status === "production") {
    return "in_review";
  }
  if (status === "done") return "done";
  if (status === "rejected") return "rejected";
  return "backlog";
}

type Props = {
  projectId?: string;
  boardId?: string;
  tasks: Task[];
  employees: { id: string; name: string; email: string }[];
  onTasksChange: (tasks: Task[]) => void;
  onRefresh: () => void;
  assigneeFilter?: string;
  hideAddInColumns?: boolean;
  projects?: ProjectOption[];
  /** Only admins can delete tasks; when false, Delete is hidden */
  canDeleteTask?: boolean;
};

function formatCardDate(d: string | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
}

export function TaskBoard({
  projectId,
  boardId,
  tasks,
  employees,
  onTasksChange,
  onRefresh,
  assigneeFilter,
  hideAddInColumns = false,
  projects = [],
  canDeleteTask = false,
}: Props) {
  const contextId = projectId || boardId;
  const [addOpen, setAddOpen] = useState(false);
  const [addDefaultStatus, setAddDefaultStatus] = useState<BoardColumnStatus>("backlog");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"created_desc" | "date" | "priority">("created_desc");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<BoardColumnStatus | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredTasks = tasks.filter((t) => {
    const descText = t.description ? t.description.replace(/<[^>]+>/g, " ") : "";
    const matchesSearch =
      !search.trim() ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (descText && descText.toLowerCase().includes(search.toLowerCase()));
    const matchesPriority = !filterPriority || t.priority === filterPriority;
    const matchesType = !filterType || (t.type ?? "task") === filterType;
    return matchesSearch && matchesPriority && matchesType;
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
    const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (aCreated !== bCreated) return bCreated - aCreated;
    return (a.order ?? 0) - (b.order ?? 0);
  });

  const subtaskMap = sortedTasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (!task.parentTask) return acc;
    if (!acc[task.parentTask]) acc[task.parentTask] = [];
    acc[task.parentTask].push(task);
    return acc;
  }, {});

  const subtaskStats = sortedTasks.reduce<Record<string, { total: number; done: number }>>((acc, task) => {
    if (!task.parentTask) return acc;
    const parentId = String(task.parentTask);
    if (!acc[parentId]) acc[parentId] = { total: 0, done: 0 };
    acc[parentId].total += 1;
    if (task.status === "done") acc[parentId].done += 1;
    return acc;
  }, {});

  const tasksByStatus = STATUSES.map((s) => ({
    ...s,
    tasks: (() => {
      const inStatus = sortedTasks.filter((t) => normalizeTaskStatus(t.status) === s.id);
      const roots = inStatus.filter((t) => !t.parentTask);
      const rootIds = new Set(roots.map((t) => t.id));
      const flattened: Task[] = [];

      for (const root of roots) {
        flattened.push(root);
        const children = (subtaskMap[root.id] || []).filter((c) => normalizeTaskStatus(c.status) === s.id);
        flattened.push(...children);
      }

      const orphanSubtasks = inStatus.filter((t) => t.parentTask && !rootIds.has(String(t.parentTask)));
      return [...flattened, ...orphanSubtasks];
    })(),
  }));

  function openAdd(status: BoardColumnStatus) {
    setAddDefaultStatus(status);
    setAddOpen(true);
  }

  async function handleAddTask(form: {
    title: string;
    description?: string;
    type: string;
    status: string;
    assigneeId?: string;
    reporterId?: string;
    startDate?: string;
    dueDate?: string;
    timeEstimateMinutes?: number | null;
    priority: string;
    parentTaskId?: string | null;
    projectId?: string | null;
  }) {
    setSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(projectId ? { projectId } : {}),
          ...(boardId ? { boardId } : {}),
          title: form.title.trim(),
          description: form.description?.trim() || undefined,
          type: form.type || "task",
          status: form.status || "backlog",
          assigneeId: form.assigneeId || undefined,
          reporterId: form.reporterId || undefined,
          startDate: form.startDate || undefined,
          dueDate: form.dueDate || undefined,
          timeEstimateMinutes:
            typeof form.timeEstimateMinutes === "number" && form.timeEstimateMinutes >= 0
              ? form.timeEstimateMinutes
              : undefined,
          priority: form.priority || "medium",
          parentTaskId: form.parentTaskId || undefined,
          ...(form.projectId ? { projectId: form.projectId } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to create task");
        return;
      }
      toast.success("Task created");
      setAddOpen(false);
      // Optimistically add the new task so it appears immediately (before refetch)
      const t = data.task;
      if (t && t.id) {
        const projectName = (form.projectId && projects?.length)
          ? (projects.find((p) => p.id === form.projectId)?.name ?? "—")
          : "—";
        const newTask: Task = {
          id: t.id,
          project: t.project ?? null,
          parentTask: t.parentTask ?? null,
          reporter: t.reporter ?? null,
          title: t.title,
          description: t.description ?? "",
          type: (t.type || "task") as Task["type"],
          status: (t.status || "backlog") as Task["status"],
          assignee: t.assignee ?? null,
          startDate: t.startDate ?? null,
          dueDate: t.dueDate ?? null,
          timeEstimateMinutes: typeof t.timeEstimateMinutes === "number" ? t.timeEstimateMinutes : null,
          priority: (t.priority || "medium") as Task["priority"],
          order: t.order ?? tasks.length,
          createdAt: t.createdAt ?? new Date().toISOString(),
          projectName,
        };
        onTasksChange([...tasks, newTask]);
      }
      onRefresh();
    } catch {
      toast.error("Failed to create task");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateStatus(taskId: string, newStatus: BoardColumnStatus) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        toast.error("Failed to update");
        return;
      }
      const data = await res.json();
      onTasksChange(tasks.map((t) => (t.id === taskId ? { ...t, ...data.task } : t)));
    } catch {
      toast.error("Failed to update");
    }
  }

  function handleDragStart(e: React.DragEvent, task: Task) {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
    (e.target as HTMLElement).style.opacity = "0.5";
  }
  function handleDragEnd(e: React.DragEvent) {
    setDraggedTask(null);
    setDragOverStatus(null);
    (e.target as HTMLElement).style.opacity = "1";
  }
  function handleDragOver(e: React.DragEvent, status: BoardColumnStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStatus(status);
  }
  function handleDragLeave() {
    setDragOverStatus(null);
  }
  function handleDrop(e: React.DragEvent, newStatus: BoardColumnStatus) {
    e.preventDefault();
    setDragOverStatus(null);
    const taskId = e.dataTransfer.getData("text/plain");
    const task = tasks.find((t) => t.id === taskId);
    if (task && normalizeTaskStatus(task.status) !== newStatus) {
      handleUpdateStatus(taskId, newStatus);
    }
  }

  async function handleSaveEdit(form: {
    title: string;
    description: string;
    type: string;
    status: string;
    assigneeId: string | null;
    reporterId: string | null;
    startDate: string;
    dueDate: string;
    timeEstimateMinutes: number | null;
    priority: string;
    parentTaskId: string | null;
    projectId: string | null;
  }) {
    if (!editTask) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${editTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          type: form.type || "task",
          status: form.status,
          assigneeId: form.assigneeId || null,
          reporterId: form.reporterId || null,
          startDate: form.startDate || undefined,
          dueDate: form.dueDate || undefined,
          timeEstimateMinutes:
            typeof form.timeEstimateMinutes === "number" && form.timeEstimateMinutes >= 0
              ? form.timeEstimateMinutes
              : null,
          priority: form.priority,
          parentTaskId: form.parentTaskId || null,
          projectId: form.projectId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update");
        return;
      }
      toast.success("Task updated");
      setEditTask(null);
      onTasksChange(tasks.map((t) => (t.id === editTask.id ? { ...t, ...data.task } : t)));
      onRefresh();
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTask(taskId: string) {
    setDeleteTaskId(taskId);
  }

  async function handleAddChildIssue(
    parentTaskId: string,
    form: {
      title: string;
      description?: string;
      type: Task["type"];
      status: BoardColumnStatus;
      assigneeId?: string;
      reporterId?: string;
      startDate?: string;
      dueDate?: string;
      timeEstimateMinutes?: number | null;
      priority: Task["priority"];
    }
  ) {
    if (!editTask?.project) {
      toast.error("Select a project for this task before adding subtasks");
      return;
    }
    await handleAddTask({
      ...form,
      parentTaskId,
      projectId: editTask?.project ?? undefined,
    });
  }

  async function confirmDeleteTask() {
    if (!deleteTaskId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${deleteTaskId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete");
        return;
      }
      setEditTask(null);
      onTasksChange(tasks.filter((t) => t.id !== deleteTaskId));
      onRefresh();
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
      setDeleteTaskId(null);
    }
  }

  const COLUMN_COLORS: Record<string, { dot: string; headerBg: string; headerBorder: string }> = {
    backlog: { dot: "bg-slate-400", headerBg: "bg-slate-50", headerBorder: "border-slate-200" },
    in_progress: { dot: "bg-blue-500", headerBg: "bg-blue-50", headerBorder: "border-blue-200" },
    hold: { dot: "bg-orange-500", headerBg: "bg-orange-50", headerBorder: "border-orange-200" },
    in_review: { dot: "bg-amber-500", headerBg: "bg-amber-50", headerBorder: "border-amber-200" },
    done: { dot: "bg-emerald-500", headerBg: "bg-emerald-50", headerBorder: "border-emerald-200" },
    rejected: { dot: "bg-rose-500", headerBg: "bg-rose-50", headerBorder: "border-rose-200" },
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[600px]">
      {/* Top bar: Search, Filter, Sort, Add Task */}
      <div className="flex flex-wrap items-center gap-3 mb-4 shrink-0">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Search..."
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 rounded-xl gap-1.5 border-neutral-200">
              <Filter className="h-4 w-4" />
              Filter
              {(filterPriority || filterType) && (
                <span className="ml-1 rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-semibold">
                  {[filterPriority, filterType].filter(Boolean).length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl w-52">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Type</div>
            <DropdownMenuItem onClick={() => setFilterType("")}>All</DropdownMenuItem>
            {TASK_TYPES.map((t) => (
              <DropdownMenuItem key={t.id} onClick={() => setFilterType(t.id)}>
                <span className={cn("h-2 w-2 rounded-full mr-2 shrink-0", t.pillClass.split(" ")[0])} />
                {t.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Priority</div>
            <DropdownMenuItem onClick={() => setFilterPriority("")}>All</DropdownMenuItem>
            {PRIORITIES.map((p) => (
              <DropdownMenuItem key={p.id} onClick={() => setFilterPriority(p.id)}>
                <span className={cn("h-2 w-2 rounded-full mr-2 shrink-0", p.pillClass.split(" ")[0])} />
                {p.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 rounded-xl gap-1.5 border-neutral-200">
              <ArrowUpDown className="h-4 w-4" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl w-48">
            <DropdownMenuItem onClick={() => setSortBy("created_desc")}>Created (latest)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("date")}>Due date</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("priority")}>Priority</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          size="sm"
          className="h-9 rounded-xl gap-2 ml-auto"
          onClick={() => openAdd("backlog")}
        >
          <Plus className="h-4 w-4" />
          Add task
        </Button>
      </div>

      {/* Kanban columns: full height, wider columns, scrollable tasks */}
      <div className="flex-1 w-full overflow-x-auto overflow-y-hidden scrollbar-none min-h-0">
        <div className="flex gap-4 h-full min-w-max">
          {tasksByStatus.map((col) => {
            const colors = COLUMN_COLORS[col.id] || COLUMN_COLORS.backlog;
            return (
              <div
                key={col.id}
                className={cn(
                  "flex-shrink-0 w-[408px] rounded-2xl border flex flex-col transition-all duration-200",
                  dragOverStatus === col.id
                    ? "border-primary bg-primary/5 border-2 shadow-lg shadow-primary/10"
                    : "border-neutral-200 bg-neutral-50/50"
                )}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column header - fixed */}
                <div className={cn(
                  "px-4 py-3 border-b flex items-center justify-between gap-2 shrink-0 rounded-t-2xl",
                  colors.headerBg,
                  colors.headerBorder
                )}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", colors.dot)} />
                    <span className="font-semibold text-sm text-neutral-800">{col.label}</span>
                    <span className="rounded-full bg-white/80 border border-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600 tabular-nums">
                      {col.tasks.length}
                    </span>
                  </div>
                  {!hideAddInColumns && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg shrink-0 hover:bg-white/60"
                      onClick={() => openAdd(col.id)}
                    >
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>

                {/* Scrollable task area */}
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
                      <TaskCard
                        key={task.id}
                        task={task}
                        isSubtask={!!task.parentTask}
                        subtaskTotal={subtaskStats[task.id]?.total ?? 0}
                        subtaskDone={subtaskStats[task.id]?.done ?? 0}
                        onMove={(status) => handleUpdateStatus(task.id, status)}
                        onEdit={() => setEditTask(task)}
                        onDelete={() => handleDeleteTask(task.id)}
                        canDelete={canDeleteTask}
                        statuses={STATUSES}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        isDragging={draggedTask?.id === task.id}
                      />
                    ))}
                  </div>
                </div>

                {/* Fixed "Add new task" button at bottom */}
                {!hideAddInColumns && (
                  <div className="px-3 py-2.5 border-t border-neutral-200 shrink-0 bg-white/80 backdrop-blur-sm rounded-b-2xl">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center gap-2 text-muted-foreground hover:text-neutral-900 hover:bg-neutral-100 rounded-xl h-9"
                      onClick={() => openAdd(col.id)}
                    >
                      <Plus className="h-4 w-4" />
                      Add new task
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AddTaskDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultStatus={addDefaultStatus}
        contextProjectId={projectId}
        employees={employees}
        projects={projects}
        onAdd={handleAddTask}
        saving={saving}
      />

      {editTask && (
        <TaskEditDialog
          task={editTask}
          allTasks={tasks}
          employees={employees}
          projects={projects}
          open={!!editTask}
          onOpenChange={(open) => !open && setEditTask(null)}
          onSave={handleSaveEdit}
          onAddChildIssue={handleAddChildIssue}
          onDelete={() => handleDeleteTask(editTask.id)}
          canDelete={canDeleteTask}
          saving={saving}
        />
      )}

      <ConfirmDialog
        open={!!deleteTaskId}
        onOpenChange={(open) => !open && setDeleteTaskId(null)}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={confirmDeleteTask}
        isLoading={isDeleting}
      />
    </div>
  );
}

function TaskCard({
  task,
  isSubtask,
  subtaskTotal,
  subtaskDone,
  onMove,
  onEdit,
  onDelete,
  canDelete,
  statuses,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  task: Task;
  isSubtask?: boolean;
  subtaskTotal?: number;
  subtaskDone?: number;
  onMove: (status: BoardColumnStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
  canDelete?: boolean;
  statuses: { id: BoardColumnStatus; label: string }[];
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
}) {
  const priority = PRIORITIES.find((p) => p.id === task.priority);
  const taskType = TASK_TYPES.find((t) => t.id === (task.type ?? "task"));
  const boardStatus = normalizeTaskStatus(task.status);
  const showSubtaskProgress = !isSubtask && (subtaskTotal ?? 0) > 0;
  const subtaskPercent = showSubtaskProgress
    ? Math.round(((subtaskDone ?? 0) / (subtaskTotal ?? 1)) * 100)
    : 0;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, task)}
      onDragEnd={onDragEnd}
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => e.key === "Enter" && onEdit()}
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-3 text-left shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-2",
        isSubtask && "ml-4 border-dashed bg-slate-50/60",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {taskType && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
                taskType.pillClass
              )}
            >
              {taskType.label}
            </span>
          )}
          {priority && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
                priority.pillClass
              )}
            >
              {priority.label}
            </span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl w-48">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {statuses.map((s) =>
              s.id !== task.status ? (
                <DropdownMenuItem
                  key={s.id}
                  onClick={(e) => { e.stopPropagation(); onMove(s.id); }}
                >
                  Move to {s.label}
                </DropdownMenuItem>
              ) : null
            )}
            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                >
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="font-semibold text-sm text-neutral-900 line-clamp-2 mb-1">
        {isSubtask ? "Subtask: " : ""}
        {task.title}
      </p>
      {task.dueDate && (
        <p className="text-xs text-muted-foreground mb-2">{formatCardDate(task.dueDate)}</p>
      )}
      {task.description && task.description !== "<p></p>" && (
        <div
          className="text-xs text-muted-foreground line-clamp-2 mb-3 [&_a]:text-primary [&_a]:underline"
          dangerouslySetInnerHTML={{
            __html: task.description.includes("<") ? task.description : `<p>${task.description}</p>`,
          }}
        />
      )}
      {/* Progress placeholder - single step based on status */}
      <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{
            width:
              boardStatus === "done"
                ? "100%"
                : boardStatus === "rejected"
                  ? "100%"
                  : boardStatus === "in_review"
                    ? "75%"
                    : boardStatus === "hold"
                      ? "55%"
                      : boardStatus === "in_progress"
                        ? "50%"
                        : "10%",
          }}
        />
      </div>
      {showSubtaskProgress && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Subtasks</span>
            <span>{subtaskDone}/{subtaskTotal}</span>
          </div>
          <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${subtaskPercent}%` }}
            />
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {(task.assignees && task.assignees.length > 0) ? (
            <div className="flex -space-x-1.5">
              {task.assignees.slice(0, 3).map((a) => (
                <Avatar key={a.id} className="h-6 w-6 border-2 border-white" title={a.name}>
                  <AvatarFallback className="text-[10px] bg-neutral-200 text-neutral-700">
                    {a.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {task.assignees.length > 3 && (
                <span className="text-[10px] text-muted-foreground ml-1">+{task.assignees.length - 3}</span>
              )}
            </div>
          ) : task.assignee ? (
            <Avatar className="h-6 w-6 border border-white" title={task.assignee.name}>
              <AvatarFallback className="text-[10px] bg-neutral-200 text-neutral-700">
                {task.assignee.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <span className="text-[10px] text-muted-foreground">Unassigned</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          {typeof task.timeEstimateMinutes === "number" && task.timeEstimateMinutes > 0 && (
            <span className="text-[10px] font-medium">{task.timeEstimateMinutes}m</span>
          )}
          <span className="flex items-center gap-0.5 text-[10px]">
            <Eye className="h-3 w-3" /> 0
          </span>
          <span className="flex items-center gap-0.5 text-[10px]">
            <MessageSquare className="h-3 w-3" /> 0
          </span>
          <span className="flex items-center gap-0.5 text-[10px]">
            <Paperclip className="h-3 w-3" /> 0
          </span>
        </div>
      </div>
    </div>
  );
}

function AddTaskDialog({
  open,
  onOpenChange,
  defaultStatus,
  contextProjectId,
  employees,
  projects,
  onAdd,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus: BoardColumnStatus;
  contextProjectId?: string;
  employees: { id: string; name: string; email: string }[];
  projects: ProjectOption[];
  onAdd: (form: any) => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<Task["type"]>("task");
  const [status, setStatus] = useState<BoardColumnStatus>(defaultStatus);
  const [assigneeId, setAssigneeId] = useState<string>("__unassigned__");
  const [reporterId, setReporterId] = useState<string>("__none__");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [timeEstimateMinutes, setTimeEstimateMinutes] = useState<string>("");
  const [priority, setPriority] = useState("medium");
  const [projectId, setProjectId] = useState<string>(projects[0]?.id ?? "__none__");

  useEffect(() => {
    if (open) setStatus(defaultStatus);
  }, [open, defaultStatus]);

  useEffect(() => {
    if (open && (projectId === "__none__" || !projectId) && projects.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [open, projectId, projects]);

  function submit() {
    if (!title.trim()) {
      toast.error("Task name is required");
      return;
    }
    if (!assigneeId || assigneeId === "__unassigned__") {
      toast.error("Assignee is required");
      return;
    }
    if (!startDate) {
      toast.error("Start date is required");
      return;
    }
    if (!dueDate) {
      toast.error("End date is required");
      return;
    }
    const resolvedProjectId =
      contextProjectId || (projectId && projectId !== "__none__" ? projectId : "");
    if (!resolvedProjectId) {
      toast.error("Project is required");
      return;
    }
    onAdd({
      title,
      description,
      type,
      status,
      assigneeId,
      reporterId: reporterId !== "__none__" ? reporterId : undefined,
      startDate,
      dueDate,
      timeEstimateMinutes: timeEstimateMinutes ? Number(timeEstimateMinutes) : undefined,
      priority,
      projectId: resolvedProjectId,
    });
    setTitle("");
    setDescription("");
    setType("task");
    setStatus(defaultStatus);
    setAssigneeId("__unassigned__");
    setReporterId("__none__");
    setStartDate("");
    setDueDate("");
    setTimeEstimateMinutes("");
    setPriority("medium");
    setProjectId(projects[0]?.id ?? "__none__");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="add-title">Task name <span className="text-red-500">*</span></Label>
            <Input
              id="add-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task name"
              className="rounded-xl"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="add-desc">Task description</Label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Description (formatting, links…)"
              minHeight="100px"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as Task["type"])}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as BoardColumnStatus)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Task["priority"])}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Assignee <span className="text-red-500">*</span></Label>
              <Select value={assigneeId || "__unassigned__"} onValueChange={setAssigneeId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__unassigned__" disabled>Select assignee</SelectItem>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Reporter (optional)</Label>
              <Select value={reporterId} onValueChange={setReporterId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {employees.map((e) => (
                    <SelectItem key={`reporter-${e.id}`} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="add-estimate">Time estimate (minutes)</Label>
              <Input
                id="add-estimate"
                type="number"
                min={0}
                value={timeEstimateMinutes}
                onChange={(e) => setTimeEstimateMinutes(e.target.value)}
                placeholder="e.g. 120"
                className="rounded-xl"
              />
            </div>
            {!contextProjectId && (
              <div className="grid gap-2">
                <Label>Project <span className="text-red-500">*</span></Label>
                <Select value={projectId || "__none__"} onValueChange={setProjectId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" disabled>
                      Select project
                    </SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="add-start">Start date <span className="text-red-500">*</span></Label>
              <Input
                id="add-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-due">End date <span className="text-red-500">*</span></Label>
              <Input
                id="add-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving} className="rounded-xl">
            {saving ? "Adding…" : "Add task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TaskEditDialog({
  task,
  allTasks,
  employees,
  projects,
  open,
  onOpenChange,
  onSave,
  onAddChildIssue,
  onDelete,
  canDelete,
  saving,
}: {
  task: Task;
  allTasks: Task[];
  employees: { id: string; name: string; email: string }[];
  projects: ProjectOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (form: any) => void;
  onAddChildIssue: (
    parentTaskId: string,
    form: {
      title: string;
      description?: string;
      type: Task["type"];
      status: BoardColumnStatus;
      assigneeId?: string;
      reporterId?: string;
      startDate?: string;
      dueDate?: string;
      timeEstimateMinutes?: number | null;
      priority: Task["priority"];
    }
  ) => Promise<void>;
  onDelete: () => void;
  canDelete?: boolean;
  saving: boolean;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [type, setType] = useState<Task["type"]>(task.type ?? "task");
  const [status, setStatus] = useState<BoardColumnStatus>(normalizeTaskStatus(task.status));
  const [assigneeId, setAssigneeId] = useState(task.assignee?.id ?? "__unassigned__");
  const [reporterId, setReporterId] = useState(task.reporter?.id ?? "__none__");
  const [startDate, setStartDate] = useState(
    task.startDate ? new Date(task.startDate).toISOString().slice(0, 10) : ""
  );
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ""
  );
  const [timeEstimateMinutes, setTimeEstimateMinutes] = useState(
    typeof task.timeEstimateMinutes === "number" ? String(task.timeEstimateMinutes) : ""
  );
  const [priority, setPriority] = useState(task.priority);
  const [projectId, setProjectId] = useState(task.project ?? "__none__");
  const [parentTaskId, setParentTaskId] = useState(task.parentTask ?? "__none__");

  const [showChildForm, setShowChildForm] = useState(false);
  const [childTitle, setChildTitle] = useState("");
  const [childType, setChildType] = useState<Task["type"]>("task");
  const [childStatus, setChildStatus] = useState<BoardColumnStatus>("backlog");
  const [childAssigneeId, setChildAssigneeId] = useState("__unassigned__");
  const [childReporterId, setChildReporterId] = useState("__none__");
  const [childStartDate, setChildStartDate] = useState("");
  const [childDueDate, setChildDueDate] = useState("");
  const [childPriority, setChildPriority] = useState<Task["priority"]>("medium");
  const [childEstimateMinutes, setChildEstimateMinutes] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "subtasks" | "comments">("details");

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setType(task.type ?? "task");
    setStatus(normalizeTaskStatus(task.status));
    setAssigneeId(task.assignee?.id ?? "__unassigned__");
    setReporterId(task.reporter?.id ?? "__none__");
    setStartDate(task.startDate ? new Date(task.startDate).toISOString().slice(0, 10) : "");
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "");
    setTimeEstimateMinutes(typeof task.timeEstimateMinutes === "number" ? String(task.timeEstimateMinutes) : "");
    setPriority(task.priority);
    setProjectId(task.project ?? "__none__");
    setParentTaskId(task.parentTask ?? "__none__");
  }, [task]);

  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("task_board_edit_tab");
    if (saved === "details" || saved === "subtasks" || saved === "comments") {
      setActiveTab(saved);
    }
  }, [open, task.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("task_board_edit_tab", activeTab);
  }, [activeTab]);

  const childIssues = allTasks.filter((t) => t.parentTask === task.id);
  const parentOptions = allTasks.filter((t) => t.id !== task.id && !t.parentTask);

  async function shareSubtask(child: Task) {
    const url = `${window.location.origin}/dashboard/todo?taskId=${child.id}&tab=subtasks`;
    try {
      if (navigator.share) {
        await navigator.share({ title: child.title, text: `Subtask: ${child.title}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Subtask link copied");
      }
    } catch {
      // noop
    }
  }

  function submit() {
    if (!title.trim()) {
      toast.error("Task name is required");
      return;
    }
    if (!assigneeId || assigneeId === "__unassigned__") {
      toast.error("Assignee is required");
      return;
    }
    if (!startDate) {
      toast.error("Start date is required");
      return;
    }
    if (!dueDate) {
      toast.error("End date is required");
      return;
    }
    if (!projectId || projectId === "__none__") {
      toast.error("Project is required");
      return;
    }
    onSave({
      title,
      description,
      type,
      status,
      assigneeId,
      reporterId: reporterId !== "__none__" ? reporterId : null,
      startDate,
      dueDate,
      timeEstimateMinutes: timeEstimateMinutes ? Number(timeEstimateMinutes) : null,
      priority,
      parentTaskId: parentTaskId !== "__none__" ? parentTaskId : null,
      projectId,
    });
  }

  async function submitChildIssue() {
    if (!childTitle.trim()) {
      toast.error("Child issue title is required");
      return;
    }
    if (!childAssigneeId || childAssigneeId === "__unassigned__") {
      toast.error("Assignee is required");
      return;
    }
    if (!childStartDate) {
      toast.error("Start date is required");
      return;
    }
    if (!childDueDate) {
      toast.error("End date is required");
      return;
    }
    await onAddChildIssue(task.id, {
      title: childTitle.trim(),
      type: childType,
      status: childStatus,
      assigneeId: childAssigneeId,
      reporterId: childReporterId !== "__none__" ? childReporterId : undefined,
      startDate: childStartDate,
      dueDate: childDueDate,
      timeEstimateMinutes: childEstimateMinutes ? Number(childEstimateMinutes) : null,
      priority: childPriority,
    });
    setChildTitle("");
    setChildType("task");
    setChildStatus("backlog");
    setChildAssigneeId("__unassigned__");
    setChildReporterId("__none__");
    setChildStartDate("");
    setChildDueDate("");
    setChildPriority("medium");
    setChildEstimateMinutes("");
    setShowChildForm(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl">
        <DialogHeader>
          <DialogTitle>{title || "Edit task"}</DialogTitle>
          <div className="flex gap-1 mt-2 border-b">
            <button
              type="button"
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 -mb-px",
                activeTab === "details" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
              )}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>
            <button
              type="button"
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 -mb-px",
                activeTab === "subtasks" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
              )}
              onClick={() => setActiveTab("subtasks")}
            >
              Subtasks
            </button>
            <button
              type="button"
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 -mb-px",
                activeTab === "comments" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
              )}
              onClick={() => setActiveTab("comments")}
            >
              Comments
            </button>
          </div>
        </DialogHeader>
        {activeTab === "comments" ? (
          <TaskCommentThread taskId={task.id} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-0 min-h-0 flex-1 overflow-hidden border rounded-xl">
            <div className="overflow-y-auto p-5 space-y-5">
              {activeTab === "details" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-title">Task name <span className="text-red-500">*</span></Label>
                    <Input
                      id="edit-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Task name"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-desc">Description</Label>
                    <RichTextEditor
                      value={description}
                      onChange={setDescription}
                      placeholder="Add description"
                      minHeight="140px"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-start">Start date <span className="text-red-500">*</span></Label>
                      <Input
                        id="edit-start"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-due">End date <span className="text-red-500">*</span></Label>
                      <Input
                        id="edit-due"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Subtasks</h3>
                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setShowChildForm((v) => !v)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add subtask
                </Button>
              </div>
              {childIssues.length === 0 ? (
                <p className="text-xs text-muted-foreground">No subtasks yet.</p>
              ) : (
                <div className="space-y-2">
                  {childIssues.map((child) => (
                    <div key={child.id} className="rounded-lg border px-3 py-2 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium">{child.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {STATUSES.find((s) => s.id === normalizeTaskStatus(child.status))?.label || child.status}
                            {" · "}
                            {child.assignee?.name || "Unassigned"}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg shrink-0">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl w-36">
                            <DropdownMenuItem onClick={() => shareSubtask(child)}>Share</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showChildForm && (
                <div className="grid gap-3 rounded-xl border p-3 bg-muted/20">
                  <Input
                    value={childTitle}
                    onChange={(e) => setChildTitle(e.target.value)}
                    placeholder="Child issue title"
                    className="rounded-xl"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Select value={childType} onValueChange={(v) => setChildType(v as Task["type"])}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>{TASK_TYPES.map((t) => <SelectItem key={`child-type-${t.id}`} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={childStatus} onValueChange={(v) => setChildStatus(v as BoardColumnStatus)}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={`child-status-${s.id}`} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={childPriority} onValueChange={(v) => setChildPriority(v as Task["priority"])}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Priority" /></SelectTrigger>
                      <SelectContent>{PRIORITIES.map((p) => <SelectItem key={`child-priority-${p.id}`} value={p.id}>{p.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={0}
                      value={childEstimateMinutes}
                      onChange={(e) => setChildEstimateMinutes(e.target.value)}
                      placeholder="Estimate (min)"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={childAssigneeId} onValueChange={setChildAssigneeId}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Assignee" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__unassigned__" disabled>Select assignee</SelectItem>
                        {employees.map((e) => <SelectItem key={`child-assignee-${e.id}`} value={e.id}>{e.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={childReporterId} onValueChange={setChildReporterId}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Reporter" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No reporter</SelectItem>
                        {employees.map((e) => <SelectItem key={`child-reporter-${e.id}`} value={e.id}>{e.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="date" value={childStartDate} onChange={(e) => setChildStartDate(e.target.value)} className="rounded-xl" />
                    <Input type="date" value={childDueDate} onChange={(e) => setChildDueDate(e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setShowChildForm(false)}>Cancel</Button>
                    <Button size="sm" className="rounded-lg" onClick={submitChildIssue} disabled={saving}>
                      {saving ? "Adding..." : "Create subtask"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            </div>
            <div className="border-l bg-muted/20 p-4 overflow-y-auto space-y-4">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as BoardColumnStatus)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={`status-${s.id}`} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Task["priority"])}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={`priority-${p.id}`} value={p.id}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as Task["type"])}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{TASK_TYPES.map((t) => <SelectItem key={`type-${t.id}`} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Assignee <span className="text-red-500">*</span></Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select assignee" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__unassigned__" disabled>Select assignee</SelectItem>
                  {employees.map((e) => <SelectItem key={`assignee-${e.id}`} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Reporter</Label>
              <Select value={reporterId} onValueChange={setReporterId}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="No reporter" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No reporter</SelectItem>
                  {employees.map((e) => <SelectItem key={`reporter-${e.id}`} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Project <span className="text-red-500">*</span></Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__" disabled>Select project</SelectItem>
                  {projects.map((p) => <SelectItem key={`project-${p.id}`} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Parent task</Label>
              <Select value={parentTaskId} onValueChange={setParentTaskId}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="No parent" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No parent</SelectItem>
                  {parentOptions.map((p) => <SelectItem key={`parent-${p.id}`} value={p.id}>{p.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Time estimation</Label>
              <Input
                type="number"
                min={0}
                value={timeEstimateMinutes}
                onChange={(e) => setTimeEstimateMinutes(e.target.value)}
                placeholder="Click and enter minutes"
                className="rounded-xl"
              />
            </div>
            {(task.projectName || task.reportingManager) && (
              <div className="rounded-xl border bg-background p-3 text-sm space-y-1">
                {task.projectName && (
                  <div>
                    <span className="text-muted-foreground">Project</span>
                    <div className="font-medium">{task.projectName}</div>
                  </div>
                )}
                {task.reportingManager && (
                  <div>
                    <span className="text-muted-foreground">Manager</span>
                    <div className="font-medium">{task.reportingManager.name}</div>
                  </div>
                )}
              </div>
            )}
          </div>
          </div>
        )}
        <DialogFooter className="flex-row justify-between sm:justify-between gap-2 pt-4">
          {canDelete ? (
            <Button
              variant="destructive"
              onClick={onDelete}
              className="rounded-xl"
            >
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving} className="rounded-xl">
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TaskCommentThread({ taskId }: { taskId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`/api/tasks/${taskId}/comments`);
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setComments(data.comments || []);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [taskId]);

  async function handleSend() {
    const text = newComment.trim();
    if (!text) return;
    setSending(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text, parentId: replyTo?.id || null }),
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

  const topLevel = comments.filter((c) => !c.parentId);
  const repliesMap = new Map<string, Comment[]>();
  for (const c of comments) {
    if (!c.parentId) continue;
    if (!repliesMap.has(c.parentId)) repliesMap.set(c.parentId, []);
    repliesMap.get(c.parentId)!.push(c);
  }

  function relative(dateStr: string) {
    const d = new Date(dateStr);
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 overflow-y-auto min-h-0 px-1 py-2 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No comments yet.</p>
        ) : (
          topLevel.map((comment) => (
            <div key={comment.id} className="space-y-2">
              <div className="rounded-xl bg-muted p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">{comment.authorName}</p>
                  <p className="text-[10px] text-muted-foreground">{relative(comment.createdAt)}</p>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
                <button
                  type="button"
                  className="mt-2 text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  onClick={() => setReplyTo(comment)}
                >
                  <Reply className="h-3 w-3" />
                  Reply
                </button>
              </div>
              {(repliesMap.get(comment.id) || []).map((reply) => (
                <div key={reply.id} className="ml-8 rounded-xl border p-3">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                    <CornerDownRight className="h-3 w-3" />
                    {reply.authorName} · {relative(reply.createdAt)}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{reply.body}</p>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {replyTo && (
        <div className="mx-1 mb-2 rounded-xl border bg-blue-50 px-3 py-2 text-xs text-blue-700 flex items-center gap-2">
          Replying to {replyTo.authorName}
          <button type="button" className="ml-auto" onClick={() => setReplyTo(null)}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="px-1 pb-1 flex gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={replyTo ? `Reply to ${replyTo.authorName}...` : "Write a comment..."}
          className="rounded-xl"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
        />
        <Button size="icon" className="rounded-xl" disabled={sending || !newComment.trim()} onClick={() => void handleSend()}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
