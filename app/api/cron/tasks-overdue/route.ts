import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Task } from "@/models/Task";
import { Employee } from "@/models/Employee"; // Needed to register the model if not
import { sendMail } from "@/lib/mailer";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const now = new Date();

    // Fetch overdue tasks that are not complete
    const overdueTasks = await Task.find({
      dueDate: { $lt: now },
      status: { $nin: ["done", "rejected", "production"] },
    }).populate("assignees", "name email isOutsider");

    // Group tasks by assignee email
    const emailsToSend: Record<string, { employeeName: string; tasks: any[] }> = {};

    for (const task of overdueTasks) {
      if (!task.assignees || task.assignees.length === 0) continue;
      
      for (const employee of task.assignees as any[]) {
        if (!employee.email || employee.isOutsider) continue;
        if (!emailsToSend[employee.email]) {
          emailsToSend[employee.email] = {
            employeeName: employee.name,
            tasks: [],
          };
        }
        emailsToSend[employee.email].tasks.push(task);
      }
    }

    // Send emails
    let emailsSent = 0;
    for (const [email, data] of Object.entries(emailsToSend)) {
      if (data.tasks.length === 0) continue;

      const taskItems = data.tasks.map(t => {
        const dueDateFormatted = t.dueDate ? format(new Date(t.dueDate), "do MMM yyyy, h:mm a") : "Passed";
        return `
          <li style="margin-bottom: 8px;">
            <strong>${t.title}</strong>
            <br />
            <span style="color: #ef4444; font-size: 0.9em;">Overdue since: ${dueDateFormatted}</span>
          </li>
        `;
      }).join("");

      const subject = `You have ${data.tasks.length} overdue task(s)`;
      const html = `
        <div style="font-family: sans-serif; color: #333;">
          <p>Hi ${data.employeeName},</p>
          <p>This is a gentle reminder that the following task(s) assigned to you are currently overdue:</p>
          <ul style="padding-left: 20px;">
            ${taskItems}
          </ul>
          <p>Please log in to the Kalp dashboard to update their status.</p>
        </div>
      `;

      try {
        await sendMail({ to: email, subject, html });
        emailsSent++;
      } catch (err) {
        console.error(`Failed to send overdue notification to ${email}`, err);
      }
    }

    return NextResponse.json({ ok: true, emailsSent, totalOverdueProcessed: overdueTasks.length });
  } catch (err: any) {
    console.error("Cron failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
