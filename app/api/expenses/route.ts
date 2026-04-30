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

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await connectDB();

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const paused = searchParams.get("paused"); // "true" | "false" | omit for all

  const filter: Record<string, unknown> = {};
  if (productId) filter.product = productId;
  if (paused === "true") filter.isPaused = true;
  if (paused === "false") filter.isPaused = false;

  const list = await Expense.find(filter)
    .populate("product", "name slug kind")
    .sort({ createdAt: -1 })
    .lean();

  const expenses = list.map((e) => ({
    id: String(e._id),
    productId: String((e.product as any)?._id ?? e.product),
    productName: (e.product as any)?.name ?? "",
    productKind: (e.product as any)?.kind ?? "product",
    type: e.type,
    amount: e.amount,
    frequency: e.frequency,
    customMonths: e.customMonths ?? undefined,
    remark: e.remark ?? undefined,
    isPaused: e.isPaused,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }));

  return NextResponse.json({ expenses });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  await connectDB();

  const body = await req.json();
  const { productId, type, amount, frequency, customMonths, remark } = body as {
    productId?: string;
    type?: string;
    amount?: number;
    frequency?: "monthly" | "yearly" | "custom";
    customMonths?: number;
    remark?: string;
  };

  if (!productId || !type || amount == null) {
    return NextResponse.json(
      { message: "Product, type, and amount are required" },
      { status: 400 }
    );
  }

  const product = await Product.findById(productId);
  if (!product) {
    return NextResponse.json({ message: "Product or service not found" }, { status: 404 });
  }

  const freq = frequency || "monthly";
  if (freq === "custom" && (!customMonths || customMonths < 1)) {
    return NextResponse.json(
      { message: "customMonths is required when frequency is custom" },
      { status: 400 }
    );
  }

  const expense = await Expense.create({
    product: productId,
    type: type.trim(),
    amount: Number(amount),
    frequency: freq,
    customMonths: freq === "custom" ? Number(customMonths) : undefined,
    remark: remark?.trim() || undefined,
    isPaused: false,
  });

  const populated = await Expense.findById(expense._id)
    .populate("product", "name slug kind")
    .lean();

  return NextResponse.json(
    {
      expense: {
        id: String(populated!._id),
        productId: String((populated!.product as any)?._id ?? populated!.product),
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
    },
    { status: 201 }
  );
}
