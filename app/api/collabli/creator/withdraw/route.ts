import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { CollabliTransaction } from "@/models/CollabliTransaction";

export async function POST(req: NextRequest) {
  const user = await requireSessionUser(["creator"]);
  const { amount, method, payoutDetails } = await req.json();
  const amt = Number(amount);
  if (!amt || amt <= 0) return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
  const m = method === "bank" ? "bank" : "upi";
  const details = String(payoutDetails || "").trim();
  if (!details) return NextResponse.json({ message: "UPI ID or bank details required" }, { status: 400 });

  await connectDB();
  const earnings = await CollabliTransaction.find({ userId: user.userId, type: "earning", status: "completed" }).lean();
  const withdrawals = await CollabliTransaction.find({ userId: user.userId, type: "withdrawal", status: "completed" }).lean();
  const totalEarned = earnings.reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalWithdrawn = withdrawals.reduce((s, t) => s + Number(t.amount || 0), 0);
  const balance = Math.max(0, totalEarned - totalWithdrawn);

  if (amt > balance) {
    return NextResponse.json({ message: "Insufficient balance" }, { status: 400 });
  }

  await CollabliTransaction.create({
    userId: user.userId,
    type: "withdrawal",
    amount: amt,
    status: "completed",
    description: `Withdrawal to ${m}`,
    payoutDetails: details.slice(0, 500),
    payoutMethod: m,
  });

  return NextResponse.json({ ok: true, newBalance: balance - amt });
}
