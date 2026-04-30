import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { Board } from "@/models/Board";
import { Task } from "@/models/Task";
import { verifyToken } from "@/lib/auth";

const COOKIE_NAME = "kalp_auth_token";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await connectDB();

  const { id } = await params;
  const board = await Board.findById(id).lean();
  if (!board) return NextResponse.json({ message: "Not found" }, { status: 404 });

  return NextResponse.json({
    board: {
      id: String(board._id),
      name: board.name,
      type: board.type,
      order: board.order,
      createdAt: board.createdAt,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await connectDB();

  const { id } = await params;
  const board = await Board.findById(id);
  if (!board) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const body = await req.json();
  if (body.name !== undefined) board.name = String(body.name).trim();
  if (body.type !== undefined) board.type = String(body.type).trim();
  if (body.order !== undefined) board.order = Number(body.order);

  await board.save();

  return NextResponse.json({
    board: {
      id: String(board._id),
      name: board.name,
      type: board.type,
      order: board.order,
      createdAt: board.createdAt,
    },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await connectDB();

  const { id } = await params;
  const board = await Board.findByIdAndDelete(id);
  if (!board) return NextResponse.json({ message: "Not found" }, { status: 404 });

  await Task.updateMany({ board: id }, { $unset: { board: 1 } });

  return NextResponse.json({ ok: true });
}
