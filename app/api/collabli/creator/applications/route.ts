import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { CampaignApplication } from "@/models/CampaignApplication";

export async function GET() {
  const user = await requireSessionUser(["creator"]);
  await connectDB();
  const applications = await CampaignApplication.find({
    $or: [{ creatorId: user.userId }, { applicantUserId: user.userId, applicantRole: "creator" }],
  })
    .sort({ updatedAt: -1 })
    .populate("campaignId", "title budget niche deadline status location platforms brandId creatorOwnerId")
    .lean();

  return NextResponse.json({ applications });
}
