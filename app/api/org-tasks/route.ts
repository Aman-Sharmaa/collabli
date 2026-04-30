import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Task } from "@/models/Task";
import { Employee } from "@/models/Employee";
import { Project } from "@/models/Project";
import { Board } from "@/models/Board";
import { Sprint } from "@/models/Sprint";
import { TaskComment } from "@/models/TaskComment";
import { sendMail } from "@/lib/mailer";
import { ensureEmployeeByEmail } from "@/lib/ensure-employee";

const COOKIE_NAME = "kalp_auth_token";

const TASK_TYPE_VALUES = ["task", "bug", "social_media_planner"] as const;
const SOCIAL_PLATFORM_VALUES = ["instagram", "linkedin", "youtube", "twitter_x", "facebook", "multiple"] as const;
const SOCIAL_POST_TYPE_VALUES = ["reel", "carousel", "image_post", "story", "video", "thread"] as const;
const SOCIAL_PROGRESS_VALUES = [
  "content_planning",
  "script_ready",
  "design_ready",
  "scheduled",
  "posted",
  "performance_tracking",
  "completed",
] as const;

function toNonNegativeNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
  return Math.round(value);
}

function sanitizeSocialMediaPlanner(input: any) {
  if (!input || typeof input !== "object") return null;
  const goalTargets = input.goalTargets && typeof input.goalTargets === "object" ? input.goalTargets : {};
  const contentPlan = input.contentPlan && typeof input.contentPlan === "object" ? input.contentPlan : {};
  const progressStatus = SOCIAL_PROGRESS_VALUES.includes(input.progressStatus)
    ? input.progressStatus
    : "content_planning";

  return {
    platforms: Array.isArray(input.platforms)
      ? input.platforms.filter((p: unknown) => SOCIAL_PLATFORM_VALUES.includes(p as any))
      : [],
    pagesAccounts: Array.isArray(input.pagesAccounts)
      ? input.pagesAccounts
          .filter((p: unknown) => typeof p === "string")
          .map((p: string) => p.trim())
          .filter(Boolean)
      : [],
    linkedProjectIds: Array.isArray(input.linkedProjectIds)
      ? input.linkedProjectIds.filter((id: unknown) => typeof id === "string" && id.trim().length > 0)
      : [],
    postTypes: Array.isArray(input.postTypes)
      ? input.postTypes.filter((p: unknown) => SOCIAL_POST_TYPE_VALUES.includes(p as any))
      : [],
    goalTargets: {
      targetViews: toNonNegativeNumber(goalTargets.targetViews),
      targetLikes: toNonNegativeNumber(goalTargets.targetLikes),
      targetComments: toNonNegativeNumber(goalTargets.targetComments),
      targetShares: toNonNegativeNumber(goalTargets.targetShares),
      targetFollowersGain: toNonNegativeNumber(goalTargets.targetFollowersGain),
    },
    contentPlan: {
      richText: typeof contentPlan.richText === "string" ? contentPlan.richText : "",
      captionIdea: typeof contentPlan.captionIdea === "string" ? contentPlan.captionIdea : "",
      hook: typeof contentPlan.hook === "string" ? contentPlan.hook : "",
      hashtags: typeof contentPlan.hashtags === "string" ? contentPlan.hashtags : "",
      callToAction: typeof contentPlan.callToAction === "string" ? contentPlan.callToAction : "",
    },
    postingDate: input.postingDate ? new Date(input.postingDate) : null,
    postingTime: typeof input.postingTime === "string" ? input.postingTime : null,
    progressStatus,
  };
}

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

