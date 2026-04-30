import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { Campaign } from "@/models/Campaign";
import { CampaignApplication, type IApplicationAudienceSnapshot, type IApplicationContentPlan } from "@/models/CampaignApplication";
import { CollabliNotification } from "@/models/CollabliNotification";
import { CreatorProfile } from "@/models/CreatorProfile";
import { User } from "@/models/User";

function notifyOwner(campaign: { brandId?: unknown; creatorOwnerId?: unknown; title?: string }, title: string, body: string) {
  const owner = campaign.brandId || campaign.creatorOwnerId;
  if (!owner) return Promise.resolve();
  return CollabliNotification.create({ userId: owner, title, body, type: "application" });
}

function sumFollowers(profile: { socialLinks?: { followers?: number }[] }) {
  return (profile.socialLinks || []).reduce((s, l) => s + Math.max(0, Number(l.followers || 0)), 0);
}

function sumProjectViews(profile: { projects?: { views?: number }[] }) {
  return (profile.projects || []).reduce((s, p) => s + Math.max(0, Number(p.views || 0)), 0);
}

const FORMATS = new Set(["Reel", "Story", "Post", "Video"]);

function validatePortfolioLink(s: string): string {
  const t = String(s || "").trim();
  if (!t) return "";
  if (!/^https?:\/\//i.test(t)) return "";
  return t.slice(0, 2000);
}

function parseFullCreatorApplication(body: Record<string, unknown>): { ok: true; data: Record<string, unknown> } | { ok: false; message: string } {
  const pitch = String(body.pitch || "").trim();
  const pastSimilarWork = String(body.pastSimilarWork || "").trim();
  const portfolioLink = validatePortfolioLink(String(body.portfolioLink || ""));
  const campaignRateInr = Number(body.campaignRateInr);
  const rateKind = body.rateKind === "negotiable" ? "negotiable" : body.rateKind === "fixed" ? "fixed" : "";
  const estimatedDeliveryDate = body.estimatedDeliveryDate ? new Date(String(body.estimatedDeliveryDate)) : null;
  const contentPlans = body.contentPlans;
  const audienceSnapshot = body.audienceSnapshot as Record<string, unknown> | undefined;
  const deadlineConfirmed = Boolean(body.deadlineConfirmed);
  const termsAccepted = Boolean(body.termsAccepted);

  if (pitch.length < 20) return { ok: false, message: "Pitch should be at least 20 characters" };
  if (pastSimilarWork.length < 20) return { ok: false, message: "Please describe past similar work (at least 20 characters)" };
  if (!rateKind) return { ok: false, message: "Select fixed or negotiable rate" };
  if (!Number.isFinite(campaignRateInr) || campaignRateInr < 0) return { ok: false, message: "Enter a valid rate in ₹" };
  if (!estimatedDeliveryDate || Number.isNaN(estimatedDeliveryDate.getTime())) {
    return { ok: false, message: "Estimated delivery date required" };
  }
  if (!Array.isArray(contentPlans) || contentPlans.length < 1) {
    return { ok: false, message: "Add at least one content plan row" };
  }
  const plans: IApplicationContentPlan[] = [];
  for (const row of contentPlans) {
    const r = row as Record<string, unknown>;
    const contentIdea = String(r.contentIdea || "").trim();
    const platform = String(r.platform || "").trim();
    const format = String(r.format || "");
    if (contentIdea.length < 5) return { ok: false, message: "Each content idea should be at least 5 characters" };
    if (!platform) return { ok: false, message: "Platform required for each content plan" };
    if (!FORMATS.has(format)) return { ok: false, message: "Invalid content format" };
    plans.push({ contentIdea, platform, format: format as IApplicationContentPlan["format"] });
  }

  if (!audienceSnapshot || typeof audienceSnapshot !== "object") {
    return { ok: false, message: "Audience details required" };
  }
  const followers = Math.max(0, Number(audienceSnapshot.followers ?? 0));
  const views = Math.max(0, Number(audienceSnapshot.views ?? 0));
  const engagementRatePct =
    audienceSnapshot.engagementRatePct === "" || audienceSnapshot.engagementRatePct === undefined || audienceSnapshot.engagementRatePct === null
      ? undefined
      : Number(audienceSnapshot.engagementRatePct);
  if (engagementRatePct !== undefined && (!Number.isFinite(engagementRatePct) || engagementRatePct < 0 || engagementRatePct > 100)) {
    return { ok: false, message: "Engagement rate should be between 0 and 100" };
  }
  const location = String(audienceSnapshot.location || "").trim();
  const ageRange = String(audienceSnapshot.ageRange || "").trim();
  const gender = String(audienceSnapshot.gender || "").trim();
  if (!location) return { ok: false, message: "Audience location required" };

  if (!deadlineConfirmed) return { ok: false, message: "Confirm the campaign deadline" };
  if (!termsAccepted) return { ok: false, message: "Accept the terms to submit" };

  const aud: IApplicationAudienceSnapshot = {
    followers,
    views,
    engagementRatePct,
    location,
    ageRange,
    gender,
  };

  const profileEngagement = body.profileSummaryEngagementPct;
  const engPct =
    profileEngagement === "" || profileEngagement === undefined || profileEngagement === null
      ? undefined
      : Number(profileEngagement);
  if (engPct !== undefined && (!Number.isFinite(engPct) || engPct < 0 || engPct > 100)) {
    return { ok: false, message: "Profile engagement rate should be 0–100" };
  }

  return {
    ok: true,
    data: {
      pitch,
      pastSimilarWork,
      portfolioLink,
      campaignRateInr,
      rateKind,
      estimatedDeliveryDate,
      contentPlans: plans,
      audienceSnapshot: aud,
      profileEngagementPct: engPct,
      deadlineConfirmed,
      termsAccepted,
    },
  };
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser(["creator", "brand"]);
  const { id } = await ctx.params;
  await connectDB();
  const campaign = await Campaign.findById(id);
  if (!campaign || campaign.status !== "open") {
    return NextResponse.json({ message: "Campaign not found or closed" }, { status: 404 });
  }

  const isBrandCampaign = !!campaign.brandId;
  const isCreatorListing = !!campaign.creatorOwnerId;

  if (isBrandCampaign && user.role !== "creator") {
    return NextResponse.json({ message: "Only creators can apply to brand campaigns" }, { status: 403 });
  }
  if (isCreatorListing && user.role !== "brand") {
    return NextResponse.json({ message: "Only brands can respond to creator listings" }, { status: 403 });
  }
  if (!isBrandCampaign && !isCreatorListing) {
    return NextResponse.json({ message: "Invalid campaign owner" }, { status: 400 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const applicantUserId = new mongoose.Types.ObjectId(user.userId);
  const applicantRole = user.role === "brand" ? "brand" : "creator";

  let pitch = "";
  let extra: Record<string, unknown> = {};

  if (user.role === "creator" && isBrandCampaign) {
    const v = parseFullCreatorApplication(body);
    if (!v.ok) return NextResponse.json({ message: v.message }, { status: 400 });
    pitch = v.data.pitch as string;
    const u = await User.findById(user.userId).select("name publicHandle").lean();
    const profile = await CreatorProfile.findOne({ userId: user.userId }).lean();
    if (!profile) return NextResponse.json({ message: "Complete your creator profile first" }, { status: 400 });

    const profileSummary = {
      displayName: String((u as { name?: string } | null)?.name || "").trim(),
      publicHandle: String((u as { publicHandle?: string } | null)?.publicHandle || "").trim(),
      platforms: Array.isArray(profile.platforms) ? profile.platforms.map(String) : [],
      niche: String(profile.niche || "").trim(),
      engagementRatePct: v.data.profileEngagementPct as number | undefined,
    };

    const aud = v.data.audienceSnapshot as IApplicationAudienceSnapshot;
    const mergedAudience: IApplicationAudienceSnapshot = {
      followers: aud.followers || sumFollowers(profile as { socialLinks?: { followers?: number }[] }),
      views: aud.views || sumProjectViews(profile as { projects?: { views?: number }[] }),
      engagementRatePct: aud.engagementRatePct ?? (v.data.profileEngagementPct as number | undefined),
      location: aud.location || String(profile.location || "").trim(),
      ageRange: aud.ageRange,
      gender: aud.gender,
    };

    extra = {
      profileSummary,
      pastSimilarWork: v.data.pastSimilarWork,
      portfolioLink: v.data.portfolioLink,
      campaignRateInr: v.data.campaignRateInr,
      rateKind: v.data.rateKind,
      estimatedDeliveryDate: v.data.estimatedDeliveryDate,
      contentPlans: v.data.contentPlans,
      audienceSnapshot: mergedAudience,
      termsAccepted: true,
      deadlineConfirmed: true,
      agreementAcceptedAt: new Date(),
    };
  } else {
    pitch = String(body.pitch || "").trim();
    if (!pitch) return NextResponse.json({ message: "Pitch required" }, { status: 400 });
  }

  const existing = await CampaignApplication.findOne({ campaignId: campaign._id, applicantUserId });
  if (existing) {
    if (existing.status === "pending") {
      return NextResponse.json({ message: "You already have a pending application" }, { status: 409 });
    }
    if (existing.status === "accepted") {
      return NextResponse.json({ message: "You are already accepted" }, { status: 409 });
    }
    existing.pitch = pitch;
    existing.status = "pending";
    existing.rejectionNote = "";
    existing.withdrawnAt = undefined;
    existing.applicantRole = applicantRole;
    if (applicantRole === "creator") existing.creatorId = applicantUserId;
    else existing.creatorId = undefined;
    Object.assign(existing, extra);
    await existing.save();
    await notifyOwner(
      campaign,
      "Campaign application",
      `${applicantRole === "creator" ? "A creator re-applied" : "A brand re-applied"} to ${campaign.title}`
    );
    return NextResponse.json({ application: existing }, { status: 201 });
  }

  const doc: Record<string, unknown> = {
    campaignId: campaign._id,
    applicantUserId,
    applicantRole,
    pitch,
    status: "pending",
    ...extra,
  };
  if (applicantRole === "creator") doc.creatorId = applicantUserId;

  const application = await CampaignApplication.create(doc);
  await notifyOwner(
    campaign,
    "New campaign application",
    `${applicantRole === "creator" ? "A creator applied" : "A brand reached out"} to ${campaign.title}`
  );
  return NextResponse.json({ application }, { status: 201 });
}
