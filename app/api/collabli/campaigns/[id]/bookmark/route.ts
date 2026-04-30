import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { Campaign } from "@/models/Campaign";
import { CampaignBookmark } from "@/models/CampaignBookmark";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser(["creator"]);
  const { id } = await ctx.params;
  await connectDB();
  const campaign = await Campaign.findById(id).select("_id status").lean();
  if (!campaign || campaign.status !== "open") {
    return NextResponse.json({ message: "Campaign not available" }, { status: 404 });
  }
  await CampaignBookmark.updateOne(
    { userId: user.userId, campaignId: id },
    { $setOnInsert: { userId: user.userId, campaignId: id } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser(["creator"]);
  const { id } = await ctx.params;
  await connectDB();
  await CampaignBookmark.deleteOne({ userId: user.userId, campaignId: id });
  return NextResponse.json({ ok: true });
}
