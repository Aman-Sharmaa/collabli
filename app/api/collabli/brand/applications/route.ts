import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { Campaign } from "@/models/Campaign";
import { CampaignApplication } from "@/models/CampaignApplication";

export async function GET() {
  const user = await requireSessionUser(["brand"]);
  await connectDB();
  const campaigns = await Campaign.find({ brandId: user.userId }).select("_id").lean();
  const ids = campaigns.map((c) => c._id);
  if (!ids.length) return NextResponse.json({ applications: [] });

  const applications = await CampaignApplication.find({ campaignId: { $in: ids } })
    .sort({ createdAt: -1 })
    .populate("campaignId", "title deadline niche budget status brandId creatorOwnerId")
    .populate("applicantUserId", "name email publicHandle role company")
    .populate("creatorId", "name email publicHandle")
    .lean();

  return NextResponse.json({ applications });
}
