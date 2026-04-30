import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { EventRegistration } from "@/models/EventRegistration";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kalp_auth_token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    
    const user = verifyToken(token);
    await connectDB();

    // Fetch all events created by this user
    const userEvents = await Event.find({ createdBy: user.userId }).select("_id name slug");
    const eventIds = userEvents.map(e => e._id);

    // Fetch all registrations for these events
    const registrations = await EventRegistration.find({ eventId: { $in: eventIds } })
      .populate("eventId", "name slug isPublicForm")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, registrations }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
