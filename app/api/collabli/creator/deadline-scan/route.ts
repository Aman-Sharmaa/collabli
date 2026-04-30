import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { Deal } from "@/models/Deal";
import { CollabliNotification } from "@/models/CollabliNotification";
import { User } from "@/models/User";

/** Call from dashboard to enqueue deadline reminders (within 72h). */
export async function POST() {
  const user = await requireSessionUser(["creator"]);
  await connectDB();
  const deals = await Deal.find({
    creatorId: user.userId,
    status: { $in: ["pending", "active", "submitted"] },
  })
    .populate("campaignId", "title deadline")
    .lean();

  const prefs = await User.findById(user.userId).select("notificationPrefs").lean();
  const deadlinesOk =
    (prefs as { notificationPrefs?: { deadlines?: boolean } } | null)?.notificationPrefs?.deadlines !== false;

  let created = 0;
  const now = Date.now();
  for (const d of deals) {
    if (d.deadlineReminderSentAt) continue;
    const camp = d.campaignId as { deadline?: Date; title?: string } | null;
    const dl = camp?.deadline ? new Date(camp.deadline).getTime() : 0;
    if (!dl) continue;
    const hours = (dl - now) / 3600000;
    if (hours < 0 || hours > 72) continue;
    await Deal.updateOne({ _id: d._id }, { $set: { deadlineReminderSentAt: new Date() } });
    if (deadlinesOk) {
      await CollabliNotification.create({
        userId: user.userId,
        title: "Deadline reminder",
        body: `"${camp?.title || "Campaign"}" deadline is within 72 hours.`,
        type: "deadline",
        dealId: d._id,
      });
      created++;
    }
  }

  return NextResponse.json({ remindersCreated: created });
}
