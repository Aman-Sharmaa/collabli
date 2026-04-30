import { notFound } from "next/navigation";
import { Metadata } from "next";
import { connectDB } from "@/lib/db";
import { CmsCategory } from "@/models/CmsCategory";
import { CmsPost } from "@/models/CmsPost";
import { slugify } from "@/lib/utils";
import { BlogsPageClient } from "@/components/blogs-page-client";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

function normalizeSlug(slug: string): string {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    decoded = slug;
  }
  return slugify(decoded) || slugify(slug) || decoded;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const normalized = normalizeSlug(slug);
  await connectDB();
  const category = await CmsCategory.findOne({ slug: normalized }).lean();
  if (!category) return { title: "Not Found" };
  const c = category as { name: string };
  return {
    title: `${c.name} | Blog | Kalp.ltd`,
    description: `Posts in ${c.name} category`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const normalized = normalizeSlug(slug);
  await connectDB();
  const category = await CmsCategory.findOne({ slug: normalized }).lean();
  if (!category) notFound();
  const c = category as { _id: unknown; name: string; slug: string };

  const posts = await CmsPost.find({ status: "published", categoryId: String(c._id) })
    .populate("categoryId", "name slug")
    .sort({ publishedAt: -1 })
    .lean();

  const serializedPosts = posts.map((p: unknown) => {
    const post = p as {
      _id: unknown;
      title: string;
      slug: string;
      excerpt?: string;
      featuredImage?: string;
      publishedAt?: string;
      readTimeMinutes?: number;
      categoryId?: { name: string; slug: string } | null;
    };
    return {
      id: String(post._id),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      image: post.featuredImage || "/img1.png",
      date: post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
        : "",
      category: post.categoryId ? (post.categoryId as { name: string }).name : "",
      categorySlug: post.categoryId ? (post.categoryId as { slug: string }).slug : "",
      href: `/post/${post.slug}`,
      readTime: post.readTimeMinutes ? `${post.readTimeMinutes} min read` : "",
    };
  });

  const categories = await CmsCategory.find().sort({ name: 1 }).lean();
  const serializedCategories = categories.map((cat: unknown) => {
    const x = cat as { _id: unknown; name: string; slug: string };
    return { id: String(x._id), name: x.name, slug: x.slug };
  });

  return (
    <BlogsPageClient
      initialPosts={serializedPosts}
      categories={serializedCategories}
      initialCategory={c.slug}
      categoryTitle={c.name}
    />
  );
}
