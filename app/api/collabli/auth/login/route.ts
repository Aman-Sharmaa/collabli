import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { comparePassword, signToken } from "@/lib/auth";

const COOKIE_NAME = "kalp_auth_token";

function emailRegexExact(emailNorm: string): RegExp {
  const safe = emailNorm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${safe}$`, "i");
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ message: "Server setup incomplete: MONGODB_URI missing. Add it to .env.local." }, { status: 500 });
    }
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ message: "Server setup incomplete: JWT_SECRET missing. Add it to .env.local." }, { status: 500 });
    }

    const { email, password, role } = await req.json();
    if (!email || !password || !["brand", "creator", "admin"].includes(role)) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
    }

    await connectDB();
    const emailNorm = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: emailRegexExact(emailNorm), role });
    if (user && (user as { deletedAt?: Date }).deletedAt) {
      return NextResponse.json({ message: "This account has been deleted." }, { status: 403 });
    }
    if (!user) {
      const sameEmail = await User.findOne({ email: emailRegexExact(emailNorm) }).select("role").lean();
      if (sameEmail) {
        if (sameEmail.role === "admin" && (role === "brand" || role === "creator")) {
          return NextResponse.json(
            { message: "This email is an admin account. Use /admin/login instead of Creator/Brand login." },
            { status: 404 }
          );
        }
        if ((sameEmail.role === "brand" || sameEmail.role === "creator") && role === "admin") {
          return NextResponse.json(
            { message: "This email is a creator or brand account. Use /login, not admin login." },
            { status: 404 }
          );
        }
      }
      return NextResponse.json(
        {
          message:
            role === "admin"
              ? "No admin account for this email. Run npm run create-admin (set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local)."
              : "Account not found",
        },
        { status: 404 }
      );
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) return NextResponse.json({ message: "Incorrect password" }, { status: 401 });

    if ((user.role === "creator" || user.role === "brand") && user.approvalStatus !== "approved") {
      return NextResponse.json(
        { message: user.approvalStatus === "rejected" ? "Your account was rejected by admin." : "Your account is pending admin approval." },
        { status: 403 }
      );
    }

    const token = signToken({ userId: String(user._id), email: user.email, role: user.role });
    const res = NextResponse.json({ user: { id: String(user._id), email: user.email, name: user.name, role: user.role } });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (error) {
    console.error("login error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
