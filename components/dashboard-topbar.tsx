"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, Check, Trash2, Loader2, Video, Calendar, Plus, Newspaper, FileTextIcon, FolderTree, Search, Eye, EyeOff, Activity, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { useSearch } from "@/components/search-context";
import { usePrivacy } from "@/components/privacy-context";
import { useSocket } from "@/components/socket-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type OngoingMeeting = {
  id: string;
  title: string;
  startTime: string | Date;
  endTime: string | Date;
  googleCalendarEventId: string | null;
  meetingLink?: string | null;
  projectName?: string;
};

// Normalize meeting links (especially Google Meet) for clean redirects
function normalizeMeetingLink(rawLink: string | null | undefined): string | null {
  if (!rawLink) return null;
  try {
    const url = new URL(rawLink);
    if (url.hostname.includes("meet.google.com")) {
      return `${url.origin}${url.pathname}`;
    }
    return rawLink;
  } catch {
    return rawLink;
  }
}

function formatTimeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

export function DashboardTopbar() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [syncingBusiness, setSyncingBusiness] = useState(false);
  const [ongoingMeeting, setOngoingMeeting] = useState<OngoingMeeting | null>(null);
  const [monitorCounts, setMonitorCounts] = useState<{ up: number; down: number; total: number }>({ up: 0, down: 0, total: 0 });
  const { socket } = useSocket();

  const fetchMonitorCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/monitors/status-counts");
      if (!res.ok) return;
      const data = await res.json();
      setMonitorCounts({ up: data.up ?? 0, down: data.down ?? 0, total: data.total ?? 0 });
    } catch {}
  }, []);

  useEffect(() => {
    fetchMonitorCounts();
    const interval = setInterval(fetchMonitorCounts, 60000);
    return () => clearInterval(interval);
  }, [fetchMonitorCounts]);

  useEffect(() => {
    if (!socket) return;
    const onMonitorUpdate = () => {
      fetchMonitorCounts();
    };
    socket.on("monitor-update", onMonitorUpdate);
    return () => {
      socket.off("monitor-update", onMonitorUpdate);
    };
  }, [socket, fetchMonitorCounts]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOngoingMeeting = useCallback(async () => {
    try {
      const now = new Date();
      // Fetch only current user's meetings (API already filters by user)
      const res = await fetch("/api/meetings");
      if (!res.ok) return;
      const data = await res.json();
      const meetings = data.meetings || [];

      // Find ongoing meeting (started but not ended) - only from user's own meetings
      const ongoing = meetings.find((m: any) => {
        const start = new Date(m.startTime);
        const end = new Date(m.endTime);
        return start <= now && end >= now;
      });

      if (ongoing) {
        let meetingLink = normalizeMeetingLink(ongoing.meetingLink);

        // If no meetingLink but has googleCalendarEventId, try to fetch it
        if (!meetingLink && ongoing.googleCalendarEventId) {
          try {
            const linkRes = await fetch(`/api/meetings/${ongoing.id}/meet-link`);
            if (linkRes.ok) {
              const linkData = await linkRes.json();
              if (linkData.meetingLink) {
                meetingLink = normalizeMeetingLink(linkData.meetingLink);
              }
            }
          } catch {
            // ignore
          }
        }

        setOngoingMeeting({
          id: ongoing.id,
          title: ongoing.title,
          startTime: ongoing.startTime,
          endTime: ongoing.endTime,
          googleCalendarEventId: ongoing.googleCalendarEventId,
          meetingLink,
          projectName: ongoing.projectName,
        });
      } else {
        setOngoingMeeting(null);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setIsAdmin(data?.user?.role === "admin"))
      .catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchOngoingMeeting();
    const notificationInterval = setInterval(fetchNotifications, 15000);
    const meetingInterval = setInterval(fetchOngoingMeeting, 30000); // Check every 30 seconds
    return () => {
      clearInterval(notificationInterval);
      clearInterval(meetingInterval);
    };
  }, [fetchNotifications, fetchOngoingMeeting]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleMarkRead(id: string) {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      if (!res.ok) return;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // ignore
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) return;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // ignore
    }
  }

  async function handleMarkAllRead() {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (!res.ok) return;
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  }

  async function handleSyncExternalBusiness() {
    try {
      setSyncingBusiness(true);
      const res = await fetch("/api/products/sync-external-revenue", {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Failed to sync external business revenue");
        return;
      }
      toast.success(data.message || "External business revenue synced");
    } catch {
      toast.error("Failed to sync external business revenue");
    } finally {
      setSyncingBusiness(false);
    }
  }

  const { searchQuery, setSearchQuery } = useSearch();
  const { isPrivacyMode, togglePrivacy } = usePrivacy();

  return (
    <div className="flex items-center gap-4">
      <div className="hidden lg:flex relative items-center max-w-sm w-full group">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
        <input
          className="w-[200px] lg:w-[300px] h-9 pl-9 pr-4 rounded-full border border-muted-foreground/10 bg-muted/20 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50 focus:bg-background"
          placeholder="Search workspace (⌘K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <kbd className="absolute right-3 hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground/50">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-4">
        {/* Monitor Status */}
        {monitorCounts.total > 0 && (
          <Link
            href="/dashboard/monitor"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all hover:shadow-sm"
            style={{
              borderColor: monitorCounts.down > 0 ? "var(--destructive)" : "var(--border)",
              backgroundColor: monitorCounts.down > 0 ? "hsl(var(--destructive) / 0.05)" : undefined,
            }}
            title={`${monitorCounts.up} up, ${monitorCounts.down} down — Click to view monitors`}
          >
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                {monitorCounts.up}
              </span>
              {monitorCounts.down > 0 && (
                <span className="flex items-center gap-0.5 text-destructive">
                  <XCircle className="h-3 w-3" />
                  {monitorCounts.down}
                </span>
              )}
            </span>
          </Link>
        )}

        {/* Privacy Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePrivacy}
          className="relative rounded-full"
          aria-label={isPrivacyMode ? "Show sensitive information" : "Hide sensitive information"}
          title={isPrivacyMode ? "Show numbers" : "Hide numbers"}
        >
          {isPrivacyMode ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>

        {/* Quick Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9 gap-2 shadow-sm border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all">
              <Plus className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold">Quick Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-2 py-1.5">
              Create New
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/dashboard/content/posts/new" className="flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-primary/70" />
                <span>New Post</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/dashboard/content/pages/new" className="flex items-center gap-2">
                <FileTextIcon className="h-4 w-4 text-primary/70" />
                <span>New Page</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/dashboard/projects/plans?action=new-plan" className="flex items-center gap-4">
                <FolderTree className="h-4 w-4 text-primary/70" />
                <span>New Document</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {isAdmin && (
          <Button
            variant="outline"
            className="h-9 gap-2 shadow-sm"
            onClick={handleSyncExternalBusiness}
            disabled={syncingBusiness}
          >
            {syncingBusiness ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="text-xs font-semibold">Sync Business</span>
          </Button>
        )}

        <div className="flex items-center gap-2">
          {/* Ongoing Meeting Display */}
          {ongoingMeeting && (
            <>
              {/* Desktop/Tablet View */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800 animate-in slide-in-from-right duration-300">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  <span className="text-xs font-medium text-blue-900 dark:text-blue-100 truncate max-w-[200px]">
                    {ongoingMeeting.title}
                  </span>
                  {ongoingMeeting.projectName && (
                    <span className="hidden md:inline text-xs text-blue-700 dark:text-blue-300 truncate max-w-[120px]">
                      ({ongoingMeeting.projectName})
                    </span>
                  )}
                </div>
                {ongoingMeeting.meetingLink ? (
                  <a
                    href={ongoingMeeting.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 flex-shrink-0"
                  >
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Video className="h-3 w-3 mr-1.5" />
                      Join
                    </Button>
                  </a>
                ) : (
                  <Link href="/dashboard/calendar" className="ml-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-3 text-xs"
                    >
                      <Calendar className="h-3 w-3 mr-1.5" />
                      View
                    </Button>
                  </Link>
                )}
              </div>

              {/* Mobile View - Compact */}
              <div className="sm:hidden">
                {ongoingMeeting.meetingLink ? (
                  <a
                    href={ongoingMeeting.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Video className="h-3 w-3" />
                    </Button>
                  </a>
                ) : (
                  <Link href="/dashboard/calendar">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                    >
                      <Calendar className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </>
          )}

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full"
                aria-label="Notifications"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 max-h-96 overflow-auto"
            >
              <DropdownMenuLabel className="flex items-center justify-between gap-2">
                <span>Notifications</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-[11px]"
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                >
                  <Check className="mr-1 h-3 w-3" />
                  Mark all read
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="px-3 py-6 text-xs text-muted-foreground text-center">
                  No notifications yet.
                </div>
              ) : (
                notifications.slice(0, 20).map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex items-start gap-2 py-2 px-3 text-xs focus:bg-muted"
                  >
                    <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold">
                          {n.title || "Notification"}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          {formatTimeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {n.message}
                      </p>
                      {!n.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(n.id)}
                          className="mt-1 text-[11px] font-medium text-blue-600 hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(n.id)}
                      className="ml-2 mt-0.5 text-muted-foreground hover:text-destructive"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

