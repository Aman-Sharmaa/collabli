import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { User } from "@/models/User";
import { comparePassword, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await requireSessionUser(["creator", "brand", "admin"]);
  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword || String(newPassword).length < 8) {
    return NextResponse.json({ message: "New password must be at least 8 characters." }, { status: 400 });
  }
  await connectDB();
  const user = await User.findById(session.userId);
  if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const ok = await comparePassword(String(currentPassword), user.password);
  if (!ok) return NextResponse.json({ message: "Current password is incorrect." }, { status: 401 });
  user.password = await hashPassword(String(newPassword));
  await user.save();
  return NextResponse.json({ ok: true });
}
