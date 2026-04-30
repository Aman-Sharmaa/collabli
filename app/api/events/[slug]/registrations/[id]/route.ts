import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { EventRegistration } from "@/models/EventRegistration";
import { Event } from "@/models/Event";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { sendMail } from "@/lib/mailer";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const id = (await params).id;
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("kalp_auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    verifyToken(token);

    const body = await req.json();
    const { status } = body;

    const registration = await EventRegistration.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("eventId");

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (status === "Approved") {
      const event: any = registration.eventId;
      const subject = `Your registration for ${event.name} is Approved!`;
      const html = `<p>Hi ${registration.name},</p><p>Great news! Your registration for the <b>${event.name}</b> event has been approved.</p><p>You hold a <b>${registration.ticketType}</b> ticket. We are excited to see you there!</p>`;
      
      try {
        await sendMail({ to: registration.email, subject, html });
      } catch (err) {
        console.error("Failed to send approval email:", err);
      }
    }

    return NextResponse.json({ success: true, registration }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
