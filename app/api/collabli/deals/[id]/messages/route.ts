import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { Deal } from "@/models/Deal";
import { CollabliNotification } from "@/models/CollabliNotification";
import { User } from "@/models/User";
import mongoose from "mongoose";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser(["brand", "creator", "admin"]);
  const { id } = await ctx.params;
  await connectDB();
  const deal = await Deal.findById(id).select("messages brandId creatorId").lean();
  if (!deal) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const allowed =
    user.role === "admin" ||
    String(deal.brandId) === user.userId ||
    String(deal.creatorId) === user.userId;
  if (!allowed) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  return NextResponse.json({ messages: deal.messages || [] });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser(["brand", "creator"]);
  const { id } = await ctx.params;
  const { body } = await req.json();
  const text = String(body || "").trim();
  if (!text || text.length > 5000) {
    return NextResponse.json({ message: "Message required (max 5000 chars)" }, { status: 400 });
  }
  await connectDB();
  const deal = await Deal.findById(id);
  if (!deal) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const isBrand = String(deal.brandId) === user.userId;
  const isCreator = String(deal.creatorId) === user.userId;
  if (!isBrand && !isCreator) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const senderId = new mongoose.Types.ObjectId(user.userId);
  deal.messages = deal.messages || [];
  deal.messages.push({ senderId, body: text, createdAt: new Date() });
  await deal.save();

  const recipientId = isBrand ? deal.creatorId : deal.brandId;
  const prefs = await User.findById(recipientId).select("notificationPrefs").lean();
  const np = (prefs as { notificationPrefs?: { messages?: boolean } } | null)?.notificationPrefs;
  if (np?.messages !== false) {
    await CollabliNotification.create({
      userId: recipientId,
      title: "New deal message",
      body: text.slice(0, 280),
      type: "message",
      dealId: deal._id,
    });
  }

  return NextResponse.json({ deal });
}
