import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { DeployServer } from "@/models/DeployServer";
import { testConnection } from "@/lib/deploy/ssh";

const COOKIE = "kalp_auth_token";
async function requireAdmin() {
  const c = await cookies();
  const t = c.get(COOKIE)?.value;
  if (!t) return null;
  try {
    const u = verifyToken(t);
    return u?.role === "admin" ? u : null;
  } catch { return null; }
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await connectDB();

  const server = await DeployServer.findById(id);
  if (!server) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const result = await testConnection(server);
  await DeployServer.findByIdAndUpdate(id, {
    status: result.ok ? "connected" : "error",
    lastCheckedAt: new Date(),
  });

  return NextResponse.json(result);
}