// ─── GET: fetch tasks + optional metadata (projects & employees) ───
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await connectDB();

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const assigneeId = searchParams.get("assigneeId");
    const priority = searchParams.get("priority");
    const sprintId = searchParams.get("sprintId");
    const includeMeta = searchParams.get("include") === "meta";

    const filter: Record<string, unknown> = {};

    // Assignee filter — resolve __me__ once
    if (assigneeId === "__me__") {
      const emp = await ensureEmployeeByEmail(user.email);
      if (emp) {
        const empId = (emp as any)._id;
        filter.$or = [{ assignees: empId }, { assignee: empId }];
      }
    } else if (user.role === "employee" && (!assigneeId || assigneeId === "__all__")) {
      // Department-based filtering: employees see their department's tasks
      const emp = await Employee.findOne({ email: user.email }).select("_id department").lean();
      if (emp && (emp as any).department) {
        const deptMembers = await Employee.find({
          department: (emp as any).department,
          isDismissed: { $ne: true },
        }).select("_id").lean();
        const memberIds = deptMembers.map((m: any) => m._id);
        filter.$or = [{ assignees: { $in: memberIds } }, { assignee: { $in: memberIds } }];
      } else if (emp) {
        const empId = (emp as any)._id;
        filter.$or = [{ assignees: empId }, { assignee: empId }];
      }
    } else if (assigneeId && assigneeId !== "__all__") {
      filter.$or = [{ assignees: assigneeId }, { assignee: assigneeId }];
    }

    // ── Outsider restriction: always force "own tasks only" ──
    if (user.role === "employee") {
      const outsiderCheck = await Employee.findOne({ email: user.email }).select("_id isOutsider").lean();
      if (outsiderCheck && (outsiderCheck as any).isOutsider) {
        const outsiderId = outsiderCheck._id;
        delete (filter as any).$or;
        filter.$or = [
          { assignees: outsiderId },
          { assignee: outsiderId },
        ];
      }
    }

    // Project filter
    if (projectId && projectId !== "__all__") {
      filter.project = projectId;
    }

    // Priority filter
    if (priority && priority !== "__all__") {
      filter.priority = priority;
    }

    // Sprint filter
    if (sprintId === "__none__") {
      filter.sprint = null;
    } else if (sprintId && sprintId !== "__all__") {
      filter.sprint = sprintId;
    }

    // ── Run queries in parallel ──
    const tasksPromise = Task.find(filter)
      .select("title description type status assignee assignees project sprint parentTask startDate dueDate priority order createdAt socialMediaPlanner")
      .populate("reporter", "name email avatarUrl")
      .sort({ order: 1, createdAt: -1 })
      .lean();

    // Only fetch meta when client asks for it (initial load)
    const metaPromise = includeMeta
      ? (async () => {
          let projectMetaFilter: Record<string, any> = {};
          if (user.role === "employee") {
            const emp = await Employee.findOne({ email: user.email }).select("_id").lean();
            if (emp) {
              projectMetaFilter = { assignedMembers: (emp as any)._id };
            }
          }
          return Promise.all([
            Project.find(projectMetaFilter).select("name").sort({ name: 1 }).lean(),
            Employee.find({ isDismissed: { $ne: true } }).select("name email avatarUrl").sort({ name: 1 }).lean(),
            Sprint.find({}).sort({ status: 1, startDate: -1 }).lean(),
          ]);
        })()
      : Promise.resolve(null);

    const [rawTasks, meta] = await Promise.all([tasksPromise, metaPromise]);

    // ── Build lookup maps from task data ──
    const allAssigneeIds = new Set<string>();
    const allProjectIds = new Set<string>();

    for (const t of rawTasks as any[]) {
      if (Array.isArray(t.assignees)) {
        for (const a of t.assignees) allAssigneeIds.add(String(a));
      }
      if (t.assignee) allAssigneeIds.add(String(t.assignee));
      if (t.project) allProjectIds.add(String(typeof t.project === "object" && t.project._id ? t.project._id : t.project));
    }

    // Collect task IDs for comment counts
    const taskIds = (rawTasks as any[]).map((t) => t._id);

    // Batch-fetch employees, projects, and comment counts in parallel
    const [empDocs, projDocs, commentCounts] = await Promise.all([
      allAssigneeIds.size > 0
        ? Employee.find({ _id: { $in: [...allAssigneeIds] } }).select("name email avatarUrl").lean()
        : [],
      allProjectIds.size > 0
        ? Project.find({ _id: { $in: [...allProjectIds] } }).select("name").lean()
        : [],
      taskIds.length > 0
        ? TaskComment.aggregate([
            { $match: { task: { $in: taskIds } } },
            { $group: { _id: "$task", count: { $sum: 1 } } },
          ])
        : [],
    ]);

    const commentCountMap = new Map(
      (commentCounts as any[]).map((c) => [String(c._id), c.count as number])
    );

    const empMap = new Map(
      empDocs.map((e: any) => [
        String(e._id),
        { id: String(e._id), name: e.name, email: e.email, avatarUrl: e.avatarUrl || null },
      ])
    );
    const projMap = new Map(projDocs.map((p: any) => [String(p._id), { id: String(p._id), name: p.name }]));

    // ── Map tasks ──
    const tasks = (rawTasks as any[]).map((t) => {
      const ids: string[] = Array.isArray(t.assignees) && t.assignees.length > 0
        ? t.assignees.map(String)
        : t.assignee ? [String(t.assignee)] : [];

      const assignees = ids.map((id) => empMap.get(id)).filter(Boolean);
      const pid = t.project ? String(typeof t.project === "object" && t.project._id ? t.project._id : t.project) : null;

      const normalizedStatus =
        t.status === "code_review" || t.status === "qa" ? "in_review" : t.status;

      return {
        id: String(t._id),
        project: pid,
        projectName: pid ? projMap.get(pid)?.name ?? "—" : "—",
        sprint: t.sprint ? String(t.sprint) : null,
        parentTask: t.parentTask ? String(t.parentTask) : null,
        title: t.title,
        description: t.description || "",
        type: (t as any).type || "task",
        status: normalizedStatus,
        assignee: assignees[0] || null,
        assignees,
        reporter:
          (t as any).reporter && typeof (t as any).reporter === "object"
            ? {
                id: String((t as any).reporter._id),
                name: (t as any).reporter.name,
                email: (t as any).reporter.email,
                avatarUrl: (t as any).reporter.avatarUrl || null,
              }
            : null,
        startDate: t.startDate || null,
        dueDate: t.dueDate || null,
        priority: t.priority,
        order: t.order ?? 0,
        createdAt: t.createdAt,
        commentCount: commentCountMap.get(String(t._id)) || 0,
        socialMediaPlanner: (t as any).socialMediaPlanner || null,
      };
    });

    // ── Build response ──
    const response: Record<string, unknown> = { tasks };

    if (meta) {
      const [allProjects, allEmployees, allSprints] = meta;
      response.projects = (allProjects as any[]).map((p) => ({ id: String(p._id), name: p.name }));
      response.employees = (allEmployees as any[]).map((e) => ({
        id: String(e._id),
        name: e.name,
        email: e.email,
        avatarUrl: e.avatarUrl || null,
      }));
      response.sprints = (allSprints as any[]).map((s) => ({
        id: String(s._id),
        name: s.name,
        startDate: s.startDate || null,
        endDate: s.endDate || null,
        status: s.status,
      }));
    }

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("GET /api/org-tasks error:", err);
    return NextResponse.json({ message: err.message || "Server error", tasks: [] }, { status: 500 });
  }
}

