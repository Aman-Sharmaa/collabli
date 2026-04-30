import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { Deal } from "@/models/Deal";

export async function GET() {
  const user = await requireSessionUser(["brand", "creator", "admin"]);
  await connectDB();
  const query: Record<string, unknown> = {};
  if (user.role === "brand") query.brandId = user.userId;
  if (user.role === "creator") query.creatorId = user.userId;
  const deals = await Deal.find(query)
    .populate("campaignId", "title deadline niche budget")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ deals });
}
