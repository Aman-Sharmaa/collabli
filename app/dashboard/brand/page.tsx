import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/collabli-auth";
import BrandListClient from "./brand-list-client";

export const dynamic = "force-dynamic";

export default async function DashboardBrandPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");
  return <BrandListClient />;
}
