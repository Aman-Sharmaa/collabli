import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { Campaign } from "@/models/Campaign";
import { CampaignApplication } from "@/models/CampaignApplication";

/** Brands applying to this creator's "available for work" listings */
export async function GET() {
  const user = await requireSessionUser(["creator"]);
  await connectDB();
  const campaigns = await Campaign.find({ creatorOwnerId: user.userId }).select("_id").lean();
  const ids = campaigns.map((c) => c._id);
  if (!ids.length) return NextResponse.json({ applications: [] });

  const applications = await CampaignApplication.find({ campaignId: { $in: ids } })
    .sort({ createdAt: -1 })
    .populate("campaignId", "title deadline niche budget status")
    .populate("applicantUserId", "name email publicHandle company")
    .lean();

  return NextResponse.json({ applications });
}
