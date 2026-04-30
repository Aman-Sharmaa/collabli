import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { Deal } from "@/models/Deal";
import { CollabliNotification } from "@/models/CollabliNotification";
import { User } from "@/models/User";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser(["creator"]);
  const { id } = await ctx.params;
  const { note } = await req.json();
  const text = String(note || "").trim().slice(0, 2000);
  if (!text) return NextResponse.json({ message: "Describe the issue" }, { status: 400 });

  await connectDB();
  const deal = await Deal.findById(id);
  if (!deal) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (String(deal.creatorId) !== user.userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  if (deal.dispute?.raised) {
    return NextResponse.json({ message: "Dispute already raised" }, { status: 400 });
  }

  deal.dispute = {
    raised: true,
    note: text,
    raisedAt: new Date(),
    raisedBy: new mongoose.Types.ObjectId(user.userId),
  };
  await deal.save();

  const brandPrefs = await User.findById(deal.brandId).select("notificationPrefs").lean();
  const np = (brandPrefs as { notificationPrefs?: { dealUpdates?: boolean } } | null)?.notificationPrefs;
  if (np?.dealUpdates !== false) {
    await CollabliNotification.create({
      userId: deal.brandId,
      title: "Deal dispute raised",
      body: `A creator raised a dispute on a deal. ${text.slice(0, 200)}`,
      type: "dispute",
      dealId: deal._id,
    });
  }

  return NextResponse.json({ deal });
}
