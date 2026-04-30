import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { Campaign } from "@/models/Campaign";
import { CreatorProfile } from "@/models/CreatorProfile";
import { User } from "@/models/User";

function sumFollowers(profile: { socialLinks?: { followers?: number }[] }) {
  return (profile.socialLinks || []).reduce((s, l) => s + Math.max(0, Number(l.followers || 0)), 0);
}

function sumProjectViews(profile: { projects?: { views?: number }[] }) {
  return (profile.projects || []).reduce((s, p) => s + Math.max(0, Number(p.views || 0)), 0);
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser(["creator"]);
  const { id } = await ctx.params;
  await connectDB();

  const campaign = await Campaign.findById(id).lean();
  if (!campaign || campaign.status !== "open") {
    return NextResponse.json({ message: "Campaign not found or closed" }, { status: 404 });
  }
  if (!campaign.brandId) {
    return NextResponse.json({ message: "Use the simple reach-out flow for creator listings" }, { status: 400 });
  }

  const [u, profile] = await Promise.all([
    User.findById(user.userId).select("name publicHandle").lean(),
    CreatorProfile.findOne({ userId: user.userId }).lean(),
  ]);

  if (!profile) {
    return NextResponse.json({ message: "Complete your creator profile first" }, { status: 400 });
  }

  const displayName = String((u as { name?: string } | null)?.name || "").trim();
  const publicHandle = String((u as { publicHandle?: string } | null)?.publicHandle || "").trim();
  const platforms = Array.isArray(profile.platforms) ? profile.platforms.map(String) : [];
  const niche = String(profile.niche || "").trim();

  const followers = sumFollowers(profile as { socialLinks?: { followers?: number }[] });
  const views = sumProjectViews(profile as { projects?: { views?: number }[] });
  const location = String(profile.location || "").trim();

  return NextResponse.json({
    campaign: {
      _id: String(campaign._id),
      title: campaign.title,
      deliverables: campaign.deliverables,
      deadline: campaign.deadline,
      niche: campaign.niche,
      budget: campaign.budget,
      platforms: campaign.platforms || [],
      location: campaign.location || "",
    },
    profileSummary: {
      displayName,
      publicHandle,
      platforms,
      niche,
      engagementRatePct: null as number | null,
    },
    audienceDefaults: {
      followers,
      views,
      engagementRatePct: null as number | null,
      location,
      ageRange: "",
      gender: "",
    },
  });
}
