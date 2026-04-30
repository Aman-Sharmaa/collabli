import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { User } from "@/models/User";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireSessionUser(["admin"]);
  await connectDB();

  const { id } = await ctx.params;
  const { status } = await req.json();

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  }

  const updated = await User.findOneAndUpdate(
    { _id: id, role: { $in: ["creator", "brand"] } },
    {
      $set: {
        approvalStatus: status,
        approvedAt: status === "approved" ? new Date() : undefined,
        approvedBy: admin.userId,
      },
    },
    { new: true }
  ).select("_id approvalStatus");

  if (!updated) return NextResponse.json({ message: "User not found" }, { status: 404 });

  return NextResponse.json({ ok: true, user: updated });
}
