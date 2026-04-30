import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CmsPage } from "@/models/CmsPage";
import { requireCmsAccess, slugify } from "@/lib/cms-auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const authorId = searchParams.get("authorId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (authorId) query.authorId = authorId;

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (startDate || endDate) {
      const dateQuery: Record<string, unknown> = {};
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);
      query.updatedAt = dateQuery;
    }

    const pages = await CmsPage.find(query)
      .populate("authorId", "name email")
      .sort({ updatedAt: -1 })
      .lean();
    return NextResponse.json({ pages });
  } catch (e) {
    console.error("CMS pages GET", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireCmsAccess();
  if (!auth) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    await connectDB();
    const body = await req.json();
    const slug = body.slug?.trim() || slugify(body.title || "untitled");
    const existing = await CmsPage.findOne({ slug });
    if (existing) {
      return NextResponse.json({ message: "Page with this slug already exists" }, { status: 400 });
    }
    const page = await CmsPage.create({
      title: body.title || "Untitled",
      slug,
      content: body.content || "",
      metaTitle: body.metaTitle || body.title,
      metaDescription: body.metaDescription,
      metaKeywords: body.metaKeywords,
      ogImage: body.ogImage,
      layout: body.layout || "default",
      status: body.status || "published",
      authorId: auth.userId,
      publishedAt: body.status === "published" ? new Date() : undefined,
    });
    return NextResponse.json({ page: await page.toObject() }, { status: 201 });
  } catch (e) {
    console.error("CMS pages POST", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
