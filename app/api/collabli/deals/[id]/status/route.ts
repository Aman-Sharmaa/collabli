import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { Deal, type DealStatus } from "@/models/Deal";
import { CollabliNotification } from "@/models/CollabliNotification";
import { CollabliTransaction } from "@/models/CollabliTransaction";
import { User } from "@/models/User";

const ORDER: DealStatus[] = ["pending", "active", "submitted", "completed"];

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser(["brand", "creator", "admin"]);
  const { id } = await ctx.params;
  const body = await req.json();
  const nextStatus = body.status as DealStatus;
  if (!ORDER.includes(nextStatus)) return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  await connectDB();
  const deal = await Deal.findById(id);
  if (!deal) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const allowed = user.role === "admin" || String(deal.brandId) === user.userId || String(deal.creatorId) === user.userId;
  if (!allowed) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const currentIdx = ORDER.indexOf(deal.status as DealStatus);
  const nextIdx = ORDER.indexOf(nextStatus);
  if (nextIdx < currentIdx) return NextResponse.json({ message: "Cannot move backward" }, { status: 400 });
  deal.status = nextStatus;
  if (nextStatus === "active") deal.escrowPaid = true;
  if (nextStatus === "submitted") {
    if (body.submittedContentUrl) deal.submittedContentUrl = String(body.submittedContentUrl);
    if (body.proofUrl) {
      deal.contentProofs = deal.contentProofs || [];
      deal.contentProofs.push({
        url: String(body.proofUrl),
        kind: body.proofKind === "screenshot" ? "screenshot" : "link",
        note: String(body.proofNote || "").slice(0, 1000),
        createdAt: new Date(),
      });
    }
  }
  if (nextStatus === "completed") {
    deal.creatorPayoutReleased = true;
    const net = Number(deal.amount || 0) - Number(deal.commissionAmount || 0);
    const existing = await CollabliTransaction.findOne({ dealId: deal._id, type: "earning" }).lean();
    if (!existing && net > 0) {
      await CollabliTransaction.create({
        userId: deal.creatorId,
        dealId: deal._id,
        type: "earning",
        amount: net,
        status: "completed",
        description: `Earning for completed deal`,
      });
      const creator = await User.findById(deal.creatorId).select("notificationPrefs").lean();
      const payOk = (creator as { notificationPrefs?: { payments?: boolean } } | null)?.notificationPrefs?.payments !== false;
      if (payOk) {
        await CollabliNotification.create({
          userId: deal.creatorId,
          title: "Payment received",
          body: `A payout of ${net.toFixed(2)} was recorded for your completed deal.`,
          type: "payment",
          dealId: deal._id,
        });
      }
    }
  }
  await deal.save();

  const brandPrefs = await User.findById(deal.brandId).select("notificationPrefs").lean();
  const creatorPrefs = await User.findById(deal.creatorId).select("notificationPrefs").lean();
  const bOk = (brandPrefs as { notificationPrefs?: { dealUpdates?: boolean } } | null)?.notificationPrefs?.dealUpdates !== false;
  const cOk = (creatorPrefs as { notificationPrefs?: { dealUpdates?: boolean } } | null)?.notificationPrefs?.dealUpdates !== false;
  const notifs: { userId: typeof deal.brandId; title: string; body: string; type: "deal_status"; dealId: typeof deal._id }[] = [];
  if (bOk) notifs.push({ userId: deal.brandId, title: "Deal status updated", body: `Deal moved to ${nextStatus}`, type: "deal_status", dealId: deal._id });
  if (cOk) notifs.push({ userId: deal.creatorId, title: "Deal status updated", body: `Deal moved to ${nextStatus}`, type: "deal_status", dealId: deal._id });
  if (notifs.length) await CollabliNotification.insertMany(notifs);

  return NextResponse.json({ deal });
}
