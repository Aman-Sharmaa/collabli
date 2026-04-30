import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { EventRegistration } from "@/models/EventRegistration";
import { sendMail } from "@/lib/mailer";

export async function POST(
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

    const body = await req.json();
    const { 
      ticketType, name, email, phone, role, linkedin, 
      startupName, startupAbout, startupUrl,
      investmentStage, ticketSize, portfolioUrl,
      resumeUrl, experienceYears, preferredRoles,
      companyName, jobTitle
    } = body;

    // Check if ticket requires approval
    const selectedTicket = event.ticketTypes?.find((t: any) => t.name === ticketType);
    if (!selectedTicket) {
      return NextResponse.json(
        { error: "Invalid ticket type selected" },
        { status: 400 }
      );
    }

    const existingRegistration = await EventRegistration.findOne({
      eventId: event._id,
      email,
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "You have already registered for this event" },
        { status: 400 }
      );
    }

    const isPending = selectedTicket.requiresApproval;

    const registration = new EventRegistration({
      eventId: event._id,
      ticketType,
      status: isPending ? "Pending" : "Approved",
      name,
      email,
      phone,
      role,
      linkedin,
      startupName,
      startupAbout,
      startupUrl,
      investmentStage,
      ticketSize,
      portfolioUrl,
      resumeUrl,
      experienceYears,
      preferredRoles,
      companyName,
      jobTitle,
    });

    await registration.save();

    // Send Confirmation Email
    const subject = `Welcome to ${event.name}!`;
    const html = isPending
      ? `<p>Hi ${name},</p><p>Thank you for registering for <b>${event.name}</b>.</p><p>Your ticket type (<b>${ticketType}</b>) requires approval. We will notify you once your registration is approved.</p>`
      : `<p>Hi ${name},</p><p>Thank you for registering for <b>${event.name}</b>!</p><p>Your registration is confirmed for the <b>${ticketType}</b> ticket.</p><p>We look forward to seeing you there.</p>`;

    try {
      await sendMail({ to: email, subject, html });
    } catch (err) {
      console.error("Failed to send registration email:", err);
    }

    return NextResponse.json(
      { success: true, registration },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
