import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { Deal } from "@/models/Deal";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser(["creator"]);
  const { id } = await ctx.params;
  const { url, kind, note } = await req.json();
  const u = String(url || "").trim();
  if (!u) return NextResponse.json({ message: "URL required" }, { status: 400 });
  const k = kind === "screenshot" ? "screenshot" : "link";

  await connectDB();
  const deal = await Deal.findById(id);
  if (!deal) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (String(deal.creatorId) !== user.userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  deal.contentProofs = deal.contentProofs || [];
  deal.contentProofs.push({
    url: u,
    kind: k,
    note: String(note || "").slice(0, 1000),
    createdAt: new Date(),
  });
  deal.submittedContentUrl = u;
  await deal.save();
  return NextResponse.json({ deal });
}
