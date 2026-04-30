import cron, { type ScheduledTask } from "node-cron";
import { connectDB } from "@/lib/db";
import { Task } from "@/models/Task";
import { User } from "@/models/User";
import { Employee } from "@/models/Employee";
import { sendMail } from "@/lib/mailer";
import { taskOverdueEmail, taskOverdueSummaryEmail } from "@/lib/email-templates";

let taskRef: ScheduledTask | null = null;

const DAILY_9AM = "0 9 * * *";

async function sendOverdueDigest() {
  try {
    await connectDB();

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const overdueTasks = await Task.find({
      dueDate: { $lt: now },
      status: { $ne: "done" },
    })
      .populate("assignees", "name email isOutsider")
      .lean();

    if (overdueTasks.length === 0) return;

    const byAssignee = new Map<string, { name: string; email: string; tasks: typeof overdueTasks }>();

    for (const task of overdueTasks) {
      const assignees = (task as any).assignees?.length
        ? (task as any).assignees
        : task.assignee
          ? [task.assignee]
          : [];

      for (const a of assignees) {
        if (!a?.email || a?.isOutsider) continue;
        const key = a.email;
        if (!byAssignee.has(key)) {
          byAssignee.set(key, { name: a.name || a.email, email: a.email, tasks: [] });
        }
        byAssignee.get(key)!.tasks.push(task);
      }
    }

    for (const [, { name, email, tasks }] of byAssignee) {
      try {
        await sendMail({
          to: email,
          subject: `You have ${tasks.length} overdue task${tasks.length > 1 ? "s" : ""}`,
          html: taskOverdueEmail({
            recipientName: name,
            tasks: tasks.map((t) => ({
              title: t.title,
              dueDate: t.dueDate
                ? new Date(t.dueDate).toLocaleDateString("en-IN")
                : "—",
              priority: t.priority,
            })),
          }),
        });
      } catch {
        // Individual email failures should not block others
      }
    }

    // Also send a summary to admins
    const admins = await User.find({ role: "admin" }).select("email name").lean();
    if (admins.length > 0) {
      const assigneeSummary = [...byAssignee.entries()].map(([, v]) => ({
        name: v.name,
        count: v.tasks.length,
      }));

      for (const admin of admins) {
        try {
          await sendMail({
            to: admin.email,
            subject: `Daily Overdue Tasks Summary: ${overdueTasks.length} overdue`,
            html: taskOverdueSummaryEmail({
              recipientName: admin.name || "Admin",
              totalOverdue: overdueTasks.length,
              assigneeSummary,
            }),
          });
        } catch {
          // Ignore individual email failures
        }
      }
    }

    console.log(`[task-cron] Sent overdue digest. ${overdueTasks.length} overdue tasks, ${byAssignee.size} assignees notified.`);
  } catch (err) {
    console.error("[task-cron] Overdue digest error:", err);
  }
}

export function startTaskCron() {
  if (taskRef) {
    console.log("[task-cron] Already running");
    return;
  }

  console.log("[task-cron] Starting daily overdue task digest (9 AM)");

  taskRef = cron.schedule(DAILY_9AM, () => {
    sendOverdueDigest();
  });
}

export function stopTaskCron() {
  if (taskRef) {
    taskRef.stop();
    taskRef = null;
    console.log("[task-cron] Stopped");
  }
}
