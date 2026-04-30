import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AUTH_COOKIE_NAME, requireSessionUser } from "@/lib/collabli-auth";
import { User } from "@/models/User";
import { comparePassword } from "@/lib/auth";

export async function DELETE(req: Request) {
  const session = await requireSessionUser(["creator", "brand"]);
  const { password } = await req.json().catch(() => ({}));
  await connectDB();
  const user = await User.findById(session.userId);
  if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const ok = await comparePassword(String(password || ""), user.password);
  if (!ok) return NextResponse.json({ message: "Password incorrect" }, { status: 401 });

  const suffix = `deleted_${Date.now()}`;
  await User.findByIdAndUpdate(user._id, {
    $set: {
      email: `${suffix}_${user.email}`.slice(0, 200),
      deletedAt: new Date(),
      approvalStatus: "rejected",
    },
    $unset: { publicHandle: 1 },
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
