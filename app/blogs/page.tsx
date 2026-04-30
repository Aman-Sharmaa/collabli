import { connectDB } from "@/lib/db";
import { CmsPost } from "@/models/CmsPost";
import { CmsCategory } from "@/models/CmsCategory";
import { BlogsPageClient } from "@/components/blogs-page-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blogs",
  description:
    "We've partnered with growing businesses to build foundations for sustainable success. Explore real stories of transformation.",
};

export default async function BlogsPage() {
  await connectDB();
  const [posts, categories] = await Promise.all([
    CmsPost.find({ status: "published" })
      .populate("categoryId", "name slug")
      .sort({ publishedAt: -1 })
      .lean(),
    CmsCategory.find().sort({ name: 1 }).lean(),
  ]);

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
      image: post.featuredImage || "",
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

  const serializedCategories = categories.map((c: unknown) => {
    const cat = c as { _id: unknown; name: string; slug: string };
    return { id: String(cat._id), name: cat.name, slug: cat.slug };
  });

  return (
    <BlogsPageClient
      initialPosts={serializedPosts}
      categories={serializedCategories}
    />
  );
}
