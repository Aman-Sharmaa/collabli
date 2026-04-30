import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { CollabliTransaction } from "@/models/CollabliTransaction";

export async function GET() {
  const user = await requireSessionUser(["creator"]);
  await connectDB();
  const transactions = await CollabliTransaction.find({ userId: user.userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  return NextResponse.json({ transactions });
}
