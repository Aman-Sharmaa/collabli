import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { User } from "@/models/User";
import { Meeting } from "@/models/Meeting";
import { Project } from "@/models/Project";

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

async function ensureValidGoogleAccessToken(userDoc: any): Promise<string | null> {
  const now = new Date();
  if (
    userDoc.googleCalendarAccessToken &&
    userDoc.googleCalendarExpiryDate &&
    new Date(userDoc.googleCalendarExpiryDate) > now
  ) {
    return userDoc.googleCalendarAccessToken as string;
  }

  if (!userDoc.googleCalendarRefreshToken) return null;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const params = new URLSearchParams();
  params.set("client_id", clientId);
  params.set("client_secret", clientSecret);
  params.set("refresh_token", userDoc.googleCalendarRefreshToken);
  params.set("grant_type", "refresh_token");

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!tokenRes.ok) return null;

    const tokenData = await tokenRes.json();
    const newAccessToken = tokenData.access_token as string | undefined;
    const expiresIn = tokenData.expires_in as number | undefined;

    if (newAccessToken && expiresIn) {
      userDoc.googleCalendarAccessToken = newAccessToken;
      userDoc.googleCalendarExpiryDate = new Date(Date.now() + expiresIn * 1000);
      await userDoc.save();
      return newAccessToken;
    }
  } catch {
    return null;
  }

  return null;
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectDB();

  const userDoc = await User.findById(user.userId).select(
    "email googleCalendarAccessToken googleCalendarRefreshToken googleCalendarExpiryDate googleCalendarEmail"
  );

  if (!userDoc || !userDoc.googleCalendarAccessToken) {
    return NextResponse.json(
      { message: "Google Calendar is not connected" },
      { status: 400 }
    );
  }

  const accessToken = await ensureValidGoogleAccessToken(userDoc);
  if (!accessToken) {
    return NextResponse.json(
      { message: "Failed to refresh Google Calendar token" },
      { status: 500 }
    );
  }

  try {
    // Fetch events from Google Calendar
    // Get events from the past 30 days and next 365 days
    const timeMin = new Date();
    timeMin.setDate(timeMin.getDate() - 30);
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 365);

    const params = new URLSearchParams({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: "2500", // Google Calendar API limit
      singleEvents: "true", // Expand recurring events
      orderBy: "startTime",
    });

    const eventsRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!eventsRes.ok) {
      const errorData = await eventsRes.json().catch(() => ({}));
      return NextResponse.json(
        { message: `Failed to fetch Google Calendar events: ${errorData.error?.message || "Unknown error"}` },
        { status: eventsRes.status }
      );
    }

    const eventsData = await eventsRes.json();
    const events = eventsData.items || [];

    // Get all existing meetings with Google Calendar event IDs
    const existingMeetings = await Meeting.find({
      googleCalendarEventId: { $exists: true, $ne: null },
    }).select("googleCalendarEventId").lean();

    const existingEventIds = new Set(
      existingMeetings.map((m: any) => m.googleCalendarEventId).filter(Boolean)
    );

    // Get a default project for synced meetings (or create a "Synced Meetings" project)
    let defaultProject = await Project.findOne({ name: "Synced Meetings" }).lean();
    if (!defaultProject) {
      // Try to get any project, or create a placeholder
      const anyProject = await Project.findOne({}).lean();
      if (anyProject) {
        defaultProject = anyProject;
      } else {
        return NextResponse.json(
          { message: "No projects found. Please create a project first." },
          { status: 400 }
        );
      }
    }

    let syncedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const event of events) {
      // Skip cancelled events
      if (event.status === "cancelled") {
        skippedCount++;
        continue;
      }

      const eventId = event.id;
      const startTime = event.start?.dateTime || event.start?.date;
      const endTime = event.end?.dateTime || event.end?.date;

      if (!startTime || !endTime) {
        skippedCount++;
        continue;
      }

      const start = new Date(startTime);
      const end = new Date(endTime);

      // Skip invalid dates
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
        skippedCount++;
        continue;
      }

      // For all-day events, set time to start of day
      if (event.start?.date && !event.start?.dateTime) {
        start.setHours(9, 0, 0, 0); // Default to 9 AM
      }
      if (event.end?.date && !event.end?.dateTime) {
        end.setHours(17, 0, 0, 0); // Default to 5 PM
      }

      // Extract attendees
      const attendees = (event.attendees || [])
        .map((a: any) => a.email)
        .filter((email: string) => email && email !== userDoc.email);

      // Check if meeting already exists
      const existingMeeting = await Meeting.findOne({
        googleCalendarEventId: eventId,
      });

      // Extract meeting link
      let meetingLink: string | null = null;
      if (event.hangoutsLink) {
        meetingLink = event.hangoutsLink;
      } else if (event.conferenceData?.entryPoints) {
        const videoEntry = event.conferenceData.entryPoints.find(
          (ep: any) => ep.entryPointType === "video" || ep.entryPointType === "more"
        );
        if (videoEntry?.uri) {
          meetingLink = videoEntry.uri;
        }
      } else if (event.description) {
        // Check description for meeting links
        const zoomMatch = event.description.match(/https?:\/\/[^\s]*zoom\.us\/[^\s]*/i);
        if (zoomMatch) meetingLink = zoomMatch[0];

        const teamsMatch = event.description.match(/https?:\/\/[^\s]*teams\.microsoft\.com\/[^\s]*/i);
        if (teamsMatch) meetingLink = teamsMatch[0];

        const meetMatch = event.description.match(/https?:\/\/meet\.google\.com\/[^\s]*/i);
        if (meetMatch) meetingLink = meetMatch[0];
      }

      const meetingData: any = {
        title: event.summary || "Untitled Event",
        description: event.description || undefined,
        project: defaultProject!._id,
        createdBy: user.userId,
        startTime: start,
        endTime: end,
        attendees: attendees.length > 0 ? attendees : undefined,
        googleCalendarEventId: eventId,
        meetingLink: meetingLink || undefined,
      };

      // Handle recurrence if present
      if (event.recurrence && event.recurrence.length > 0) {
        // Parse RRULE to extract recurrence info
        const rrule = event.recurrence.find((r: string) => r.startsWith("RRULE:"));
        if (rrule) {
          meetingData.isRecurring = true;
          // Note: Full RRULE parsing is complex, so we'll mark as recurring
          // and store the RRULE in description or a separate field if needed
          meetingData.recurrenceType = "custom";
        }
      }

      if (existingMeeting) {
        // Update existing meeting
        existingMeeting.title = meetingData.title;
        existingMeeting.description = meetingData.description;
        existingMeeting.startTime = meetingData.startTime;
        existingMeeting.endTime = meetingData.endTime;
        existingMeeting.attendees = meetingData.attendees;
        if (meetingLink) {
          existingMeeting.meetingLink = meetingLink;
        }
        await existingMeeting.save();
        updatedCount++;
      } else {
        // Create new meeting
        await Meeting.create(meetingData);
        syncedCount++;
      }
    }

    return NextResponse.json({
      message: "Sync completed",
      synced: syncedCount,
      updated: updatedCount,
      skipped: skippedCount,
      total: events.length,
    });
  } catch (error: any) {
    console.error("Google Calendar sync error:", error);
    return NextResponse.json(
      { message: `Sync failed: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
