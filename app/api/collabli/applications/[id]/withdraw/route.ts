import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { CampaignApplication, applicationApplicantId } from "@/models/CampaignApplication";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser(["creator", "brand"]);
  const { id } = await ctx.params;
  await connectDB();
  const application = await CampaignApplication.findById(id);
  if (!application) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (applicationApplicantId(application) !== user.userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  if (application.status !== "pending") {
    return NextResponse.json({ message: "Only pending applications can be withdrawn" }, { status: 400 });
  }
  application.status = "withdrawn";
  application.withdrawnAt = new Date();
  await application.save();
  return NextResponse.json({ application });
}
