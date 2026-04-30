import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

const COOKIE_NAME = "kalp_auth_token";

export async function GET(_req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }

  let payload: any;
  try {
    payload = verifyToken(token);
  } catch {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { message: "Google Calendar is not configured. Ask admin to set GOOGLE_CLIENT_ID and GOOGLE_CALENDAR_REDIRECT_URI" },
      { status: 500 }
    );
  }

  const base = "https://accounts.google.com/o/oauth2/v2/auth";
  const params = new URLSearchParams();
  params.set("client_id", clientId);
  params.set("redirect_uri", redirectUri);
  params.set("response_type", "code");
  params.set("scope", "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly");
  params.set("access_type", "offline");
  params.set("prompt", "consent");
  params.set("include_granted_scopes", "true");
  params.set("state", `meetings:${payload.userId}`);

  return NextResponse.redirect(`${base}?${params.toString()}`);
}
