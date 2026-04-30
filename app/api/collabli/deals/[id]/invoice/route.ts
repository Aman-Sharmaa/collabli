import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { Deal } from "@/models/Deal";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser(["brand", "creator", "admin"]);
  const { id } = await ctx.params;
  await connectDB();
  const deal = await Deal.findById(id).populate("campaignId", "title").lean();
  if (!deal) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const allowed =
    user.role === "admin" ||
    String(deal.brandId) === user.userId ||
    String(deal.creatorId) === user.userId;
  if (!allowed) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const campaign = deal.campaignId as { title?: string } | null;
  const net = Number(deal.amount || 0) - Number(deal.commissionAmount || 0);
  const lines = [
    `Collabli — Deal invoice`,
    `Deal ID: ${String(deal._id)}`,
    `Campaign: ${campaign?.title || "—"}`,
    `Status: ${deal.status}`,
    `Gross amount: ${Number(deal.amount).toFixed(2)}`,
    `Platform fee: ${Number(deal.commissionAmount).toFixed(2)}`,
    `Creator net (reference): ${net.toFixed(2)}`,
    `Generated: ${new Date().toISOString()}`,
  ];
  const body = lines.join("\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="collabli-deal-${id}.txt"`,
    },
  });
}
