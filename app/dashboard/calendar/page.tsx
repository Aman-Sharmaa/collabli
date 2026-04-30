import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Project } from "@/models/Project";
import { Meeting } from "@/models/Meeting";
import { Client } from "@/models/Client";
import { Employee } from "@/models/Employee";
import { Product } from "@/models/Product";
import { User } from "@/models/User";
import { CalendarPageClient } from "@/components/calendar-page-client";

const COOKIE_NAME = "kalp_auth_token";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) redirect("/login");
  try {
    return verifyToken(token);
  } catch {
    redirect("/login");
  }
}

export default async function CalendarPage() {
  const user = await requireAuth();
  await connectDB();

  // Everyone sees only their own meetings (created by them OR they are attendees)
  // Fetch user data once (email for filtering, Google Calendar status for display)
  const userDoc = await User.findById(user.userId).select("email googleCalendarEmail googleCalendarAccessToken").lean();
  const userEmail = userDoc ? (userDoc as any).email : null;

  const meetingFilter: Record<string, unknown> = {};
  if (userEmail) {
    meetingFilter.$or = [
      { createdBy: user.userId },
      { attendees: userEmail }
    ];
  } else {
    // Fallback: only meetings created by user
    meetingFilter.createdBy = user.userId;
  }

  const [projects, meetings, clients, employees, products] = await Promise.all([
    Project.find({})
      .select("name client")
      .sort({ name: 1 })
      .lean(),
    Meeting.find(meetingFilter)
      .select("title description project createdBy startTime endTime attendees googleCalendarEventId meetingLink isRecurring recurrenceType parentMeetingId recurrenceInstance")
      .sort({ startTime: 1 })
      .populate("project", "name")
      .populate("createdBy", "email name")
      .lean(),
    Client.find({ isActive: true })
      .select("companyName contactEmails email")
      .sort({ companyName: 1 })
      .lean(),
    Employee.find({ isDismissed: false })
      .select("name email assignedProduct assignedService")
      .sort({ name: 1 })
      .lean(),
    Product.find({ isActive: { $ne: false } })
      .select("name kind")
      .sort({ kind: 1, name: 1 })
      .lean(),
  ]);

  const projectOptions = projects.map((p: any) => ({
    id: String(p._id),
    name: p.name as string,
    clientId: String(p.client),
  }));

  const clientOptions = clients.map((c: any) => ({
    id: String(c._id),
    companyName: c.companyName as string,
    contactEmails: (c.contactEmails || []) as string[],
    primaryEmail: c.email as string,
  }));

  const employeeOptions = employees.map((e: any) => ({
    id: String(e._id),
    name: e.name as string,
    email: e.email as string,
    assignedProduct: e.assignedProduct as string | undefined,
    assignedService: e.assignedService as string | undefined,
  }));

  const productOptions = products
    .filter((p: any) => p.kind === "product")
    .map((p: any) => ({
      id: p.name as string,
      name: p.name as string,
      kind: "product" as const,
    }));

  const serviceOptions = products
    .filter((p: any) => p.kind === "service")
    .map((p: any) => ({
      id: p.name as string,
      name: p.name as string,
      kind: "service" as const,
    }));

  const meetingItems = meetings.map((m: any) => ({
    id: String(m._id),
    title: m.title as string,
    description: m.description || "",
    projectId: String(m.project?._id || m.project),
    projectName: (m.project?.name as string) || "",
    createdByName: (m.createdBy?.name as string) || "",
    createdByEmail: (m.createdBy?.email as string) || "",
    startTime: m.startTime as Date,
    endTime: m.endTime as Date,
    attendees: (m.attendees || []) as string[],
    googleCalendarEventId: (m.googleCalendarEventId as string) || null,
    meetingLink: (m.meetingLink as string) || null,
    isRecurring: m.isRecurring || false,
    recurrenceType: m.recurrenceType || null,
    parentMeetingId: m.parentMeetingId ? String(m.parentMeetingId) : null,
    recurrenceInstance: m.recurrenceInstance || null,
  }));

  // Get user's Google Calendar connection status (already fetched above)
  const googleCalendarEmail = userDoc ? (userDoc as any).googleCalendarEmail : null;
  const isGoogleCalendarConnected = Boolean(userDoc && (userDoc as any).googleCalendarAccessToken);

  return (
    <CalendarPageClient
      userEmail={user.email}
      userRole={user.role as any}
      projects={projectOptions}
      clients={clientOptions}
      employees={employeeOptions}
      products={productOptions}
      services={serviceOptions}
      initialMeetings={meetingItems}
      googleCalendarEmail={googleCalendarEmail}
      isGoogleCalendarConnected={isGoogleCalendarConnected}
    />
  );
}

