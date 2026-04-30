import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { User } from "@/models/User";
import { Deal } from "@/models/Deal";
import { Campaign } from "@/models/Campaign";

export async function GET() {
  await requireSessionUser(["admin"]);
  await connectDB();

  const [
    totalBrands,
    totalCreators,
    pendingApprovals,
    approvedBrands,
    approvedCreators,
    totalDeals,
    activeDeals,
    totalCampaigns,
    openCampaigns,
  ] = await Promise.all([
    User.countDocuments({ role: "brand" }),
    User.countDocuments({ role: "creator" }),
    User.countDocuments({ role: { $in: ["brand", "creator"] }, approvalStatus: "pending" }),
    User.countDocuments({ role: "brand", approvalStatus: "approved" }),
    User.countDocuments({ role: "creator", approvalStatus: "approved" }),
    Deal.countDocuments(),
    Deal.countDocuments({ status: { $in: ["active", "submitted"] } }),
    Campaign.countDocuments(),
    Campaign.countDocuments({ status: "open" }),
  ]);

  return NextResponse.json({
    totalBrands,
    totalCreators,
    pendingApprovals,
    approvedBrands,
    approvedCreators,
    totalDeals,
    activeDeals,
    totalCampaigns,
    openCampaigns,
  });
}
