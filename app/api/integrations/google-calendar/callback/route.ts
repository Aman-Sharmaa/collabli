import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state") || "";

  if (!code || !state.startsWith("meetings:")) {
    return NextResponse.json({ message: "Invalid callback" }, { status: 400 });
  }

  const userId = state.split(":")[1];

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { message: "Google Calendar is not configured on server" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams();
  params.set("code", code);
  params.set("client_id", clientId);
  params.set("client_secret", clientSecret);
  params.set("redirect_uri", redirectUri);
  params.set("grant_type", "authorization_code");

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!tokenRes.ok) {
    return NextResponse.json({ message: "Failed to exchange Google token" }, { status: 500 });
  }

  const tokenData = await tokenRes.json();

  const accessToken = tokenData.access_token as string | undefined;
  const refreshToken = (tokenData.refresh_token as string | undefined) || undefined;
  const expiresIn = tokenData.expires_in as number | undefined;

  await connectDB();
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // Fetch user's Google account email to identify which calendar is connected
  let googleEmail: string | undefined;
  if (accessToken) {
    try {
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (userInfoRes.ok) {
        const userInfo = await userInfoRes.json();
        googleEmail = userInfo.email;
      }
    } catch {
      // If we can't fetch email, continue anyway
    }
  }

  if (accessToken) {
    user.googleCalendarAccessToken = accessToken;
  }
  if (refreshToken) {
    user.googleCalendarRefreshToken = refreshToken;
  }
  if (expiresIn) {
    user.googleCalendarExpiryDate = new Date(Date.now() + expiresIn * 1000);
  }
  if (googleEmail) {
    user.googleCalendarEmail = googleEmail;
  }

  await user.save();

  const redirectTarget =
    process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/calendar?connected=1`
      : "http://localhost:3000/dashboard/calendar?connected=1";

  return NextResponse.redirect(redirectTarget);
}

