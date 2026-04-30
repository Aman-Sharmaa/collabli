import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { CreatorProfile } from "@/models/CreatorProfile";
import { User } from "@/models/User";
import { isValidHandle, normalizeHandle } from "@/lib/handle";
import type { ISocialLink, ICreatorProject, IRateCardItem } from "@/models/CreatorProfile";

function sanitizeSocialLinks(raw: unknown): ISocialLink[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => ({
      platform: ["instagram", "youtube", "tiktok", "x", "other"].includes(String((x as ISocialLink).platform))
        ? (x as ISocialLink).platform
        : "other",
      profileUrl: String((x as ISocialLink).profileUrl || "").trim(),
      followers: Math.max(0, Number((x as ISocialLink).followers || 0)),
      following: Math.max(0, Number((x as ISocialLink).following || 0)),
    }))
    .filter((s) => s.profileUrl.length > 0);
}

function sanitizeRateCard(raw: unknown): IRateCardItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => ({
      name: String((x as IRateCardItem).name || "").trim(),
      price: Math.max(0, Number((x as IRateCardItem).price || 0)),
      description: String((x as IRateCardItem).description || "").trim(),
    }))
    .filter((r) => r.name.length > 0);
}

function sanitizeProjects(raw: unknown): ICreatorProject[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => ({
      imageUrl: String((x as ICreatorProject).imageUrl || "").trim(),
      title: String((x as ICreatorProject).title || "").trim(),
      description: String((x as ICreatorProject).description || "").trim(),
      views: Math.max(0, Number((x as ICreatorProject).views || 0)),
      impressions: Math.max(0, Number((x as ICreatorProject).impressions || 0)),
      likes: Math.max(0, Number((x as ICreatorProject).likes || 0)),
      shares: Math.max(0, Number((x as ICreatorProject).shares || 0)),
    }))
    .filter((p) => p.title.length > 0);
}

export async function GET() {
  const user = await requireSessionUser(["creator"]);
  await connectDB();
  const profile = await CreatorProfile.findOne({ userId: user.userId }).lean();
  const u = await User.findById(user.userId).select("publicHandle name avatarUrl").lean();
  return NextResponse.json({
    profile,
    publicHandle: (u as { publicHandle?: string } | null)?.publicHandle || "",
    displayName: (u as { name?: string } | null)?.name || "",
    avatarUrl: (u as { avatarUrl?: string } | null)?.avatarUrl || "",
  });
}

export async function PATCH(req: NextRequest) {
  const user = await requireSessionUser(["creator"]);
  await connectDB();
  const payload = await req.json();

  if (payload.publicHandle !== undefined) {
    const h = normalizeHandle(payload.publicHandle);
    if (!isValidHandle(h)) {
      return NextResponse.json(
        { message: "Public username must be 3–30 characters: letters, numbers, underscores only." },
        { status: 400 }
      );
    }
    const taken = await User.findOne({ publicHandle: h, _id: { $ne: user.userId } }).select("_id").lean();
    if (taken) {
      return NextResponse.json({ message: "That username is already taken." }, { status: 409 });
    }
    await User.findByIdAndUpdate(user.userId, { $set: { publicHandle: h } });
  }

  const socialLinks = payload.socialLinks !== undefined ? sanitizeSocialLinks(payload.socialLinks) : undefined;
  const projects = payload.projects !== undefined ? sanitizeProjects(payload.projects) : undefined;
  const rateCard = payload.rateCard !== undefined ? sanitizeRateCard(payload.rateCard) : undefined;

  const $set: Record<string, unknown> = {
    niche: payload.niche !== undefined ? String(payload.niche || "") : undefined,
    platforms: Array.isArray(payload.platforms) ? payload.platforms.map(String) : undefined,
    audienceSize: payload.audienceSize !== undefined ? Number(payload.audienceSize || 0) : undefined,
    location: payload.location !== undefined ? String(payload.location || "") : undefined,
    rate: payload.rate !== undefined ? Number(payload.rate || 0) : undefined,
    bio: payload.bio !== undefined ? String(payload.bio || "") : undefined,
    portfolio: Array.isArray(payload.portfolio) ? payload.portfolio : undefined,
  };
  if (socialLinks !== undefined) $set.socialLinks = socialLinks;
  if (projects !== undefined) $set.projects = projects;
  if (rateCard !== undefined) $set.rateCard = rateCard;

  Object.keys($set).forEach((k) => $set[k] === undefined && delete $set[k]);

  let profile = await CreatorProfile.findOne({ userId: user.userId }).lean();
  if (Object.keys($set).length > 0) {
    profile = await CreatorProfile.findOneAndUpdate(
      { userId: user.userId },
      { $set: $set },
      { upsert: true, new: true }
    ).lean();
  }

  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  const user = await requireSessionUser(["creator"]);
  await connectDB();
  const body = await req.json();
  const project = sanitizeProjects([body.project || body])[0];
  if (!project) {
    return NextResponse.json({ message: "Project needs at least a title." }, { status: 400 });
  }
  await CreatorProfile.findOneAndUpdate(
    { userId: user.userId },
    { $push: { projects: project } },
    { upsert: true, new: true }
  );
  const profile = await CreatorProfile.findOne({ userId: user.userId }).lean();
  return NextResponse.json({ profile });
}
