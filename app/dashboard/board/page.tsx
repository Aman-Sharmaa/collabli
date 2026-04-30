import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { BoardPageClient } from "@/components/board-page-client";

const COOKIE_NAME = "kalp_auth_token";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) redirect("/login");
  try {
    return verifyToken(token);
  } catch {
    redirect("/login");
  }
}

export default async function BoardPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div className="border-b pb-6">
        <h2 className="text-3xl font-bold tracking-tight">TODO Board</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage tasks by project. Select a project to view and update the board.
        </p>
      </div>
      <BoardPageClient />
    </div>
  );
}
