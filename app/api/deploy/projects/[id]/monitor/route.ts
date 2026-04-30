import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { DeployProject } from "@/models/DeployProject";
import { getProjectMonitoring } from "@/lib/deploy/deployer";

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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await connectDB();

  const project = await DeployProject.findById(id);
  if (!project) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const stats = await getProjectMonitoring(project);
  if (stats) {
    await DeployProject.findByIdAndUpdate(id, {
      cpuUsage: stats.cpu,
      memoryUsage: stats.memoryMb,
      diskUsage: stats.disk,
      uptime: stats.uptime,
      restartCount: stats.restartCount,
    });
  }

  return NextResponse.json({ stats });
}
