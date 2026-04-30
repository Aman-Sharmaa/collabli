"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  ClipboardList,
  ExternalLink,
  Handshake,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Megaphone,
  PlusCircle,
  Search,
  Settings,
  Shield,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type SessionUser = {
  userId: string;
  email: string;
  role: string;
  publicHandle?: string;
};

const mainNav: { href: string; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/brand", label: "Brands", icon: Building2, adminOnly: true },
  { href: "/dashboard/creator", label: "Creators", icon: Users, adminOnly: true },
  { href: "/dashboard/campaign-board", label: "Campaigns", icon: Megaphone },
  { href: "/creators", label: "Directory", icon: Users },
  { href: "/dashboard/admin", label: "Approvals", icon: Shield, adminOnly: true },
];

const creatorNav: { href: string; label: string; icon: typeof LayoutDashboard }[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/opportunities", label: "Browse campaigns", icon: Megaphone },
  { href: "/dashboard/incoming-applications", label: "Inquiries", icon: Inbox },
  { href: "/dashboard/my-applications", label: "Applications", icon: ClipboardList },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/my-deals", label: "Deals", icon: Handshake },
  { href: "/dashboard/earnings", label: "Earnings", icon: Wallet },
  { href: "/dashboard/add-project", label: "Add project", icon: PlusCircle },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const brandNav: { href: string; label: string; icon: typeof LayoutDashboard }[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/applicants", label: "Applicants", icon: ClipboardList },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/campaign-board", label: "Campaigns", icon: Megaphone },
  { href: "/dashboard/my-deals", label: "Deals", icon: Handshake },
  { href: "/dashboard/add-project", label: "Showcase", icon: PlusCircle },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function breadcrumbFromPath(pathname: string): string[] {
  if (pathname === "/dashboard") return ["Home", "Dashboard"];
  const rest = pathname.replace("/dashboard/", "").split("/").filter(Boolean);
  const map: Record<string, string> = {
    brand: "Brands",
    creator: "Creators",
    admin: "Approvals",
    "campaign-board": "Campaigns",
    onboarding: "Onboarding",
    "add-project": "Add project",
    profile: "Profile",
    opportunities: "Browse campaigns",
    "my-applications": "Applications",
    "my-deals": "Deals",
    earnings: "Earnings",
    settings: "Settings",
    applicants: "Applicants",
    messages: "Messages",
    "incoming-applications": "Inquiries",
    apply: "Apply",
  };
  return ["Home", "Dashboard", ...rest.map((s) => map[s] || s.replace(/-/g, " "))];
}

export function DashboardShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = user.role === "admin";
  const isCreatorBrand = user.role === "creator" || user.role === "brand";
  const nav = isAdmin
    ? mainNav.filter((item) => !item.adminOnly || isAdmin)
    : user.role === "creator"
      ? creatorNav
      : user.role === "brand"
        ? brandNav
        : mainNav.filter((item) => !item.adminOnly);
  const crumbs = breadcrumbFromPath(pathname || "/dashboard");
  const publicProfileHref = user.publicHandle ? `/u/${user.publicHandle}` : null;

  return (
    <div className="flex min-h-screen bg-neutral-100/80">
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-neutral-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-neutral-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400 text-sm font-bold text-black">
            C
          </div>
          <span className="font-semibold text-neutral-900">Collabli</span>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-yellow-400/15 text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", active ? "text-yellow-600" : "text-neutral-400")} />
                {item.label}
              </Link>
            );
          })}
          {(user.role === "creator" || user.role === "brand") && publicProfileHref ? (
            <Link
              href={publicProfileHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <ExternalLink className="h-5 w-5 shrink-0 text-neutral-400" />
              Public profile
            </Link>
          ) : user.role === "creator" || user.role === "brand" ? (
            <p className="px-3 py-2 text-xs text-neutral-400">Set a username in Profile to publish your page.</p>
          ) : null}
        </nav>
        <div className="border-t border-neutral-200 p-3">
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <LogOut className="h-5 w-5 text-neutral-400" />
              Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-neutral-200 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 lg:px-8">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-neutral-500">
              {crumbs.map((c, i) => (
                <span key={i}>
                  {i > 0 ? <span className="mx-1.5 text-neutral-300">/</span> : null}
                  <span className={i === crumbs.length - 1 ? "font-medium text-neutral-800" : ""}>{c}</span>
                </span>
              ))}
            </p>
          </div>
          <div className="hidden max-w-xs flex-1 md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                readOnly
                placeholder="Search..."
                className="h-10 rounded-xl border-neutral-200 bg-neutral-50 pl-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full text-neutral-600" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden rounded-full text-neutral-600 sm:inline-flex" asChild>
              <Link href="/dashboard" aria-label="Settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 rounded-xl px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-yellow-400 text-xs font-semibold text-black">
                      {(user.email?.[0] || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[140px] truncate text-sm font-medium text-neutral-800 lg:inline">
                    {user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="text-xs font-normal text-muted-foreground">Signed in</div>
                  <div className="truncate text-sm">{user.email}</div>
                  <div className="text-xs capitalize text-muted-foreground">{user.role}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action="/api/auth/logout" method="post" className="w-full">
                    <button type="submit" className="w-full text-left">
                      Log out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 bg-white px-3 py-2 lg:hidden">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium",
                  active ? "bg-yellow-400 text-black" : "text-neutral-600"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
