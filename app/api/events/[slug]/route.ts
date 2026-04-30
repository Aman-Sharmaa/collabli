import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { EventRegistration } from "@/models/EventRegistration";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { sendMail } from "@/lib/mailer";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    await connectDB();

    const event = await Event.findOne({ slug });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("kalp_auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    verifyToken(token); // check user

    const body = await req.json();

    const oldEvent = await Event.findOne({ slug });
    if (!oldEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const event = await Event.findOneAndUpdate({ slug }, body, { new: true });
    
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if there are any approved attendees to notify
    try {
      const attendees = await EventRegistration.find({ eventId: event._id, status: "Approved" });
      const emails = attendees.map(a => a.email).filter(Boolean);

      if (emails.length > 0) {
        const subject = `Update: Important Changes to ${event.name}`;
        const html = `
          <div style="font-family: sans-serif; color: #333;">
            <h2>Important Event Update</h2>
            <p>Hi there,</p>
            <p>Please be advised that the details for the event <strong>${event.name}</strong> have been updated by the organizer.</p>
            <p>Head over to the event page to review the latest changes: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://kalp.ltd'}/event/${event.slug}">View Event Details</a></p>
            <p>Best,<br/>The Kalp Team</p>
          </div>
        `;
        
        for (const email of emails) {
          try {
            await sendMail({ to: email, subject, html });
          } catch (mailErr) {
            console.error(`Failed to send event update email to ${email}`, mailErr);
          }
        }
      }
    } catch (err) {
      console.error("Failed to notify attendees of event update", err);
      // Proceed without failing the patch
    }

    return NextResponse.json({ success: true, event }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("kalp_auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    verifyToken(token);

    const event = await Event.findOneAndDelete({ slug });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
