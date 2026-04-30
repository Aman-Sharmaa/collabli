import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { CreatorProfile } from "@/models/CreatorProfile";
import { BrandProfile } from "@/models/BrandProfile";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ message: "Server setup incomplete: MONGODB_URI missing. Add it to .env.local." }, { status: 500 });
    }

    const body = await req.json();
    const { email, password, name, role, profile } = body || {};

    if (!email || !password || !name || !["brand", "creator"].includes(role)) {
      return NextResponse.json({ message: "Invalid signup payload" }, { status: 400 });
    }

    if (role === "creator") {
      const required = ["niche", "platforms", "audienceSize", "location", "rate", "bio"];
      const missing = required.find((k) => profile?.[k] === undefined || profile?.[k] === null || profile?.[k] === "");
      if (missing) return NextResponse.json({ message: `Missing creator field: ${missing}` }, { status: 400 });
    }

    if (role === "brand") {
      const required = ["companyName", "industry", "website", "location", "monthlyBudget"];
      const missing = required.find((k) => profile?.[k] === undefined || profile?.[k] === null || profile?.[k] === "");
      if (missing) return NextResponse.json({ message: `Missing brand field: ${missing}` }, { status: 400 });
    }

    await connectDB();
    const emailNorm = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: emailNorm }).lean();
    if (existing) return NextResponse.json({ message: "Email already in use" }, { status: 409 });

    const user = await User.create({
      email: emailNorm,
      password: await hashPassword(password),
      name: String(name).trim(),
      role,
      authProvider: "email",
      approvalStatus: "pending",
    });

    if (role === "creator") {
      await CreatorProfile.create({
        userId: user._id,
        niche: String(profile.niche || ""),
        platforms: Array.isArray(profile.platforms) ? profile.platforms : String(profile.platforms || "").split(",").map((v: string) => v.trim()).filter(Boolean),
        audienceSize: Number(profile.audienceSize || 0),
        location: String(profile.location || ""),
        rate: Number(profile.rate || 0),
        bio: String(profile.bio || ""),
        portfolio: Array.isArray(profile.portfolio) ? profile.portfolio : [],
      });
    }

    if (role === "brand") {
      await BrandProfile.create({
        userId: user._id,
        companyName: String(profile.companyName || ""),
        industry: String(profile.industry || ""),
        website: String(profile.website || ""),
        location: String(profile.location || ""),
        monthlyBudget: Number(profile.monthlyBudget || 0),
      });
    }

    return NextResponse.json({
      message: "Signup submitted. Waiting for admin approval.",
      pendingApproval: true,
    });
  } catch (error) {
    console.error("signup error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
