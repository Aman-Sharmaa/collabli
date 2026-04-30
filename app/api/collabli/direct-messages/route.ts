import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { CollabliDirectMessage } from "@/models/CollabliDirectMessage";
import { User } from "@/models/User";
import { getIO } from "@/lib/socket-server";
import { CollabliNotification } from "@/models/CollabliNotification";

export async function GET(req: NextRequest) {
  const user = await requireSessionUser(["brand", "creator"]);
  const withUserId = req.nextUrl.searchParams.get("with");
  await connectDB();
  const me = user.userId;

  if (withUserId) {
    if (withUserId === me) {
      return NextResponse.json({ message: "Invalid peer" }, { status: 400 });
    }
    const thread = await CollabliDirectMessage.find({
      $or: [
        { fromUserId: me, toUserId: withUserId },
        { fromUserId: withUserId, toUserId: me },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    await CollabliDirectMessage.updateMany(
      { fromUserId: withUserId, toUserId: me, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({ messages: thread });
  }

  const all = await CollabliDirectMessage.find({
    $or: [{ fromUserId: me }, { toUserId: me }],
  })
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

  const lastByPeer = new Map<string, (typeof all)[0]>();
  const unreadByPeer: Record<string, number> = {};

  for (const m of all) {
    const from = String(m.fromUserId);
    const to = String(m.toUserId);
    const peer = from === me ? to : from;
    if (!lastByPeer.has(peer)) lastByPeer.set(peer, m);
    if (to === me && !m.read) {
      unreadByPeer[peer] = (unreadByPeer[peer] || 0) + 1;
    }
  }

  const peerIds = [...lastByPeer.keys()].map((id) => new mongoose.Types.ObjectId(id));
  const profiles =
    peerIds.length > 0
      ? await User.find({ _id: { $in: peerIds } })
          .select("name email publicHandle role")
          .lean()
      : [];
  const profileById = new Map(profiles.map((p) => [String(p._id), p]));

  const conversations = [...lastByPeer.entries()].map(([peerId, last]) => {
    const p = profileById.get(peerId);
    return {
      peerId,
      unread: unreadByPeer[peerId] || 0,
      lastMessage: last,
      peer: p
        ? { name: p.name, email: p.email, publicHandle: p.publicHandle, role: p.role }
        : { name: "User", email: "", publicHandle: "", role: "" },
    };
  });

  conversations.sort((a, b) => {
    const ta = new Date((a.lastMessage as { createdAt?: Date }).createdAt || 0).getTime();
    const tb = new Date((b.lastMessage as { createdAt?: Date }).createdAt || 0).getTime();
    return tb - ta;
  });

  return NextResponse.json({ conversations });
}

export async function POST(req: NextRequest) {
  const user = await requireSessionUser(["brand", "creator"]);
  const { toUserId, body } = await req.json();
  const text = String(body || "").trim();
  if (!toUserId || !text) {
    return NextResponse.json({ message: "Recipient and message required" }, { status: 400 });
  }
  if (String(toUserId) === user.userId) {
    return NextResponse.json({ message: "Cannot message yourself" }, { status: 400 });
  }

  await connectDB();
  const peer = await User.findById(toUserId).select("_id role").lean();
  if (!peer || (peer.role !== "brand" && peer.role !== "creator")) {
    return NextResponse.json({ message: "Recipient not found" }, { status: 404 });
  }

  const doc = await CollabliDirectMessage.create({
    fromUserId: user.userId,
    toUserId,
    body: text.slice(0, 8000),
    read: false,
  });

  const created = doc.toObject() as { createdAt?: Date };
  const payload = {
    id: String(doc._id),
    fromUserId: user.userId,
    toUserId: String(toUserId),
    body: doc.body,
    createdAt: created.createdAt,
  };

  const io = getIO();
  io?.to(`user:${toUserId}`).emit("collabli-dm", payload);

  await CollabliNotification.create({
    userId: toUserId,
    title: "New message",
    body: text.length > 120 ? `${text.slice(0, 117)}…` : text,
    type: "message",
  });

  return NextResponse.json({ message: { ...doc.toObject(), _id: doc._id } }, { status: 201 });
}
