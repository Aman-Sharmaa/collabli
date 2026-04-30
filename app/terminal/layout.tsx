import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TerminalLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("kalp_auth_token")?.value;
  if (!token) redirect("/login");
  try {
    const p = verifyToken(token);
    if (p.role !== "admin") redirect("/dashboard");
  } catch {
    redirect("/login");
  }
  return <>{children}</>;
}
