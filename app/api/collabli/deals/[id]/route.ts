import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { Deal } from "@/models/Deal";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser(["brand", "creator", "admin"]);
  const { id } = await ctx.params;
  await connectDB();
  const deal = await Deal.findById(id)
    .populate("campaignId", "title deadline niche deliverables budget")
    .lean();
  if (!deal) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const allowed =
    user.role === "admin" ||
    String(deal.brandId) === user.userId ||
    String(deal.creatorId) === user.userId;
  if (!allowed) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  return NextResponse.json({ deal });
}
