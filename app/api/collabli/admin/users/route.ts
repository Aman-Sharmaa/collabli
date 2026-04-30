import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSessionUser } from "@/lib/collabli-auth";
import { User } from "@/models/User";
import { CreatorProfile } from "@/models/CreatorProfile";
import { BrandProfile } from "@/models/BrandProfile";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  await requireSessionUser(["admin"]);
  await connectDB();

  const users = await User.find({ role: { $in: ["creator", "brand"] } })
    .select("name email role approvalStatus createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const admin = await requireSessionUser(["admin"]);
  await connectDB();

  const body = await req.json();
  const { role, name, email, password, profile } = body || {};

  if (!["creator", "brand"].includes(role) || !name || !email || !password) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const existing = await User.findOne({ email: String(email).trim().toLowerCase() }).lean();
  if (existing) return NextResponse.json({ message: "Email already exists" }, { status: 409 });

  const user = await User.create({
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    password: await hashPassword(String(password)),
    role,
    authProvider: "email",
    approvalStatus: "approved",
    approvedAt: new Date(),
    approvedBy: admin.userId,
  });

  if (role === "creator") {
    await CreatorProfile.create({
      userId: user._id,
      niche: String(profile?.niche || ""),
      platforms: Array.isArray(profile?.platforms) ? profile.platforms : String(profile?.platforms || "").split(",").map((v: string) => v.trim()).filter(Boolean),
      audienceSize: Number(profile?.audienceSize || 0),
      location: String(profile?.location || ""),
      rate: Number(profile?.rate || 0),
      bio: String(profile?.bio || ""),
      portfolio: [],
    });
  }

  if (role === "brand") {
    await BrandProfile.create({
      userId: user._id,
      companyName: String(profile?.companyName || ""),
      industry: String(profile?.industry || ""),
      website: String(profile?.website || ""),
      location: String(profile?.location || ""),
      monthlyBudget: Number(profile?.monthlyBudget || 0),
    });
  }

  return NextResponse.json({ ok: true, userId: String(user._id) }, { status: 201 });
}
