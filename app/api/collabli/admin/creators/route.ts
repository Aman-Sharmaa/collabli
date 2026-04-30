import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { User } from "@/models/User";
import { CreatorProfile } from "@/models/CreatorProfile";

export async function GET() {
  await requireSessionUser(["admin"]);
  await connectDB();

  const users = await User.find({ role: "creator" })
    .select("name email approvalStatus createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const ids = users.map((u) => u._id);
  const profiles = await CreatorProfile.find({ userId: { $in: ids } }).lean();
  const profileByUser = new Map(profiles.map((p) => [String(p.userId), p]));

  const creators = users.map((u) => ({
    user: {
      _id: String(u._id),
      name: u.name,
      email: u.email,
      approvalStatus: u.approvalStatus,
      createdAt: u.createdAt,
    },
    profile: profileByUser.get(String(u._id)) || null,
  }));

  return NextResponse.json({ creators });
}
