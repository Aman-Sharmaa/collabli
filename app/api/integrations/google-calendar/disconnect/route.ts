import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { User } from "@/models/User";
import { Meeting } from "@/models/Meeting";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "kalp_auth_token";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function POST(_req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const userDoc = await User.findById(user.userId);
  if (!userDoc) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // Delete all meetings created by this user (including synced meetings)
  const deleteResult = await Meeting.deleteMany({
    createdBy: user.userId,
  });

  // Clear Google Calendar connection
  userDoc.googleCalendarAccessToken = undefined;
  userDoc.googleCalendarRefreshToken = undefined;
  userDoc.googleCalendarExpiryDate = undefined;
  userDoc.googleCalendarEmail = undefined;

  await userDoc.save();

  return NextResponse.json({
    message: `Google Calendar disconnected successfully. ${deleteResult.deletedCount} meeting(s) deleted.`,
    success: true,
    deletedCount: deleteResult.deletedCount
  });
}
