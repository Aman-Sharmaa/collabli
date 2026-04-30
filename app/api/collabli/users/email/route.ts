import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { User } from "@/models/User";
import { comparePassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await requireSessionUser(["creator", "brand"]);
  const { newEmail, password } = await req.json();
  const email = String(newEmail || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ message: "Valid email required" }, { status: 400 });
  }
  await connectDB();
  const user = await User.findById(session.userId);
  if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const ok = await comparePassword(String(password || ""), user.password);
  if (!ok) return NextResponse.json({ message: "Password incorrect" }, { status: 401 });
  const taken = await User.findOne({ email, _id: { $ne: session.userId } }).select("_id").lean();
  if (taken) return NextResponse.json({ message: "Email already in use" }, { status: 409 });
  user.email = email;
  await user.save();
  return NextResponse.json({ ok: true, email: user.email });
}
