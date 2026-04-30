import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { CampaignApplication, applicationApplicantId } from "@/models/CampaignApplication";
import { Campaign } from "@/models/Campaign";
import { Deal } from "@/models/Deal";
import { CollabliNotification } from "@/models/CollabliNotification";

const COMMISSION_RATE = 0.15;

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser(["brand", "creator"]);
  const { id } = await ctx.params;
  const { decision, rejectionNote } = await req.json();
  if (!["accepted", "rejected"].includes(decision)) return NextResponse.json({ message: "Invalid decision" }, { status: 400 });
  await connectDB();
  const application = await CampaignApplication.findById(id);
  if (!application) return NextResponse.json({ message: "Application not found" }, { status: 404 });
  const campaign = await Campaign.findById(application.campaignId);
  if (!campaign) return NextResponse.json({ message: "Campaign not found" }, { status: 404 });

  const isBrandOwner = campaign.brandId && String(campaign.brandId) === user.userId;
  const isCreatorOwner = campaign.creatorOwnerId && String(campaign.creatorOwnerId) === user.userId;
  if (!isBrandOwner && !isCreatorOwner) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  application.status = decision;
  if (decision === "rejected") {
    application.rejectionNote = String(rejectionNote || "").slice(0, 2000);
  } else {
    application.rejectionNote = "";
  }
  await application.save();

  const applicantId = applicationApplicantId(application);

  if (decision === "accepted") {
    campaign.status = "in_progress";
    await campaign.save();

    let dealBrandId = campaign.brandId;
    let dealCreatorId = application.creatorId || application.applicantUserId;

    if (campaign.creatorOwnerId) {
      dealCreatorId = campaign.creatorOwnerId;
      dealBrandId = application.applicantUserId;
    }

    if (!dealBrandId || !dealCreatorId) {
      return NextResponse.json({ message: "Cannot form deal: missing brand or creator" }, { status: 400 });
    }

    await Deal.create({
      campaignId: campaign._id,
      brandId: dealBrandId,
      creatorId: dealCreatorId,
      applicationId: application._id,
      amount: campaign.budget,
      status: "pending",
      escrowPaid: false,
      creatorPayoutReleased: false,
      commissionAmount: Number(campaign.budget) * COMMISSION_RATE,
      contentProofs: [],
      messages: [],
      dispute: { raised: false },
    });
  }

  const note =
    decision === "rejected" && application.rejectionNote ? ` Reason: ${application.rejectionNote}` : "";
  if (applicantId) {
    await CollabliNotification.create({
      userId: applicantId,
      title: decision === "accepted" ? "Application accepted" : "Application rejected",
      body: `Your application for ${campaign.title} was ${decision}.${note}`,
      type: "application",
    });
  }
  return NextResponse.json({ ok: true });
}
