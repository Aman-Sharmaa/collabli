import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { CreatorProfile } from "@/models/CreatorProfile";
import { BrandProfile } from "@/models/BrandProfile";

export async function GET() {
  await connectDB();
  const users = await User.find({
    publicHandle: { $exists: true, $nin: [null, ""] },
    role: { $in: ["creator", "brand"] },
    approvalStatus: "approved",
  })
    .select("name email publicHandle role avatarUrl company")
    .lean();

  const creatorIds = users.filter((u) => u.role === "creator").map((u) => u._id);
  const brandIds = users.filter((u) => u.role === "brand").map((u) => u._id);

  const [cProfiles, bProfiles] = await Promise.all([
    creatorIds.length ? CreatorProfile.find({ userId: { $in: creatorIds } }).lean() : [],
    brandIds.length ? BrandProfile.find({ userId: { $in: brandIds } }).lean() : [],
  ]);

  const cMap = new Map(cProfiles.map((p) => [String(p.userId), p]));
  const bMap = new Map(bProfiles.map((p) => [String(p.userId), p]));

  const creators = users
    .filter((u) => u.role === "creator")
    .map((u) => {
      const p = cMap.get(String(u._id));
      return {
        handle: u.publicHandle,
        name: u.name || "Creator",
        niche: p?.niche || "",
        audienceSize: p?.audienceSize || 0,
        location: p?.location || "",
        avatarUrl: u.avatarUrl || "",
      };
    });

  const brands = users
    .filter((u) => u.role === "brand")
    .map((u) => {
      const p = bMap.get(String(u._id));
      return {
        handle: u.publicHandle,
        name: p?.companyName || u.company || u.name || "Brand",
        industry: p?.industry || "",
        location: p?.location || "",
        avatarUrl: u.avatarUrl || "",
      };
    });

  return NextResponse.json({ creators, brands });
}
