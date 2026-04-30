import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { User } from "@/models/User";

export async function GET() {
  const session = await requireSessionUser(["creator", "brand"]);
  await connectDB();
  const user = await User.findById(session.userId)
    .select("email name avatarUrl notificationPrefs publicHandle role")
    .lean();
  if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await requireSessionUser(["creator", "brand"]);
  await connectDB();
  const body = await req.json();
  const $set: Record<string, unknown> = {};
  if (body.name !== undefined) $set.name = String(body.name || "").trim().slice(0, 120);
  if (body.avatarUrl !== undefined) $set.avatarUrl = String(body.avatarUrl || "").trim().slice(0, 2000);
  if (body.notificationPrefs && typeof body.notificationPrefs === "object") {
    const p = body.notificationPrefs as Record<string, boolean>;
    $set.notificationPrefs = {
      dealUpdates: p.dealUpdates !== false,
      messages: p.messages !== false,
      payments: p.payments !== false,
      deadlines: p.deadlines !== false,
      marketing: p.marketing === true,
    };
  }
  if (Object.keys($set).length === 0) {
    return NextResponse.json({ message: "Nothing to update" }, { status: 400 });
  }
  await User.findByIdAndUpdate(session.userId, { $set });
  const user = await User.findById(session.userId)
    .select("email name avatarUrl notificationPrefs publicHandle role")
    .lean();
  return NextResponse.json({ user });
}
