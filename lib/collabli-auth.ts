import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, type UserRole } from "@/lib/auth";

export const AUTH_COOKIE_NAME = "kalp_auth_token";

export type SessionUser = { userId: string; email: string; role: UserRole };

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  try { return verifyToken(token); } catch { return null; }
}

export async function requireSessionUser(allowedRoles?: UserRole[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (allowedRoles && !allowedRoles.includes(user.role)) redirect("/dashboard");
  return user;
}
