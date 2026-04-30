"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Notification {
    _id: string;
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    link?: string;
    data?: Record<string, any>;
    createdAt: string;
}

function deriveLinkFromNotification(n: Notification): string | null {
    if (n.link) return n.link;

    switch (n.type) {
        case "new_lead":
        case "lead_created":
        case "lead_updated":
            return n.data?.leadId ? `/dashboard/leads?id=${n.data.leadId}` : "/dashboard/leads";
        case "new_onboarding":
        case "client_created":
        case "client_updated":
            return n.data?.clientId ? `/dashboard/clients?id=${n.data.clientId}` : "/dashboard/clients";
        case "plan_shared":
            return n.data?.planId ? `/view-plan/${n.data.planId}` : "/dashboard/projects/plans";
        case "access_updated":
            return "/dashboard";
        case "task_assigned":
        case "task_created":
        case "task_updated":
            return "/dashboard/todo";
        case "project_assigned":
        case "project_updated":
            return n.data?.projectId ? `/dashboard/projects?id=${n.data.projectId}` : "/dashboard/projects";
        case "attendance_updated":
            return "/dashboard/attendance";
        case "leave_request":
        case "leave_approved":
        case "leave_rejected":
            return n.data?.employeeId ? `/dashboard/people/${n.data.employeeId}` : "/dashboard/people";
        case "reimbursement_created":
        case "reimbursement_updated":
        case "reimbursement_approved":
        case "reimbursement_rejected":
            return "/dashboard/reimbursements";
        case "payslip_generated":
        case "payslip_created":
        case "payslip_updated":
        case "salary_payout_summary":
            return "/dashboard/payslips";
        case "invoice_created":
        case "invoice_updated":
        case "invoice_paid":
            return n.data?.invoiceId ? `/dashboard/invoices?id=${n.data.invoiceId}` : "/dashboard/invoices";
        case "proposal_created":
        case "proposal_updated":
            return n.data?.proposalId ? `/dashboard/proposals?id=${n.data.proposalId}` : "/dashboard/proposals";
        case "expense_created":
        case "expense_updated":
            return "/dashboard/expenses";
        case "deploy_success":
        case "deploy_failed":
        case "deploy_new_commit":
            return "/dashboard/deployment";
        case "contact_created":
            return "/dashboard/clients";
        default:
            return null;
    }
}

export function NotificationBell() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount((data.notifications || []).filter((n: Notification) => !n.read).length);
            }
        } catch {
            // silent
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleClick = async (notification: Notification) => {
        if (!notification.read) {
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: notification.id }),
            }).catch(() => {});
        }

        const link = deriveLinkFromNotification(notification);
        if (link) {
            setOpen(false);
            router.push(link);
        }
    };

    const markAllRead = async () => {
        try {
            await fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAllRead: true }),
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            toast.success("All marked as read");
        } catch {
            // silent
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-2">
                    <span className="text-sm font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-auto px-2 text-xs" onClick={markAllRead}>
                            Mark all read
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications
                        </div>
                    ) : (
                        notifications.map((notification) => {
                            const link = deriveLinkFromNotification(notification);
                            return (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex flex-col gap-1 p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors",
                                        !notification.read && "bg-blue-50/50 dark:bg-blue-900/10"
                                    )}
                                    onClick={() => handleClick(notification)}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <span className={cn("text-sm font-medium", !notification.read && "text-blue-600 dark:text-blue-400")}>
                                            {notification.title}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {notification.message}
                                    </p>
                                    {link && (
                                        <span className="text-[10px] text-primary mt-0.5">Click to view →</span>
                                    )}
                                </div>
                            );
                        })
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
