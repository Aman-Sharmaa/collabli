import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { CollabliTransaction } from "@/models/CollabliTransaction";
import { Deal } from "@/models/Deal";

export async function GET() {
  const user = await requireSessionUser(["creator"]);
  await connectDB();

  const [earnings, withdrawals] = await Promise.all([
    CollabliTransaction.find({ userId: user.userId, type: "earning", status: "completed" }).lean(),
    CollabliTransaction.find({ userId: user.userId, type: "withdrawal", status: "completed" }).lean(),
  ]);

  const totalEarned = earnings.reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalWithdrawn = withdrawals.reduce((s, t) => s + Number(t.amount || 0), 0);
  const balance = Math.max(0, totalEarned - totalWithdrawn);

  const activeDeals = await Deal.find({
    creatorId: user.userId,
    status: { $in: ["pending", "active", "submitted"] },
  })
    .populate("campaignId", "title deadline")
    .lean();

  const pendingEstimate = activeDeals.reduce((s, d) => {
    const net = Number(d.amount || 0) - Number(d.commissionAmount || 0);
    return s + Math.max(0, net);
  }, 0);

  return NextResponse.json({
    totalEarned,
    totalWithdrawn,
    balance,
    pendingEstimate,
    activeDeals,
  });
}
