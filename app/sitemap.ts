import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import { CmsPost } from "@/models/CmsPost";
import { CmsPage } from "@/models/CmsPage";
import { CmsCategory } from "@/models/CmsCategory";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kalp.ltd";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/blogs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/about-us`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  try {
    await connectDB();

    const [posts, pages, categories] = await Promise.all([
      CmsPost.find({ status: "published", visibility: "public" }).select("slug updatedAt").lean(),
      CmsPage.find({ status: "published", visibility: "public" }).select("slug updatedAt").lean(),
      CmsCategory.find().select("slug").lean(),
    ]);

    const postEntries: MetadataRoute.Sitemap = (posts as { slug: string; updatedAt?: Date }[]).map((p) => ({
      url: `${BASE_URL}/post/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const pageEntries: MetadataRoute.Sitemap = (pages as { slug: string; updatedAt?: Date }[]).map((p) => ({
      url: `${BASE_URL}/page/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    const categoryEntries: MetadataRoute.Sitemap = (categories as { slug: string }[]).map((c) => ({
      url: `${BASE_URL}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...postEntries, ...pageEntries, ...categoryEntries];
  } catch (e) {
    console.error("Sitemap generation error", e);
    return staticRoutes;
  }
}
