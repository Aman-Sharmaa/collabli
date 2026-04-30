import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { CreatorProfile } from "@/models/CreatorProfile";
import { BrandProfile } from "@/models/BrandProfile";
import { normalizeHandle } from "@/lib/handle";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ handle: string }> }) {
  const { handle: raw } = await ctx.params;
  const handle = normalizeHandle(raw);
  if (!handle) return NextResponse.json({ message: "Not found" }, { status: 404 });

  await connectDB();
  const user = await User.findOne({
    publicHandle: handle,
    role: { $in: ["creator", "brand"] },
    approvalStatus: "approved",
  })
    .select("name email role avatarUrl company publicHandle")
    .lean();

  if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });

  if (user.role === "creator") {
    const profile = await CreatorProfile.findOne({ userId: user._id }).lean();
    return NextResponse.json({
      type: "creator" as const,
      handle: user.publicHandle,
      name: user.name || "Creator",
      avatarUrl: user.avatarUrl || "",
      bio: profile?.bio || "",
      niche: profile?.niche || "",
      location: profile?.location || "",
      audienceSize: profile?.audienceSize || 0,
      rate: profile?.rate || 0,
      platforms: profile?.platforms || [],
      socialLinks: profile?.socialLinks || [],
      projects: profile?.projects || [],
    });
  }

  const profile = await BrandProfile.findOne({ userId: user._id }).lean();
  return NextResponse.json({
    type: "brand" as const,
    handle: user.publicHandle,
    name: profile?.companyName || user.company || user.name || "Brand",
    avatarUrl: user.avatarUrl || "",
    tagline: profile?.tagline || "",
    industry: profile?.industry || "",
    website: profile?.website || "",
    location: profile?.location || "",
    monthlyBudget: profile?.monthlyBudget || 0,
    socialLinks: profile?.socialLinks || [],
    projects: profile?.projects || [],
  });
}
