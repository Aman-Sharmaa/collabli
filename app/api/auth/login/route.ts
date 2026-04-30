import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { LoginOtp } from "@/models/LoginOtp";
import {
  generateOtp,
  hashOtp,
  generateSessionToken,
  getOtpExpiry,
  RATE_LIMIT_WINDOW_MINUTES,
  RATE_LIMIT_MAX_SENDS,
  OTP_EXPIRY_MINUTES,
} from "@/lib/otp";
import { sendMail } from "@/lib/mailer";
import { loginOtpEmail } from "@/lib/email-templates";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const emailNorm = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: emailNorm }).lean();

    if (!user) {
      return NextResponse.json(
        { message: "No account found for this email" },
        { status: 401 }
      );
    }

    const ipAddress = getClientIp(req);

    const rateLimitSince = new Date(
      Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
    );
    const recentOtpCount = await LoginOtp.countDocuments({
      email: emailNorm,
      createdAt: { $gte: rateLimitSince },
    });

    if (recentOtpCount >= RATE_LIMIT_MAX_SENDS) {
      return NextResponse.json(
        {
          message: `Too many verification codes sent. Please wait ${RATE_LIMIT_WINDOW_MINUTES} minutes before trying again.`,
        },
        { status: 429 }
      );
    }

    await LoginOtp.deleteMany({ email: emailNorm, verified: false });

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const sessionToken = generateSessionToken(emailNorm, ipAddress);
    const expiresAt = getOtpExpiry();

    await LoginOtp.create({
      email: emailNorm,
      otpHash,
      sessionToken,
      ipAddress,
      expiresAt,
    });

    try {
      const html = loginOtpEmail({
        recipientName: user.name || emailNorm,
        otp,
        expiryMinutes: OTP_EXPIRY_MINUTES,
        ipAddress,
      });

      await sendMail({
        to: emailNorm,
        subject: `${otp} is your Kalp login code`,
        html,
      });
    } catch (mailErr) {
      console.error("[login] Failed to send OTP email:", mailErr);
      await LoginOtp.deleteOne({ sessionToken });
      return NextResponse.json(
        { message: "Failed to send verification code. Please try again." },
        { status: 500 }
      );
    }

    const maskedEmail = maskEmail(emailNorm);

    return NextResponse.json(
      {
        message: "Verification code sent",
        otpRequired: true,
        sessionToken,
        maskedEmail,
        expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${local[1]}${"*".repeat(Math.min(local.length - 2, 6))}@${domain}`;
}
