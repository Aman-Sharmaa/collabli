import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getSessionUser } from "@/lib/collabli-auth";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ user: null, needsOnboarding: false });
  await connectDB();
  const user = await User.findById(session.userId).select("email name role publicHandle").lean();
  if (!user) return NextResponse.json({ user: null, needsOnboarding: false });
  const role = (user as { role: string }).role;
  const publicHandle = (user as { publicHandle?: string }).publicHandle;
  const needsOnboarding =
    (role === "creator" || role === "brand") && !(publicHandle && String(publicHandle).trim());
  return NextResponse.json({
    user: {
      id: String((user as { _id: unknown })._id),
      email: (user as { email: string }).email,
      name: (user as { name?: string }).name || "",
      role,
      publicHandle: publicHandle || "",
    },
    needsOnboarding,
  });
}
