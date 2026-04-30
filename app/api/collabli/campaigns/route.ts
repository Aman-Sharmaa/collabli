import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Campaign } from "@/models/Campaign";
import { getSessionUser, requireSessionUser } from "@/lib/collabli-auth";
import { CampaignBookmark } from "@/models/CampaignBookmark";

function serializeCampaign(c: Record<string, unknown>, bookmarked: boolean) {
  return {
    ...c,
    bookmarked,
    listingType: c.creatorOwnerId ? "creator_seeking" : "brand_hiring",
  };
}

export async function GET(req: NextRequest) {
  await connectDB();
  const niche = req.nextUrl.searchParams.get("niche") || "";
  const platform = req.nextUrl.searchParams.get("platform") || "";
  const location = req.nextUrl.searchParams.get("location") || "";
  const budgetMin = req.nextUrl.searchParams.get("budgetMin");
  const budgetMax = req.nextUrl.searchParams.get("budgetMax");
  const listingType = req.nextUrl.searchParams.get("listingType") || "";

  const query: Record<string, unknown> = { status: "open" };
  if (niche) query.niche = { $regex: niche, $options: "i" };
  if (location) query.location = { $regex: location, $options: "i" };
  if (platform) {
    query.platforms = { $regex: platform, $options: "i" };
  }
  if (listingType === "brand_hiring") {
    query.brandId = { $exists: true, $ne: null };
  } else if (listingType === "creator_seeking") {
    query.creatorOwnerId = { $exists: true, $ne: null };
  }
  if (budgetMin || budgetMax) {
    query.budget = {} as Record<string, number>;
    if (budgetMin) (query.budget as Record<string, number>).$gte = Number(budgetMin);
    if (budgetMax) (query.budget as Record<string, number>).$lte = Number(budgetMax);
  }

  const campaigns = await Campaign.find(query).sort({ createdAt: -1 }).lean();

  const session = await getSessionUser();
  let bookmarked = new Set<string>();
  if (session?.role === "creator") {
    const marks = await CampaignBookmark.find({ userId: session.userId }).select("campaignId").lean();
    bookmarked = new Set(marks.map((m) => String(m.campaignId)));
  }

  return NextResponse.json({
    campaigns: campaigns.map((c) => serializeCampaign(c as unknown as Record<string, unknown>, bookmarked.has(String(c._id)))),
  });
}

export async function POST(req: NextRequest) {
  const user = await requireSessionUser(["brand", "creator"]);
  await connectDB();
  const body = await req.json();
  const { title, budget, niche, deliverables, deadline, platforms, location } = body;
  if (!title || !budget || !niche || !deliverables || !deadline) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }
  const platformList = Array.isArray(platforms)
    ? platforms.map(String)
    : String(platforms || "")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);

  const payload: Record<string, unknown> = {
    title,
    budget: Number(budget),
    niche,
    deliverables,
    deadline: new Date(deadline),
    status: "open",
    platforms: platformList,
    location: String(location || "").trim(),
  };

  if (user.role === "brand") {
    payload.brandId = user.userId;
    payload.creatorOwnerId = undefined;
  } else {
    payload.creatorOwnerId = user.userId;
    payload.brandId = undefined;
  }

  const campaign = await Campaign.create(payload);
  return NextResponse.json(
    { campaign: serializeCampaign(campaign.toObject() as unknown as Record<string, unknown>, false) },
    { status: 201 }
  );
}
