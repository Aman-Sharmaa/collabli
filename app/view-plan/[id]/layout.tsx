import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { CompanyProfile } from "@/models/CompanyProfile";
import { User } from "@/models/User";
import { Plan } from "@/models/Plan";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { SearchProvider } from "@/components/search-context";
import { PrivacyProvider } from "@/components/privacy-context";

const COOKIE_NAME = "kalp_auth_token";

async function getUserAndCompany() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) redirect("/login");

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    redirect("/login");
  }

  await connectDB();
  const [profile, userDoc] = await Promise.all([
    CompanyProfile.findOne({ owner: payload.userId }).lean(),
    User.findById(payload.userId)
      .select("canManageContent name")
      .lean(),
  ]);

  const canManageContent =
    payload.role === "admin" || !!(userDoc as any)?.canManageContent;
  const displayName = (userDoc as any)?.name || "";

  return {
    user: { ...payload, canManageContent, name: displayName },
    profile: profile
      ? {
          companyName: profile.companyName,
          logoUrl: profile.logoUrl as string | undefined,
        }
      : null,
  };
}

export default async function ViewPlanLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { user, profile } = await getUserAndCompany();
  const { id } = await params;

  await connectDB();
  const plan = await Plan.findById(id).select("name").lean();
  const planName = plan?.name || "Plan";

  return (
    <SearchProvider>
      <PrivacyProvider>
        <SidebarProvider>
          <AppSidebar user={user} profile={profile} />
          <SidebarInset className="bg-muted/40 overflow-hidden flex flex-col h-svh">
            <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background px-6">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="font-semibold text-foreground/80">
                        {planName}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="flex items-center gap-2">
                <DashboardTopbar />
              </div>
            </header>
            <main className="flex-1 overflow-auto p-6 md:p-8 min-w-0">
              <div className="mx-auto max-w-7xl min-w-0">{children}</div>
            </main>
          </SidebarInset>
          <Toaster />
        </SidebarProvider>
      </PrivacyProvider>
    </SearchProvider>
  );
}
