import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CreatorProfile } from "@/models/CreatorProfile";
import { User } from "@/models/User";

function publicUser(u: { name?: string; avatarUrl?: string; publicHandle?: string }) {
  return {
    name: u.name || "",
    avatarUrl: u.avatarUrl || "",
    publicHandle: u.publicHandle || "",
  };
}

export async function GET(req: NextRequest) {
  await connectDB();
  const sp = req.nextUrl.searchParams;
  const niche = sp.get("niche") || "";
  const location = sp.get("location") || "";
  const platform = sp.get("platform") || "";
  const rateMin = sp.get("rateMin");
  const rateMax = sp.get("rateMax");

  const approvedUsers = await User.find({
    role: "creator",
    approvalStatus: "approved",
    publicHandle: { $exists: true, $nin: [null, ""] },
    $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
  })
    .select("name avatarUrl publicHandle")
    .lean();

  const allowedIds = approvedUsers.map((u) => u._id);
  if (!allowedIds.length) {
    return NextResponse.json({ creators: [] });
  }

  const profileQuery: Record<string, unknown> = { userId: { $in: allowedIds } };
  if (niche) profileQuery.niche = { $regex: niche, $options: "i" };
  if (location) profileQuery.location = { $regex: location, $options: "i" };
  if (platform) profileQuery.platforms = { $regex: platform, $options: "i" };
  if (rateMin || rateMax) {
    const r: Record<string, number> = {};
    if (rateMin) r.$gte = Number(rateMin);
    if (rateMax) r.$lte = Number(rateMax);
    profileQuery.rate = r;
  }

  const profiles = await CreatorProfile.find(profileQuery).sort({ updatedAt: -1 }).lean();
  const map = new Map(approvedUsers.map((u) => [String(u._id), u]));

  const creators = profiles.map((p) => {
    const u = map.get(String(p.userId));
    return {
      _id: p._id,
      userId: p.userId,
      niche: p.niche,
      platforms: p.platforms,
      audienceSize: p.audienceSize,
      location: p.location,
      rate: p.rate,
      bio: p.bio,
      projects: (p.projects || []).slice(0, 3),
      user: u ? publicUser(u) : null,
      handle: u?.publicHandle || "",
    };
  });

  return NextResponse.json({ creators });
}
