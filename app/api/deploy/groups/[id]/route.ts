import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { DeployGroup } from "@/models/DeployGroup";

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await connectDB();
  const body = await req.json();
  const group = await DeployGroup.findByIdAndUpdate(id, body, { new: true });
  if (!group) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ group: { id: String(group._id), name: group.name } });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await connectDB();
  await DeployGroup.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
