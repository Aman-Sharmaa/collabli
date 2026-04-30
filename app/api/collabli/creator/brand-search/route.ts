import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { User } from "@/models/User";
import { BrandProfile } from "@/models/BrandProfile";

export async function GET(req: NextRequest) {
  await requireSessionUser(["creator"]);
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  if (q.length < 2) return NextResponse.json({ brands: [] });

  await connectDB();
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  const profiles = await BrandProfile.find({
    $or: [{ companyName: rx }, { industry: rx }],
  })
    .select("userId companyName industry location website")
    .limit(20)
    .lean();

  const userIds = profiles.map((p) => p.userId);
  const users = await User.find({
    _id: { $in: userIds },
    role: "brand",
    approvalStatus: "approved",
  })
    .select("name email publicHandle avatarUrl company")
    .lean();

  const umap = new Map(users.map((u) => [String(u._id), u]));

  const brands = profiles
    .map((p) => {
      const u = umap.get(String(p.userId));
      if (!u) return null;
      return {
        userId: String(p.userId),
        companyName: p.companyName,
        industry: p.industry,
        location: p.location,
        website: p.website,
        publicHandle: u.publicHandle || "",
        name: u.name || u.company || p.companyName,
        avatarUrl: u.avatarUrl || "",
      };
    })
    .filter(Boolean);

  const handleUsers = await User.find({
    role: "brand",
    approvalStatus: "approved",
    $or: [{ publicHandle: rx }, { name: rx }, { company: rx }],
  })
    .select("name email publicHandle avatarUrl company")
    .limit(15)
    .lean();

  const merged = [...(brands as object[])];
  const seen = new Set(merged.map((b: any) => b.userId));
  for (const u of handleUsers) {
    const id = String(u._id);
    if (seen.has(id)) continue;
    seen.add(id);
    const bp = await BrandProfile.findOne({ userId: u._id }).select("companyName industry location website").lean();
    merged.push({
      userId: id,
      companyName: bp?.companyName || u.company || u.name,
      industry: bp?.industry || "",
      location: bp?.location || "",
      website: bp?.website || "",
      publicHandle: u.publicHandle || "",
      name: u.name || u.company || "",
      avatarUrl: u.avatarUrl || "",
    });
  }

  return NextResponse.json({ brands: merged.slice(0, 25) });
}