// ─── POST: create a task ───
export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await connectDB();

    const body = await req.json();
    const {
      projectId,
      title,
      description,
      status,
      assigneeIds,
      reporterId,
      startDate,
      dueDate,
      priority,
      type,
      sprintId,
      parentTaskId,
      includeProjectManager,
      socialMediaPlanner,
    } = body;

    if (!title || !String(title).trim()) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }

    // Get or create general board
    let generalBoard = await Board.findOne({ type: "General" }).select("_id").lean();
    if (!generalBoard) {
      generalBoard = (await Board.create({ name: "General", type: "General", order: 0 })).toObject();
    }
    const boardId = (generalBoard as any)._id;

    const ids: string[] = Array.isArray(assigneeIds) ? assigneeIds.filter(Boolean) : [];
    const currentEmployee = await ensureEmployeeByEmail(user.email);

    // Auto-assign employee to themselves if no assignees
    if (ids.length === 0 && currentEmployee) {
      ids.push(String((currentEmployee as any)._id));
    }

    if (includeProjectManager && projectId) {
      const projectDoc = await Project.findById(projectId).select("manager").lean();
      if (projectDoc && (projectDoc as any).manager) {
        const managerId = String((projectDoc as any).manager);
        if (!ids.includes(managerId)) ids.push(managerId);
      }
    }

    const count = await Task.countDocuments(projectId ? { project: projectId } : { board: boardId });

    const task = await Task.create({
      project: projectId || null,
      board: boardId,
      sprint: sprintId || null,
      parentTask: parentTaskId || null,
      reporter: reporterId || (currentEmployee ? String((currentEmployee as any)._id) : null),
      title: String(title).trim(),
      description: description || "",
      type: TASK_TYPE_VALUES.includes(type) ? type : "task",
      status: status || "todo",
      assignee: ids[0] || null,
      assignees: ids,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || "medium",
      order: count,
      socialMediaPlanner:
        type === "social_media_planner"
          ? sanitizeSocialMediaPlanner(socialMediaPlanner)
          : null,
    });

    // Resolve assignee details
    const empDocs = ids.length > 0
      ? await Employee.find({ _id: { $in: ids } }).select("name email avatarUrl").lean()
      : [];
    const assignees = empDocs.map((e: any) => ({
      id: String(e._id),
      name: e.name,
      email: e.email,
      avatarUrl: e.avatarUrl || null,
    }));
    const reporterEmployeeId = reporterId || (currentEmployee ? String((currentEmployee as any)._id) : null);
    const reporterDoc = reporterEmployeeId
      ? await Employee.findById(reporterEmployeeId).select("name email avatarUrl").lean()
      : null;

    // Send emails in background (don't await)
    if (empDocs.length > 0) {
      const emailPromises = empDocs.map((emp: any) =>
        sendMail({
          to: emp.email,
          subject: `New Task Assigned: ${String(title).trim()}`,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto;">
              <h2 style="color: #111;">New Task Assigned to You</h2>
              <p style="color: #666;">Hi ${emp.name || "there"},</p>
              <div style="border: 1px solid #e5e5e5; border-radius: 12px; padding: 20px; margin: 16px 0; background: #fafafa;">
                <h3 style="margin: 0 0 8px 0; color: #111;">${String(title).trim()}</h3>
                <p style="color: #888; font-size: 13px; margin: 0;">
                  Priority: <strong>${priority || "medium"}</strong>
                  ${dueDate ? ` · Due: ${new Date(dueDate).toLocaleDateString()}` : ""}
                </p>
              </div>
            </div>
          `,
        }).catch(() => { /* email errors don't block */ })
      );
      // Fire and forget — don't block the response
      Promise.all(emailPromises).catch(() => {});
    }

    return NextResponse.json({
      task: {
        id: String(task._id),
        project: task.project ? String(task.project) : null,
        sprint: task.sprint ? String(task.sprint) : null,
        parentTask: (task as any).parentTask ? String((task as any).parentTask) : null,
        title: task.title,
        description: task.description || "",
        type: (task as any).type || "task",
        status: task.status,
        assignee: assignees[0] || null,
        assignees,
        reporter: reporterDoc
          ? {
              id: String((reporterDoc as any)._id),
              name: (reporterDoc as any).name || "",
              email: (reporterDoc as any).email || "",
              avatarUrl: (reporterDoc as any).avatarUrl || null,
            }
          : null,
        startDate: (task as any).startDate || null,
        dueDate: task.dueDate || null,
        priority: task.priority,
        order: task.order,
        socialMediaPlanner: (task as any).socialMediaPlanner || null,
      },
    }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/org-tasks error:", err);
    return NextResponse.json({ message: err.message || "Server error" }, { status: 500 });
  }
}
