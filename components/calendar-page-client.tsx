"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar as CalendarIcon, Link as LinkIcon, Plus, Repeat, Eye, Edit, X, Ban, MoreVertical, Video, LogOut, List, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { MeetingReminder } from "./meeting-reminder";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@/lib/utils";

type UserRole = "employee" | "admin" | "client" | "lead";

type ProjectOption = { id: string; name: string; clientId: string };
type ClientOption = { id: string; companyName: string; contactEmails?: string[]; primaryEmail?: string };
type EmployeeOption = { id: string; name: string; email: string; assignedProduct?: string; assignedService?: string };
type ProductServiceOption = { id: string; name: string; kind: "product" | "service" };

type MeetingItem = {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  createdByName: string;
  createdByEmail: string;
  startTime: string | Date;
  endTime: string | Date;
  attendees: string[];
  googleCalendarEventId: string | null;
  meetingLink?: string | null;
  isRecurring?: boolean;
  recurrenceType?: string | null;
  parentMeetingId?: string | null;
  recurrenceInstance?: number | null;
};

type FilterType = "today" | "tomorrow" | "this_month" | "custom" | "all";

type Props = {
  userEmail: string;
  userRole: UserRole;
  projects: ProjectOption[];
  clients: ClientOption[];
  employees: EmployeeOption[];
  products: ProductServiceOption[];
  services: ProductServiceOption[];
  initialMeetings: MeetingItem[];
  googleCalendarEmail?: string | null;
  isGoogleCalendarConnected?: boolean;
};

