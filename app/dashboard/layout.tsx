import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/collabli-auth";
import { DashboardShell } from "@/components/collabli/dashboard-shell";
import { DashboardSocketGate } from "@/components/collabli/dashboard-socket-gate";
import { OnboardingGate } from "@/components/collabli/onboarding-gate";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  let publicHandle: string | undefined;
  if (user.role === "creator" || user.role === "brand") {
    await connectDB();
    const doc = await User.findById(user.userId).select("publicHandle").lean();
    publicHandle = (doc as { publicHandle?: string } | null)?.publicHandle || undefined;
  }

  const socketEnabled = user.role === "creator" || user.role === "brand";

  return (
    <DashboardShell user={{ ...user, publicHandle }}>
      <DashboardSocketGate userId={user.userId} enabled={socketEnabled}>
        <OnboardingGate role={user.role}>{children}</OnboardingGate>
      </DashboardSocketGate>
    </DashboardShell>
  );
}
