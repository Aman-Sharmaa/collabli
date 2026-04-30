import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Expense } from "@/models/Expense";
import { Product } from "@/models/Product";

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

async function requireAdmin() {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  await connectDB();

  const expense = await Expense.findById(id);
  if (!expense) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const body = await req.json();
  const { type, amount, frequency, customMonths, remark, isPaused, productId } = body as {
    type?: string;
    amount?: number;
    frequency?: "monthly" | "yearly" | "custom";
    customMonths?: number;
    remark?: string;
    isPaused?: boolean;
    productId?: string;
  };

  if (productId !== undefined) {
    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ message: "Product or service not found" }, { status: 404 });
    expense.product = productId as any;
  }
  if (type !== undefined) expense.type = type.trim();
  if (amount !== undefined) expense.amount = Number(amount);
  if (frequency !== undefined) {
    expense.frequency = frequency;
    if (frequency === "custom" && customMonths != null) expense.customMonths = Number(customMonths);
    else if (frequency !== "custom") expense.customMonths = undefined;
  }
  if (customMonths !== undefined && expense.frequency === "custom") expense.customMonths = Number(customMonths);
  if (remark !== undefined) expense.remark = remark?.trim() || undefined;
  if (typeof isPaused === "boolean") expense.isPaused = isPaused;

  await expense.save();

  const populated = await Expense.findById(expense._id)
    .populate("product", "name slug kind")
    .lean();

  return NextResponse.json({
    expense: {
      id: String(populated!._id),
      productId: String(populated!.product),
      productName: (populated!.product as any)?.name ?? "",
      productKind: (populated!.product as any)?.kind ?? "product",
      type: populated!.type,
      amount: populated!.amount,
      frequency: populated!.frequency,
      customMonths: populated!.customMonths ?? undefined,
      remark: populated!.remark ?? undefined,
      isPaused: populated!.isPaused,
      createdAt: populated!.createdAt,
      updatedAt: populated!.updatedAt,
    },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  await connectDB();

  const expense = await Expense.findByIdAndDelete(id);
  if (!expense) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