export function CalendarPageClient({
  userEmail,
  userRole,
  projects,
  clients,
  employees,
  products,
  services,
  initialMeetings,
  googleCalendarEmail,
  isGoogleCalendarConnected,
}: Props) {
  const searchParams = useSearchParams();

  // Normalize meeting links (especially Google Meet) for clean redirects
  function normalizeMeetingLink(rawLink: string | null | undefined): string | null {
    if (!rawLink) return null;
    try {
      const url = new URL(rawLink);
      // For Google Meet links, strip query/hash and keep clean path
      if (url.hostname.includes("meet.google.com")) {
        return `${url.origin}${url.pathname}`;
      }
      return rawLink;
    } catch {
      return rawLink;
    }
  }
  const [meetings, setMeetings] = useState<MeetingItem[]>(() =>
    initialMeetings.map((m) => ({
      ...m,
      startTime: typeof m.startTime === "string" ? m.startTime : new Date(m.startTime).toISOString(),
      endTime: typeof m.endTime === "string" ? m.endTime : new Date(m.endTime).toISOString(),
      meetingLink: normalizeMeetingLink(m.meetingLink),
    }))
  );
  const [fetchingMeetLinks, setFetchingMeetLinks] = useState<Set<string>>(new Set());

  // Fetch Meet link for meetings that have googleCalendarEventId but no meetingLink
  // Only called when user explicitly clicks "Join meeting"
  const fetchMeetLink = useCallback(async (meetingId: string): Promise<string | null> => {
    if (fetchingMeetLinks.has(meetingId)) return null;

    setFetchingMeetLinks((prev) => new Set(prev).add(meetingId));
    try {
      const res = await fetch(`/api/meetings/${meetingId}/meet-link`);
      if (res.ok) {
        const data = await res.json();
        if (data.meetingLink) {
          const normalizedLink = normalizeMeetingLink(data.meetingLink) || data.meetingLink;
          // Update the meeting in state
          setMeetings((prev) =>
            prev.map((m) =>
              m.id === meetingId
                ? { ...m, meetingLink: normalizedLink }
                : m
            )
          );
          return normalizedLink;
        }
      }
      return null;
    } catch {
      return null;
    } finally {
      setFetchingMeetLinks((prev) => {
        const next = new Set(prev);
        next.delete(meetingId);
        return next;
      });
    }
  }, [fetchingMeetLinks]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean>(isGoogleCalendarConnected || false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(googleCalendarEmail || null);
  const [disconnectConfirmOpen, setDisconnectConfirmOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [productServiceFilter, setProductServiceFilter] = useState<string>("all");
  const [clientContactEmails, setClientContactEmails] = useState<string[]>([]);
  const [selectedClientEmails, setSelectedClientEmails] = useState<string[]>([]);
  const [newClientEmail, setNewClientEmail] = useState<string>("");
  const [savingClientEmail, setSavingClientEmail] = useState(false);

  // Recurrence state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<"daily" | "weekly" | "monthly" | "custom">("weekly");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>("");
  const [recurrenceCount, setRecurrenceCount] = useState<string>("");
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([]);
  const [recurrenceInterval, setRecurrenceInterval] = useState<string>("1");

  const [filterType, setFilterType] = useState<FilterType>("today");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [showAllEmployeesMeetings, setShowAllEmployeesMeetings] = useState<boolean>(false);

  // Meeting actions state
  const [viewingMeetingId, setViewingMeetingId] = useState<string | null>(null);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [deletingMeetingId, setDeletingMeetingId] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const isAdmin = userRole === "admin";

  // Filter projects by selected client
  const filteredProjects = useMemo(() => {
    if (!clientId) return projects;
    return projects.filter((p) => p.clientId === clientId);
  }, [clientId, projects]);

  // Filter employees by product/service
  const filteredEmployees = useMemo(() => {
    if (productServiceFilter === "all") return employees;

    const [kind, name] = productServiceFilter.split(":");
    if (kind === "product") {
      return employees.filter((e) => e.assignedProduct === name);
    } else if (kind === "service") {
      return employees.filter((e) => e.assignedService === name);
    }
    return employees;
  }, [productServiceFilter, employees]);

  // Filter meetings based on selected filter and sort: ongoing first, then by start time
  const filteredMeetings = useMemo(() => {
    const now = new Date();
    let filtered: typeof meetings = meetings;

    if (filterType === "all") {
      filtered = meetings;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let startFilter: Date;
      let endFilter: Date;

      if (filterType === "today") {
        startFilter = new Date(today);
        endFilter = new Date(today);
        endFilter.setHours(23, 59, 59, 999);
      } else if (filterType === "tomorrow") {
        startFilter = new Date(today);
        startFilter.setDate(startFilter.getDate() + 1);
        endFilter = new Date(startFilter);
        endFilter.setHours(23, 59, 59, 999);
      } else if (filterType === "this_month") {
        startFilter = new Date(today.getFullYear(), today.getMonth(), 1);
        endFilter = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (filterType === "custom") {
        if (!customStartDate || !customEndDate) {
          filtered = meetings;
        } else {
          startFilter = new Date(customStartDate);
          startFilter.setHours(0, 0, 0, 0);
          endFilter = new Date(customEndDate);
          endFilter.setHours(23, 59, 59, 999);
          filtered = meetings.filter((m) => {
            const meetingStart = new Date(m.startTime);
            return meetingStart >= startFilter && meetingStart <= endFilter;
          });
        }
      } else {
        filtered = meetings;
      }

      if (filterType !== "custom" || (customStartDate && customEndDate)) {
        filtered = meetings.filter((m) => {
          const meetingStart = new Date(m.startTime);
          return meetingStart >= startFilter && meetingStart <= endFilter;
        });
      }
    }

    // Sort: ongoing meetings first, then by start time
    return filtered.sort((a, b) => {
      const now = new Date();
      const aStart = new Date(a.startTime);
      const aEnd = new Date(a.endTime);
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);

      const aIsOngoing = aStart <= now && aEnd >= now;
      const bIsOngoing = bStart <= now && bEnd >= now;

      // Ongoing meetings come first
      if (aIsOngoing && !bIsOngoing) return -1;
      if (!aIsOngoing && bIsOngoing) return 1;

      // Then sort by start time
      return aStart.getTime() - bStart.getTime();
    });
  }, [meetings, filterType, customStartDate, customEndDate]);

  useEffect(() => {
    if (searchParams?.get("connected") === "1") {
      setSuccess("Connected to Google Calendar. New meetings will be pushed automatically.");
      setIsConnected(true);
      // Refresh to get updated connection status
      refreshConnectionStatus();
    }
  }, [searchParams]);

  async function refreshConnectionStatus() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        // We'll need to add googleCalendarEmail to the /api/auth/me endpoint
        // For now, we'll check via a separate call or use the prop values
      }
    } catch {
      // ignore
    }
  }

  async function handleDisconnectGoogle() {
    setDisconnectConfirmOpen(true);
  }

  async function confirmDisconnectGoogle() {
    try {
      setIsDisconnecting(true);
      setError(null);
      const res = await fetch("/api/integrations/google-calendar/disconnect", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setIsConnected(false);
        setConnectedEmail(null);
        const deletedCount = data.deletedCount || 0;
        setSuccess(`Google Calendar disconnected successfully. ${deletedCount} meeting(s) deleted.`);
        // Refresh meetings list to reflect deletions
        await refreshMeetings();
      } else {
        setError(data.message || "Failed to disconnect Google Calendar");
      }
    } catch {
      setError("Failed to disconnect Google Calendar");
    } finally {
      setIsDisconnecting(false);
      setDisconnectConfirmOpen(false);
    }
  }

  // Refresh meetings when showAllEmployeesMeetings toggle changes
  useEffect(() => {
    refreshMeetings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllEmployeesMeetings]);

  // Load client contact emails when client is selected
  useEffect(() => {
    if (!clientId) {
      setClientContactEmails([]);
      setSelectedClientEmails([]);
      return;
    }

    const client = clients.find((c) => c.id === clientId);
    if (client) {
      const emails = client.contactEmails || [];
      // Include primary email if available
      const allEmails = client.primaryEmail
        ? [client.primaryEmail, ...emails.filter(e => e !== client.primaryEmail)]
        : emails;
      setClientContactEmails(allEmails);
    } else {
      // Fetch from API if not in initial data
      async function loadClientContacts() {
        try {
          const res = await fetch(`/api/clients/${clientId}/contacts`);
          if (res.ok) {
            const data = await res.json();
            const allEmails = data.primaryEmail
              ? [data.primaryEmail, ...(data.contactEmails || []).filter((e: string) => e !== data.primaryEmail)]
              : (data.contactEmails || []);
            setClientContactEmails(allEmails);
          }
        } catch {
          // ignore
        }
      }
      loadClientContacts();
    }
  }, [clientId, clients]);

  async function refreshMeetings() {
    setLoading(true);
    setError(null);
    try {
      const url = showAllEmployeesMeetings && !isAdmin
        ? "/api/meetings?showAll=true"
        : "/api/meetings";
      const res = await fetch(url, {
        cache: "no-store",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load meetings");
        return;
      }
      setMeetings(
        (data.meetings || []).map((m: any) => ({
          ...m,
          startTime: m.startTime,
          endTime: m.endTime,
          meetingLink: normalizeMeetingLink(m.meetingLink),
        }))
      );
    } catch {
      setError("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateMeeting(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      if (!title || !projectId || !startTime || !endTime) {
        setError("Please fill title, project, start time and end time");
        setSubmitting(false);
        return;
      }

      // Validate that end time is after start time (using local time parsing)
      if (!startTime.includes("T") || !endTime.includes("T")) {
        setError("Please select valid start and end times");
        setSubmitting(false);
        return;
      }

      const [startDate, startTimePart] = startTime.split("T");
      const [endDate, endTimePart] = endTime.split("T");

      // Compare dates and times
      let isValid = false;
      if (endDate > startDate) {
        isValid = true;
      } else if (endDate === startDate) {
        const [startHours, startMins] = startTimePart.split(":").map(Number);
        const [endHours, endMins] = endTimePart.split(":").map(Number);
        const startTotalMins = startHours * 60 + startMins;
        const endTotalMins = endHours * 60 + endMins;
        isValid = endTotalMins > startTotalMins;
      }

      if (!isValid) {
        setError("End time must be after start time");
        setSubmitting(false);
        return;
      }

      // Validate recurrence settings
      if (isRecurring) {
        if (recurrenceType === "weekly" && selectedDaysOfWeek.length === 0) {
          setError("Please select at least one day for weekly recurrence");
          setSubmitting(false);
          return;
        }
        if (!recurrenceEndDate && !recurrenceCount) {
          setError("Please specify either an end date or number of occurrences");
          setSubmitting(false);
          return;
        }
        if (recurrenceEndDate && recurrenceEndDate < startDate) {
          setError("Recurrence end date must be after start date");
          setSubmitting(false);
          return;
        }
      }

      // Get attendee emails from selected employees and client contacts
      const employeeEmails = selectedEmployeeIds
        .map((id) => filteredEmployees.find((e) => e.id === id)?.email)
        .filter(Boolean) as string[];

      const allAttendeeEmails = [...employeeEmails, ...selectedClientEmails].filter(
        (email, index, arr) => arr.indexOf(email) === index // Remove duplicates
      );

      // Prepare recurrence data
      const recurrenceData: any = {};
      if (isRecurring) {
        recurrenceData.isRecurring = true;
        recurrenceData.recurrenceType = recurrenceType;
        recurrenceData.recurrenceInterval = parseInt(recurrenceInterval) || 1;

        if (recurrenceEndDate) {
          recurrenceData.recurrenceEndDate = recurrenceEndDate;
        } else if (recurrenceCount) {
          recurrenceData.recurrenceCount = parseInt(recurrenceCount);
        }

        if (recurrenceType === "weekly" && selectedDaysOfWeek.length > 0) {
          recurrenceData.recurrenceDaysOfWeek = selectedDaysOfWeek;
        } else if (recurrenceType === "monthly" && startTime) {
          const startDate = new Date(startTime);
          recurrenceData.recurrenceDayOfMonth = startDate.getDate();
        }
      }

      const url = editingMeetingId ? `/api/meetings/${editingMeetingId}` : "/api/meetings";
      const method = editingMeetingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          projectId,
          startTime,
          endTime,
          attendees: allAttendeeEmails,
          ...recurrenceData,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || (editingMeetingId ? "Failed to update meeting" : "Failed to create meeting"));
        setSubmitting(false);
        return;
      }

      if (editingMeetingId) {
        // Update existing meeting in list
        setMeetings((prev) =>
          prev.map((m) =>
            m.id === editingMeetingId
              ? {
                ...m,
                ...data.meeting,
                projectName:
                  projects.find((p) => p.id === data.meeting.projectId)?.name || m.projectName,
              }
              : m
          )
        );
        setSuccess("Meeting updated successfully");
      } else {
        // Add new meeting to list
        const created = data.meeting as MeetingItem;
        setMeetings((prev) => [
          {
            ...created,
            projectName:
              projects.find((p) => p.id === created.projectId)?.name || "Unknown project",
            createdByName: userEmail.split("@")[0],
            createdByEmail: userEmail,
          },
          ...prev,
        ]);
        setSuccess("Meeting booked successfully");
      }

      setTitle("");
      setDescription("");
      setClientId("");
      setProjectId("");
      setStartTime("");
      setEndTime("");
      setSelectedEmployeeIds([]);
      setSelectedClientEmails([]);
      setIsRecurring(false);
      setRecurrenceType("weekly");
      setRecurrenceEndDate("");
      setRecurrenceCount("");
      setSelectedDaysOfWeek([]);
      setRecurrenceInterval("1");
      setEditingMeetingId(null);
      setDialogOpen(false);
      setSubmitting(false);
    } catch {
      setError("Failed to create meeting");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEmployeeToggle(employeeId: string) {
    setSelectedEmployeeIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  }

  function handleClientEmailToggle(email: string) {
    setSelectedClientEmails((prev) =>
      prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email]
    );
  }

  async function handleAddClientEmail() {
    if (!clientId || !newClientEmail.trim()) return;

    const email = newClientEmail.trim().toLowerCase();
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (clientContactEmails.includes(email)) {
      setError("This email is already saved");
      setNewClientEmail("");
      return;
    }

    setSavingClientEmail(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: [email] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to save email");
        return;
      }
      setClientContactEmails((prev) => [...prev, email]);
      setSelectedClientEmails((prev) => [...prev, email]);
      setNewClientEmail("");
      setSuccess("Email saved for future use");
    } catch {
      setError("Failed to save email");
    } finally {
      setSavingClientEmail(false);
    }
  }

  function formatDateTime(value: string | Date) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handleConnectGoogle() {
    window.location.href = "/api/integrations/google-calendar/connect";
  }

  async function handleSyncGoogleCalendar() {
    setSyncing(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/integrations/google-calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to sync Google Calendar");
        return;
      }
      setSuccess(
        `Sync completed: ${data.synced} new, ${data.updated} updated, ${data.skipped} skipped`
      );
      // Refresh meetings list
      await refreshMeetings();
    } catch {
      setError("Failed to sync Google Calendar");
    } finally {
      setSyncing(false);
    }
  }

  // Load meeting data for editing
  useEffect(() => {
    if (editingMeetingId) {
      const meeting = meetings.find((m) => m.id === editingMeetingId);
      if (meeting) {
        const start = new Date(meeting.startTime);
        const end = new Date(meeting.endTime);

        setTitle(meeting.title);
        setDescription(meeting.description || "");
        setProjectId(meeting.projectId);
        // Find client from project
        const project = projects.find((p) => p.id === meeting.projectId);
        if (project) {
          setClientId(project.clientId);
        }
        setStartTime(start.toISOString().slice(0, 16));
        setEndTime(end.toISOString().slice(0, 16));

        // Set attendees
        const attendeeIds: string[] = [];
        if (meeting.attendees) {
          meeting.attendees.forEach((email) => {
            const employee = employees.find((e) => e.email === email);
            if (employee) {
              attendeeIds.push(employee.id);
            }
          });
        }
        setSelectedEmployeeIds(attendeeIds);

        setDialogOpen(true);
      }
    }
  }, [editingMeetingId, meetings, projects, employees]);

  return (
    <div className="space-y-8">
      <MeetingReminder meetings={meetings} userEmail={userEmail} />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Book meetings linked to projects, see upcoming meetings, and connect your own Google Calendar.
          </p>
          {isConnected && connectedEmail && (
            <p className="text-xs text-muted-foreground mt-1">
              Connected to: <span className="font-medium text-foreground">{connectedEmail}</span>
            </p>
          )}
        </div>
        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="text-xs text-muted-foreground">
            Signed in as <span className="font-medium">{userEmail}</span> ({userRole})
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-black text-black hover:bg-black hover:text-white"
                  onClick={handleSyncGoogleCalendar}
                  disabled={syncing || loading}
                >
                  {syncing ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="h-4 w-4" />
                      Sync from Google Calendar
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600 dark:hover:bg-red-950"
                  onClick={handleDisconnectGoogle}
                  disabled={loading || syncing}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      Disconnect
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-black text-black hover:bg-black hover:text-white"
                onClick={handleConnectGoogle}
              >
                <CalendarIcon className="h-4 w-4" />
                Connect Google Calendar
              </Button>
            )}
            <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-muted-foreground/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("calendar")}
                className={cn(
                  "h-8 px-3 rounded-lg gap-2 text-xs font-medium transition-all",
                  viewMode === "calendar"
                    ? "bg-white dark:bg-zinc-900 shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Calendar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={cn(
                  "h-8 px-3 rounded-lg gap-2 text-xs font-medium transition-all",
                  viewMode === "list"
                    ? "bg-white dark:bg-zinc-900 shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                )}
              >
                <List className="h-3.5 w-3.5" />
                List
              </Button>
            </div>

            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) {
                  // Reset form when dialog closes
                  setTitle("");
                  setDescription("");
                  setClientId("");
                  setProjectId("");
                  setStartTime("");
                  setEndTime("");
                  setSelectedEmployeeIds([]);
                  setSelectedClientEmails([]);
                  setNewClientEmail("");
                  setIsRecurring(false);
                  setRecurrenceType("weekly");
                  setRecurrenceEndDate("");
                  setRecurrenceCount("");
                  setSelectedDaysOfWeek([]);
                  setRecurrenceInterval("1");
                  setError(null);
                  setSuccess(null);
                  setEditingMeetingId(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  className="bg-black text-white hover:bg-neutral-900 rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Book a meeting
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingMeetingId ? "Edit meeting" : "Book a meeting"}</DialogTitle>
                  <DialogDescription>
                    {editingMeetingId
                      ? "Update meeting details. Changes will sync to Google Calendar if connected."
                      : "Link meetings with a project and invite team members. If Google Calendar is connected, new meetings will also be created there."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateMeeting} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Project kickoff, sprint review, etc."
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Client <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={clientId}
                        onValueChange={(value) => {
                          setClientId(value);
                          setProjectId(""); // Reset project when client changes
                          setSelectedClientEmails([]); // Reset selected client emails
                          setNewClientEmail(""); // Reset new email input
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.companyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Project <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={projectId}
                      onValueChange={setProjectId}
                      required
                      disabled={!clientId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={clientId ? "Select project" : "Select client first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredProjects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Client contact emails section */}
                  {clientId && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Client contacts (optional)
                      </Label>
                      <div className="border rounded-md p-3 space-y-3">
                        {/* Saved emails */}
                        {clientContactEmails.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-[10px] font-medium text-muted-foreground uppercase">
                              Saved contacts
                            </Label>
                            <div className="flex flex-wrap gap-2">
                              {clientContactEmails.map((email) => (
                                <div
                                  key={email}
                                  className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-md"
                                >
                                  <Checkbox
                                    id={`client-email-${email}`}
                                    checked={selectedClientEmails.includes(email)}
                                    onCheckedChange={() => handleClientEmailToggle(email)}
                                  />
                                  <Label
                                    htmlFor={`client-email-${email}`}
                                    className="text-xs font-normal cursor-pointer"
                                  >
                                    {email}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Add new email */}
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-medium text-muted-foreground uppercase">
                            Add new contact email
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              type="email"
                              value={newClientEmail}
                              onChange={(e) => setNewClientEmail(e.target.value)}
                              placeholder="contact@client.com"
                              className="flex-1 text-xs"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddClientEmail();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAddClientEmail}
                              disabled={savingClientEmail || !newClientEmail.trim()}
                              className="text-xs"
                            >
                              {savingClientEmail ? "Saving..." : "Add & Save"}
                            </Button>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Add email addresses that will be saved for future meetings with this client
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Date & Time <span className="text-red-500">*</span>
                      </Label>

                      {/* Quick date buttons */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            const now = new Date();
                            now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15); // Round to next 15 min
                            const end = new Date(now);
                            end.setHours(end.getHours() + 1);
                            setStartTime(now.toISOString().slice(0, 16));
                            setEndTime(end.toISOString().slice(0, 16));
                          }}
                        >
                          Now + 1h
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            tomorrow.setHours(9, 0, 0, 0);
                            const end = new Date(tomorrow);
                            end.setHours(10, 0, 0, 0);
                            setStartTime(tomorrow.toISOString().slice(0, 16));
                            setEndTime(end.toISOString().slice(0, 16));
                          }}
                        >
                          Tomorrow 9 AM
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            const nextMonday = new Date();
                            const daysUntilMonday = (8 - nextMonday.getDay()) % 7 || 7;
                            nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
                            nextMonday.setHours(10, 0, 0, 0);
                            const end = new Date(nextMonday);
                            end.setHours(11, 0, 0, 0);
                            setStartTime(nextMonday.toISOString().slice(0, 16));
                            setEndTime(end.toISOString().slice(0, 16));
                          }}
                        >
                          Next Monday 10 AM
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground">
                            Start <span className="text-red-500">*</span>
                          </Label>
                          <div className="space-y-2">
                            <Input
                              type="date"
                              value={startTime ? startTime.split("T")[0] : ""}
                              onChange={(e) => {
                                const date = e.target.value;
                                const time = startTime && startTime.includes("T") ? startTime.split("T")[1] : "09:00";
                                setStartTime(`${date}T${time}`);
                                // Auto-update end date if it's before start date
                                if (endTime && endTime.includes("T")) {
                                  const endDate = endTime.split("T")[0];
                                  const endTimePart = endTime.split("T")[1];
                                  if (endDate < date) {
                                    // Keep same time, just update date
                                    setEndTime(`${date}T${endTimePart}`);
                                  } else if (endDate === date) {
                                    // Same date - ensure end time is after start time
                                    const start = new Date(`${date}T${time}`);
                                    const end = new Date(`${date}T${endTimePart}`);
                                    if (end <= start) {
                                      const newEnd = new Date(start);
                                      newEnd.setHours(newEnd.getHours() + 1);
                                      setEndTime(newEnd.toISOString().slice(0, 16));
                                    }
                                  }
                                } else if (!endTime) {
                                  // Set default end time 1 hour after start
                                  const start = new Date(`${date}T${time}`);
                                  const end = new Date(start);
                                  end.setHours(end.getHours() + 1);
                                  setEndTime(end.toISOString().slice(0, 16));
                                }
                              }}
                              required
                              className="w-full"
                            />
                            <Input
                              type="time"
                              value={startTime && startTime.includes("T") ? startTime.split("T")[1] : ""}
                              onChange={(e) => {
                                const time = e.target.value;
                                const date = startTime && startTime.includes("T") ? startTime.split("T")[0] : new Date().toISOString().split("T")[0];
                                setStartTime(`${date}T${time}`);
                                // Auto-adjust end time if needed
                                if (endTime && endTime.includes("T")) {
                                  const start = new Date(`${date}T${time}`);
                                  const end = new Date(endTime);
                                  if (end <= start) {
                                    const newEnd = new Date(start);
                                    newEnd.setHours(newEnd.getHours() + 1);
                                    setEndTime(newEnd.toISOString().slice(0, 16));
                                  }
                                } else if (!endTime) {
                                  // Set default end time 1 hour after start
                                  const start = new Date(`${date}T${time}`);
                                  const end = new Date(start);
                                  end.setHours(end.getHours() + 1);
                                  setEndTime(end.toISOString().slice(0, 16));
                                }
                              }}
                              required
                              className="w-full"
                            />
                          </div>
                          {/* Quick time slots */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map((slot) => (
                              <Button
                                key={slot}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-[10px] h-7 px-2"
                                onClick={() => {
                                  const date = startTime && startTime.includes("T") ? startTime.split("T")[0] : new Date().toISOString().split("T")[0];
                                  setStartTime(`${date}T${slot}`);
                                  // Auto-set end time 1 hour later
                                  const [hours, minutes] = slot.split(":").map(Number);
                                  const endDate = new Date(`${date}T${slot}`);
                                  endDate.setHours(hours + 1, minutes);
                                  setEndTime(endDate.toISOString().slice(0, 16));
                                }}
                              >
                                {slot}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground">
                            End <span className="text-red-500">*</span>
                          </Label>
                          <div className="space-y-2">
                            <Input
                              type="date"
                              value={endTime && endTime.includes("T") ? endTime.split("T")[0] : ""}
                              onChange={(e) => {
                                const date = e.target.value;
                                const time = endTime && endTime.includes("T") ? endTime.split("T")[1] : "10:00";
                                setEndTime(`${date}T${time}`);
                                // Validate that end is after start
                                if (startTime && startTime.includes("T")) {
                                  const start = new Date(startTime);
                                  const end = new Date(`${date}T${time}`);
                                  if (end <= start) {
                                    // Auto-adjust to 1 hour after start
                                    const newEnd = new Date(start);
                                    newEnd.setHours(newEnd.getHours() + 1);
                                    setEndTime(newEnd.toISOString().slice(0, 16));
                                  }
                                }
                              }}
                              required
                              className="w-full"
                            />
                            <Input
                              type="time"
                              value={endTime && endTime.includes("T") ? endTime.split("T")[1] : ""}
                              onChange={(e) => {
                                const time = e.target.value;
                                const date = endTime && endTime.includes("T") ? endTime.split("T")[0] : (startTime && startTime.includes("T") ? startTime.split("T")[0] : new Date().toISOString().split("T")[0]);
                                setEndTime(`${date}T${time}`);
                                // Validate that end is after start
                                if (startTime && startTime.includes("T")) {
                                  const start = new Date(startTime);
                                  const end = new Date(`${date}T${time}`);
                                  if (end <= start) {
                                    // Auto-adjust to 1 hour after start
                                    const newEnd = new Date(start);
                                    newEnd.setHours(newEnd.getHours() + 1);
                                    setEndTime(newEnd.toISOString().slice(0, 16));
                                  }
                                }
                              }}
                              required
                              className="w-full"
                            />
                          </div>
                          {/* Duration presets */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {[
                              { label: "30m", minutes: 30 },
                              { label: "1h", minutes: 60 },
                              { label: "2h", minutes: 120 },
                              { label: "3h", minutes: 180 },
                            ].map((preset) => (
                              <Button
                                key={preset.label}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-[10px] h-7 px-2"
                                onClick={() => {
                                  if (!startTime || !startTime.includes("T")) return;

                                  // Parse start time properly (local time, not UTC)
                                  const [startDate, startTimePart] = startTime.split("T");
                                  const [startHours, startMins] = startTimePart.split(":").map(Number);

                                  // Create end time by adding minutes
                                  const startTotalMins = startHours * 60 + startMins;
                                  const endTotalMins = startTotalMins + preset.minutes;
                                  const endHours = Math.floor(endTotalMins / 60);
                                  const endMins = endTotalMins % 60;

                                  // Format end time
                                  const endTimeFormatted = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
                                  setEndTime(`${startDate}T${endTimeFormatted}`);
                                }}
                                disabled={!startTime || !startTime.includes("T")}
                              >
                                {preset.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Duration display */}
                      {startTime && endTime && startTime.includes("T") && endTime.includes("T") && (() => {
                        // Parse dates as local time strings (YYYY-MM-DDTHH:mm format)
                        const [startDate, startTimePart] = startTime.split("T");
                        const [endDate, endTimePart] = endTime.split("T");

                        // Compare dates first, then times
                        let isValid = true;
                        let diffMins = 0;

                        if (endDate < startDate) {
                          isValid = false;
                        } else if (endDate === startDate) {
                          // Same date, compare times
                          const [startHours, startMins] = startTimePart.split(":").map(Number);
                          const [endHours, endMins] = endTimePart.split(":").map(Number);
                          const startTotalMins = startHours * 60 + startMins;
                          const endTotalMins = endHours * 60 + endMins;
                          diffMins = endTotalMins - startTotalMins;
                          isValid = diffMins > 0;
                        } else {
                          // End date is after start date, calculate full difference
                          const start = new Date(`${startDate}T${startTimePart}`);
                          const end = new Date(`${endDate}T${endTimePart}`);
                          diffMins = Math.floor((end.getTime() - start.getTime()) / 60000);
                          isValid = diffMins > 0;
                        }

                        const hours = Math.floor(Math.abs(diffMins) / 60);
                        const mins = Math.abs(diffMins) % 60;

                        let durationText = "";
                        if (!isValid) {
                          durationText = "⚠️ Invalid (end must be after start)";
                        } else if (hours === 0) {
                          durationText = `${mins} minutes`;
                        } else if (mins === 0) {
                          durationText = `${hours} hour${hours > 1 ? "s" : ""}`;
                        } else {
                          durationText = `${hours}h ${mins}m`;
                        }

                        return (
                          <div className={`mt-2 p-2 rounded-md ${isValid ? "bg-muted/50" : "bg-red-50 border border-red-200"}`}>
                            <div className="flex items-center justify-between text-xs">
                              <span className={isValid ? "text-muted-foreground" : "text-red-600"}>
                                Duration:
                              </span>
                              <span className={`font-medium ${isValid ? "" : "text-red-600"}`}>
                                {durationText}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Recurrence section */}
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recurring-checkbox"
                        checked={isRecurring}
                        onCheckedChange={(checked) => {
                          setIsRecurring(checked === true);
                          if (!checked) {
                            setRecurrenceType("weekly");
                            setRecurrenceEndDate("");
                            setRecurrenceCount("");
                            setSelectedDaysOfWeek([]);
                            setRecurrenceInterval("1");
                          }
                        }}
                      />
                      <Label htmlFor="recurring-checkbox" className="text-xs font-medium text-muted-foreground cursor-pointer">
                        Make this a recurring meeting
                      </Label>
                    </div>

                    {isRecurring && (
                      <div className="space-y-3 pl-6 border-l-2 border-muted">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">
                              Repeat
                            </Label>
                            <Select value={recurrenceType} onValueChange={(v: any) => setRecurrenceType(v)}>
                              <SelectTrigger className="text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">
                              Every
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                value={recurrenceInterval}
                                onChange={(e) => setRecurrenceInterval(e.target.value)}
                                className="w-20 text-xs"
                                disabled={recurrenceType === "custom"}
                              />
                              <span className="text-xs text-muted-foreground">
                                {recurrenceType === "daily" ? "day(s)" : recurrenceType === "weekly" ? "week(s)" : "month(s)"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Weekly: Days of week */}
                        {recurrenceType === "weekly" && (
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">
                              Repeat on
                            </Label>
                            {/* Quick select buttons */}
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant={
                                  selectedDaysOfWeek.length === 5 &&
                                    [1, 2, 3, 4, 5].every((d) => selectedDaysOfWeek.includes(d))
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="text-xs h-8 px-3"
                                onClick={() => {
                                  const weekdays = [1, 2, 3, 4, 5]; // Mon-Fri
                                  const allWeekdaysSelected = weekdays.every((d) =>
                                    selectedDaysOfWeek.includes(d)
                                  );
                                  if (allWeekdaysSelected) {
                                    // Deselect all weekdays
                                    setSelectedDaysOfWeek((prev) =>
                                      prev.filter((d) => !weekdays.includes(d))
                                    );
                                  } else {
                                    // Select all weekdays (keep weekends if selected)
                                    setSelectedDaysOfWeek((prev) => {
                                      const weekends = prev.filter((d) => d === 0 || d === 6);
                                      return [...weekends, ...weekdays];
                                    });
                                  }
                                }}
                              >
                                Weekdays
                              </Button>
                              <Button
                                type="button"
                                variant={
                                  [0, 6].every((d) => selectedDaysOfWeek.includes(d)) &&
                                    selectedDaysOfWeek.length === 2
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="text-xs h-8 px-3"
                                onClick={() => {
                                  const weekends = [0, 6]; // Sat-Sun
                                  const allWeekendsSelected = weekends.every((d) =>
                                    selectedDaysOfWeek.includes(d)
                                  );
                                  if (allWeekendsSelected) {
                                    // Deselect all weekends
                                    setSelectedDaysOfWeek((prev) =>
                                      prev.filter((d) => !weekends.includes(d))
                                    );
                                  } else {
                                    // Select all weekends (keep weekdays if selected)
                                    setSelectedDaysOfWeek((prev) => {
                                      const weekdays = prev.filter((d) => d >= 1 && d <= 5);
                                      return [...weekdays, ...weekends];
                                    });
                                  }
                                }}
                              >
                                Weekend
                              </Button>
                            </div>
                            {/* Individual day buttons */}
                            <div className="flex flex-wrap gap-2">
                              {[
                                { value: 0, label: "Sun" },
                                { value: 1, label: "Mon" },
                                { value: 2, label: "Tue" },
                                { value: 3, label: "Wed" },
                                { value: 4, label: "Thu" },
                                { value: 5, label: "Fri" },
                                { value: 6, label: "Sat" },
                              ].map((day) => (
                                <Button
                                  key={day.value}
                                  type="button"
                                  variant={selectedDaysOfWeek.includes(day.value) ? "default" : "outline"}
                                  size="sm"
                                  className="text-xs h-8 px-3"
                                  onClick={() => {
                                    setSelectedDaysOfWeek((prev) =>
                                      prev.includes(day.value)
                                        ? prev.filter((d) => d !== day.value)
                                        : [...prev, day.value]
                                    );
                                  }}
                                >
                                  {day.label}
                                </Button>
                              ))}
                            </div>
                            {selectedDaysOfWeek.length === 0 && (
                              <p className="text-xs text-amber-600 mt-1">Select at least one day</p>
                            )}
                          </div>
                        )}

                        {/* Monthly: Day of month */}
                        {recurrenceType === "monthly" && (
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">
                              Day of month
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              max="31"
                              value={startTime ? (() => {
                                const date = new Date(startTime);
                                return date.getDate();
                              })() : ""}
                              onChange={(e) => {
                                const day = parseInt(e.target.value);
                                if (day >= 1 && day <= 31 && startTime) {
                                  const [datePart] = startTime.split("T");
                                  const newDate = new Date(datePart);
                                  newDate.setDate(day);
                                  setStartTime(`${newDate.toISOString().split("T")[0]}T${startTime.split("T")[1]}`);
                                }
                              }}
                              className="w-32 text-xs"
                            />
                          </div>
                        )}

                        {/* End options */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">
                              End date
                            </Label>
                            <Input
                              type="date"
                              value={recurrenceEndDate}
                              onChange={(e) => {
                                setRecurrenceEndDate(e.target.value);
                                setRecurrenceCount(""); // Clear count when setting end date
                              }}
                              min={startTime ? startTime.split("T")[0] : ""}
                              className="text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">
                              Or after
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                value={recurrenceCount}
                                onChange={(e) => {
                                  setRecurrenceCount(e.target.value);
                                  setRecurrenceEndDate(""); // Clear end date when setting count
                                }}
                                className="w-24 text-xs"
                              />
                              <span className="text-xs text-muted-foreground">occurrences</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Team members
                      </Label>
                      <Select
                        value={productServiceFilter}
                        onValueChange={setProductServiceFilter}
                      >
                        <SelectTrigger className="w-[200px] h-7 text-xs">
                          <SelectValue placeholder="Filter by product/service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All team members</SelectItem>
                          {products.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase">
                                Products
                              </div>
                              {products.map((p) => (
                                <SelectItem key={`product:${p.name}`} value={`product:${p.name}`}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </>
                          )}
                          {services.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase">
                                Services
                              </div>
                              {services.map((s) => (
                                <SelectItem key={`service:${s.name}`} value={`service:${s.name}`}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                      {filteredEmployees.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          {productServiceFilter === "all"
                            ? "No team members available"
                            : "No team members found for selected filter"}
                        </p>
                      ) : (
                        filteredEmployees.map((emp) => (
                          <div key={emp.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`employee-${emp.id}`}
                              checked={selectedEmployeeIds.includes(emp.id)}
                              onCheckedChange={() => handleEmployeeToggle(emp.id)}
                            />
                            <Label
                              htmlFor={`employee-${emp.id}`}
                              className="text-sm font-normal cursor-pointer flex-1"
                            >
                              {emp.name} ({emp.email})
                              {(emp.assignedProduct || emp.assignedService) && (
                                <span className="text-[10px] text-muted-foreground ml-1">
                                  · {emp.assignedProduct || emp.assignedService}
                                </span>
                              )}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Description (optional)
                    </Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Agenda, meeting link, notes..."
                    />
                  </div>

                  {error && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
                      {success}
                    </div>
                  )}

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting
                        ? editingMeetingId
                          ? "Updating..."
                          : "Booking..."
                        : editingMeetingId
                          ? "Update meeting"
                          : "Book meeting"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <Card className="border bg-background/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <div>
              <CardTitle className="text-base font-semibold">
                {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  const newDate = new Date(currentMonth);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setCurrentMonth(newDate);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  const newDate = new Date(currentMonth);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setCurrentMonth(newDate);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-muted overflow-hidden rounded-lg border">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="bg-muted/50 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {day}
                </div>
              ))}
              {(() => {
                const year = currentMonth.getFullYear();
                const month = currentMonth.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const prevMonthDays = new Date(year, month, 0).getDate();

                const days = [];
                // Prev month days
                for (let i = firstDay - 1; i >= 0; i--) {
                  days.push({ day: prevMonthDays - i, current: false, date: new Date(year, month - 1, prevMonthDays - i) });
                }
                // Current month days
                for (let i = 1; i <= daysInMonth; i++) {
                  days.push({ day: i, current: true, date: new Date(year, month, i) });
                }
                // Next month days
                const totalCells = 42;
                const nextDays = totalCells - days.length;
                for (let i = 1; i <= nextDays; i++) {
                  days.push({ day: i, current: false, date: new Date(year, month + 1, i) });
                }

                return days.map((d, i) => {
                  const dayMeetings = meetings.filter(m => {
                    const mDate = new Date(m.startTime);
                    return mDate.getDate() === d.day && mDate.getMonth() === d.date.getMonth() && mDate.getFullYear() === d.date.getFullYear();
                  });

                  const isToday = new Date().toDateString() === d.date.toDateString();

                  return (
                    <div
                      key={i}
                      className={cn(
                        "min-h-[100px] bg-background p-2 transition-colors hover:bg-muted/30",
                        !d.current && "bg-muted/20 text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                          "text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full",
                          isToday && "bg-primary text-primary-foreground font-bold"
                        )}>
                          {d.day}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {dayMeetings.slice(0, 3).map(m => (
                          <div
                            key={m.id}
                            onClick={() => setViewingMeetingId(m.id)}
                            className="truncate text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 cursor-pointer border border-blue-200/50 dark:border-blue-800/50 hover:scale-[1.02] transition-transform"
                            title={m.title}
                          >
                            {new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} {m.title}
                          </div>
                        ))}
                        {dayMeetings.length > 3 && (
                          <div className="text-[9px] text-muted-foreground pl-1 font-medium">
                            + {dayMeetings.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border bg-background/40">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-base">All meetings</CardTitle>
                <CardDescription className="text-xs">
                  Meetings are linked with projects and show who created them.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!isAdmin && (
                  <div className="flex items-center space-x-2 mr-2">
                    <Checkbox
                      id="show-all-employees"
                      checked={showAllEmployeesMeetings}
                      onCheckedChange={(checked) => {
                        setShowAllEmployeesMeetings(checked === true);
                      }}
                    />
                    <Label
                      htmlFor="show-all-employees"
                      className="text-xs cursor-pointer"
                    >
                      Show all employees' meetings
                    </Label>
                  </div>
                )}
                <Button
                  type="button"
                  variant={filterType === "today" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("today")}
                >
                  Today
                </Button>
                <Button
                  type="button"
                  variant={filterType === "tomorrow" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("tomorrow")}
                >
                  Tomorrow
                </Button>
                <Button
                  type="button"
                  variant={filterType === "this_month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("this_month")}
                >
                  This month
                </Button>
                <Button
                  type="button"
                  variant={filterType === "custom" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("custom")}
                >
                  Custom
                </Button>
                <Button
                  type="button"
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={refreshMeetings}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
            </div>
            {filterType === "custom" && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">From:</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-auto"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">To:</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-auto"
                  />
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredMeetings.length === 0 && !loading ? (
              <div className="text-center text-xs text-muted-foreground py-8">
                {meetings.length === 0
                  ? "No meetings yet. Create one to get started."
                  : `No meetings found for the selected filter.`}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMeetings.map((m) => {
                  const startDate = new Date(m.startTime);
                  const endDate = new Date(m.endTime);
                  const isSameDay = startDate.toDateString() === endDate.toDateString();
                  const now = new Date();
                  const isOngoing = startDate <= now && endDate >= now;

                  // Get meeting link - prioritize meetingLink
                  const meetingLink = normalizeMeetingLink(m.meetingLink) || m.meetingLink;
                  const hasDirectLink = Boolean(meetingLink);
                  const hasGoogleCalendarId = Boolean(m.googleCalendarEventId);
                  const canJoinMeeting = hasDirectLink || hasGoogleCalendarId;

                  const MeetingCardContent = (
                    <div className={`flex items-start justify-between gap-4 border rounded-lg p-4 transition-colors ${isOngoing
                      ? "bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900"
                      : "hover:bg-muted/50"
                      }`}>
                      <div className="flex items-start justify-between gap-4 flex-1">
                        {/* Left side: Title, Time, Link */}
                        <div className="flex-1 space-y-2">
                          {/* Title */}
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold">{m.title}</h3>
                            {isOngoing && (
                              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded-full animate-pulse">
                                LIVE
                              </span>
                            )}
                            {m.isRecurring && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded-md">
                                <Repeat className="h-3 w-3" />
                                {m.recurrenceType === "daily" ? "Daily" : m.recurrenceType === "weekly" ? "Weekly" : m.recurrenceType === "monthly" ? "Monthly" : "Recurring"}
                              </span>
                            )}
                          </div>

                          {/* Time */}
                          <div className="flex flex-col text-xs text-muted-foreground">
                            <span>
                              {isSameDay
                                ? `${startDate.toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}, ${startDate.toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}`
                                : formatDateTime(m.startTime)}
                            </span>
                            <span>
                              to{" "}
                              {isSameDay
                                ? endDate.toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })
                                : formatDateTime(m.endTime)}
                            </span>
                          </div>

                          {/* Link */}
                          {hasDirectLink ? (
                            <div className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                              <LinkIcon className="h-3 w-3" />
                              Join the meeting now
                            </div>
                          ) : null}

                          {/* Additional info */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            {m.projectName && (
                              <span className="font-medium">{m.projectName}</span>
                            )}
                            {m.createdByName && (
                              <span>
                                {m.createdByEmail === userEmail ? "You" : m.createdByName}
                              </span>
                            )}
                            {m.attendees && m.attendees.length > 0 && (
                              <span>{m.attendees.length} attendee{m.attendees.length !== 1 ? "s" : ""}</span>
                            )}
                          </div>
                        </div>

                        {/* Right side: Actions */}
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {canJoinMeeting && (
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white"
                              disabled={loading}
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                if (hasDirectLink && meetingLink) {
                                  // Direct link available, open it
                                  const link = normalizeMeetingLink(meetingLink) || meetingLink;
                                  if (link) {
                                    window.open(link, '_blank', 'noopener,noreferrer');
                                  } else {
                                    setError("Invalid meeting link.");
                                  }
                                } else if (hasGoogleCalendarId) {
                                  // Try to fetch Meet link, but if it fails, redirect to Google Calendar
                                  try {
                                    setLoading(true);
                                    setError(null);
                                    const res = await fetch(`/api/meetings/${m.id}/meet-link`);
                                    const data = await res.json();

                                    if (data.meetingLink) {
                                      const normalizedLink = normalizeMeetingLink(data.meetingLink) || data.meetingLink;
                                      // Update the meeting in state
                                      setMeetings((prev) =>
                                        prev.map((meeting) =>
                                          meeting.id === m.id
                                            ? { ...meeting, meetingLink: normalizedLink }
                                            : meeting
                                        )
                                      );
                                      // Open the Meet link
                                      window.open(normalizedLink, '_blank', 'noopener,noreferrer');
                                    } else {
                                      // No Meet link found or error occurred, redirect to Google Calendar
                                      window.open('https://calendar.google.com/calendar/u/0/r/', '_blank', 'noopener,noreferrer');
                                    }
                                  } catch (err) {
                                    console.error("Failed to fetch meeting link:", err);
                                    // Fallback to Google Calendar on any error
                                    window.open('https://calendar.google.com/calendar/u/0/r/', '_blank', 'noopener,noreferrer');
                                  } finally {
                                    setLoading(false);
                                  }
                                }
                              }}
                            >
                              {loading ? (
                                <>
                                  <span className="animate-spin mr-1.5">⏳</span>
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <Video className="h-3.5 w-3.5 mr-1.5" />
                                  Join meeting
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 px-3"
                            onClick={() => setViewingMeetingId(m.id)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            View Details
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setEditingMeetingId(m.id)}
                                className="cursor-pointer"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeletingMeetingId(m.id)}
                                className="cursor-pointer text-red-600"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  // Handle reject action
                                  setError("Reject functionality coming soon");
                                }}
                                className="cursor-pointer text-orange-600"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  );

                  // Don't wrap entire card in link since we have explicit "Join meeting" button
                  return (
                    <div key={m.id}>
                      {MeetingCardContent}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* View Details Dialog */}
      <Dialog open={viewingMeetingId !== null} onOpenChange={(open) => !open && setViewingMeetingId(null)}>
        <DialogContent className="max-w-2xl">
          {viewingMeetingId && (() => {
            const meeting = meetings.find((m) => m.id === viewingMeetingId);
            if (!meeting) return null;

            const startDate = new Date(meeting.startTime);
            const endDate = new Date(meeting.endTime);
            const isSameDay = startDate.toDateString() === endDate.toDateString();

            return (
              <>
                <DialogHeader>
                  <DialogTitle>{meeting.title}</DialogTitle>
                  <DialogDescription>Meeting details</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {meeting.description && (
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Description</Label>
                      <p className="text-sm mt-1">{meeting.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Start Time</Label>
                      <p className="text-sm mt-1">{formatDateTime(meeting.startTime)}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">End Time</Label>
                      <p className="text-sm mt-1">{formatDateTime(meeting.endTime)}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Project</Label>
                      <p className="text-sm mt-1">{meeting.projectName || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Created By</Label>
                      <p className="text-sm mt-1">
                        {meeting.createdByName || meeting.createdByEmail || "—"}
                      </p>
                    </div>
                  </div>
                  {meeting.attendees && meeting.attendees.length > 0 && (
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Attendees</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {meeting.attendees.map((email, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs"
                          >
                            {email}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {meeting.meetingLink ? (
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Meeting Link</Label>
                      <a
                        href={normalizeMeetingLink(meeting.meetingLink) || meeting.meetingLink || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-1 font-medium"
                      >
                        <LinkIcon className="h-4 w-4" />
                        Join Meeting Now
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">
                        {normalizeMeetingLink(meeting.meetingLink) || meeting.meetingLink}
                      </p>
                    </div>
                  ) : null}
                </div>
                <DialogFooter>
                  {(meeting.meetingLink || meeting.googleCalendarEventId) && (
                    <Button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={loading}
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (meeting.meetingLink) {
                          // Direct link available, open it
                          const normalizedLink = normalizeMeetingLink(meeting.meetingLink) || meeting.meetingLink;
                          if (normalizedLink) {
                            window.open(normalizedLink, '_blank', 'noopener,noreferrer');
                          } else {
                            setError("Invalid meeting link.");
                          }
                        } else if (meeting.googleCalendarEventId) {
                          // Try to fetch Meet link, but if it fails, redirect to Google Calendar
                          try {
                            setLoading(true);
                            setError(null);
                            const res = await fetch(`/api/meetings/${meeting.id}/meet-link`);
                            const data = await res.json();

                            if (data.meetingLink) {
                              const normalizedLink = normalizeMeetingLink(data.meetingLink) || data.meetingLink;
                              // Update the meeting in state
                              setMeetings((prev) =>
                                prev.map((m) =>
                                  m.id === meeting.id
                                    ? { ...m, meetingLink: normalizedLink }
                                    : m
                                )
                              );
                              // Open the Meet link
                              window.open(normalizedLink, '_blank', 'noopener,noreferrer');
                            } else {
                              // No Meet link found or error occurred, redirect to Google Calendar
                              window.open('https://calendar.google.com/calendar/u/0/r/', '_blank', 'noopener,noreferrer');
                            }
                          } catch (err) {
                            console.error("Failed to fetch meeting link:", err);
                            // Fallback to Google Calendar on any error
                            window.open('https://calendar.google.com/calendar/u/0/r/', '_blank', 'noopener,noreferrer');
                          } finally {
                            setLoading(false);
                          }
                        }
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Loading...
                        </>
                      ) : (
                        <>
                          <Video className="h-4 w-4 mr-2" />
                          Join meeting
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setViewingMeetingId(null);
                      setEditingMeetingId(meeting.id);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button type="button" onClick={() => setViewingMeetingId(null)}>
                    Close
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Cancel/Delete Confirmation Dialog */}
      <Dialog open={deletingMeetingId !== null} onOpenChange={(open) => !open && setDeletingMeetingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Meeting</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this meeting? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingMeetingId && (() => {
            const meeting = meetings.find((m) => m.id === deletingMeetingId);
            return meeting ? (
              <div className="py-2">
                <p className="text-sm font-medium">{meeting.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDateTime(meeting.startTime)} - {formatDateTime(meeting.endTime)}
                </p>
              </div>
            ) : null;
          })()}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingMeetingId(null)}
            >
              Keep Meeting
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                if (!deletingMeetingId) return;
                try {
                  const res = await fetch(`/api/meetings/${deletingMeetingId}`, {
                    method: "DELETE",
                  });
                  if (!res.ok) {
                    const data = await res.json();
                    setError(data.message || "Failed to cancel meeting");
                    return;
                  }
                  setSuccess("Meeting cancelled successfully");
                  setDeletingMeetingId(null);
                  await refreshMeetings();
                } catch {
                  setError("Failed to cancel meeting");
                }
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={disconnectConfirmOpen}
        onOpenChange={setDisconnectConfirmOpen}
        title="Disconnect Google Calendar"
        description="Are you sure you want to disconnect Google Calendar? This will delete all your meetings from this dashboard. This action cannot be undone."
        onConfirm={confirmDisconnectGoogle}
        isLoading={isDisconnecting}
        confirmLabel="Disconnect"
      />
    </div>
  );
}

