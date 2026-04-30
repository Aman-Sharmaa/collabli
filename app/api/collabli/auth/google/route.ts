import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { signToken } from "@/lib/auth";

const COOKIE_NAME = "kalp_auth_token";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { message: "Server setup incomplete: MONGODB_URI missing. Add it to .env.local." },
        { status: 500 }
      );
    }
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { message: "Server setup incomplete: JWT_SECRET missing. Add it to .env.local." },
        { status: 500 }
      );
    }
    const { idToken, role } = await req.json();
    if (!idToken || !["brand", "creator"].includes(role)) return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!tokenInfoRes.ok) return NextResponse.json({ message: "Invalid Google token" }, { status: 401 });
    const tokenInfo = await tokenInfoRes.json();
    const aud = String(tokenInfo.aud || "");
    const configuredClientId = process.env.GOOGLE_CLIENT_ID || "";
    if (configuredClientId && aud !== configuredClientId) return NextResponse.json({ message: "Google client mismatch" }, { status: 401 });
    const email = String(tokenInfo.email || "").toLowerCase();
    const name = String(tokenInfo.name || "").trim();
    if (!email) return NextResponse.json({ message: "Google account email missing" }, { status: 400 });
    await connectDB();
    let user = await User.findOne({ email, role });
    if (!user) {
      return NextResponse.json(
        { message: "No account for this Google email. Complete signup first, then wait for admin approval." },
        { status: 404 }
      );
    }
    if ((user.role === "creator" || user.role === "brand") && user.approvalStatus !== "approved") {
      return NextResponse.json(
        { message: user.approvalStatus === "rejected" ? "Your account was rejected." : "Your account is pending admin approval." },
        { status: 403 }
      );
    }
    const token = signToken({ userId: String(user._id), email: user.email, role: user.role });
    const res = NextResponse.json({ user: { id: String(user._id), email: user.email, name: user.name, role: user.role } });
    res.cookies.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (error) {
    console.error("google auth error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
