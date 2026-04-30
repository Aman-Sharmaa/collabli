import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("kalp_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    verifyToken(token); // Just to ensure validity

    // For dashboard, fetch all events (possibly filter by company/user in future if needed)
    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json({ events }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("kalp_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = verifyToken(token);

    const body = await req.json();
    const { name, slug, date, startTime, endTime, location, address, description, aboutEvent, ticketTypes, photoUrl, themeColor, eventType } = body;

    if (!name || !slug || !date) {
      return NextResponse.json(
        { error: "Name, slug, and date are required" },
        { status: 400 }
      );
    }

    // Basic slug validation
    const existing = await Event.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const event = new Event({
      name,
      slug,
      date,
      startTime,
      endTime,
      location,
      address,
      description,
      aboutEvent,
      photoUrl,
      themeColor,
      eventType: eventType || "Offline",
      ticketTypes: ticketTypes || [],
      createdBy: user.userId,
    });

    await event.save();

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
