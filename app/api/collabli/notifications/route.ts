import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { CollabliNotification } from "@/models/CollabliNotification";

export async function GET() {
  const user = await requireSessionUser();
  await connectDB();
  const notifications = await CollabliNotification.find({ userId: user.userId }).sort({ createdAt: -1 }).limit(30).lean();
  return NextResponse.json({ notifications });
}

export async function PATCH(req: NextRequest) {
  const user = await requireSessionUser();
  const { id } = await req.json();
  await connectDB();
  await CollabliNotification.updateOne({ _id: id, userId: user.userId }, { $set: { read: true } });
  return NextResponse.json({ ok: true });
}
