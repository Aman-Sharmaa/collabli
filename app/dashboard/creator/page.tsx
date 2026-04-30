import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/collabli-auth";
import CreatorListClient from "./creator-list-client";

export const dynamic = "force-dynamic";

export default async function DashboardCreatorPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");
  return <CreatorListClient />;
}
