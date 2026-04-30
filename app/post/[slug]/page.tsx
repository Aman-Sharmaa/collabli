import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { CmsPost } from "@/models/CmsPost";
import { Employee } from "@/models/Employee";
import "@/models/User";
import { slugify } from "@/lib/utils";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RichTextDisplay } from "@/components/rich-text-editor";
import { Calendar, Tag, ArrowLeft, User as UserIcon } from "lucide-react";
import { PostPasswordWall } from "@/components/cms-post-password-wall";

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
  const post = await CmsPost.findOne({ slug: normalized, status: "published" }).lean();
  if (!post) return { title: "Not Found" };
  const p = post as {
    metaTitle?: string;
    metaDescription?: string;
    excerpt?: string;
    title: string;
    ogImage?: string;
    featuredImage?: string;
  };
  const img = p.ogImage || p.featuredImage;
  const desc = p.metaDescription || p.excerpt;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kalp.ltd";
  const canonical = `${baseUrl}/post/${normalized}`;
  return {
    title: p.metaTitle || p.title,
    description: desc || undefined,
    alternates: { canonical },
    openGraph: {
      title: p.metaTitle || p.title,
      description: desc || undefined,
      images: img ? [img] : undefined,
      type: "article",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: p.metaTitle || p.title,
      description: desc || undefined,
      images: img ? [img] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const normalized = normalizeSlug(slug);
  await connectDB();
  const post = await CmsPost.findOne({ slug: normalized, status: "published" })
    .populate("categoryId", "name slug")
    .populate("authorId", "name email")
    .lean();
  if (!post) notFound();
  const p = post as {
    title: string;
    excerpt?: string;
    content: string;
    featuredImage?: string;
    layout?: string;
    categoryId?: { name: string; slug: string } | null;
    authorId?: { name?: string; email?: string } | null;
    publishedAt?: string;
    readTimeMinutes?: number;
    password?: string;
  };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kalp.ltd";
  const authorName = p.authorId
    ? (p.authorId as { name?: string }).name || (p.authorId as { email?: string }).email || "Kalp.ltd"
    : "Kalp.ltd";

  let authorProfileSlug: string | null = null;
  if (p.authorId && (p.authorId as { email?: string }).email) {
    const authorEmployee = await Employee.findOne({
      email: (p.authorId as { email: string }).email,
      profileSlug: { $exists: true, $ne: null },
    }).lean();
    if (authorEmployee?.profileSlug) {
      authorProfileSlug = authorEmployee.profileSlug;
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.excerpt || undefined,
    image: p.featuredImage ? (p.featuredImage.startsWith("http") ? p.featuredImage : `${baseUrl}${p.featuredImage.startsWith("/") ? "" : "/"}${p.featuredImage}`) : undefined,
    datePublished: p.publishedAt || undefined,
    author: { "@type": "Person", name: authorName },
    publisher: { "@type": "Organization", name: "Kalp.ltd", url: baseUrl },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${baseUrl}/post/${normalized}` },
  };

  const innerLayoutClass =
    p.layout === "full-width" ? "max-w-none" :
      p.layout === "narrow" ? "max-w-[600px]" : "max-w-[800px]";

  const dateStr = p.publishedAt
    ? new Date(p.publishedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "";
  const readTime = p.readTimeMinutes ? `${p.readTimeMinutes} min read` : "";

  return (
    <main className="min-h-screen bg-[#f7f5f0]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <section className="pt-32 sm:pt-40 pb-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`${innerLayoutClass} ${p.layout !== "full-width" ? "mx-auto" : ""}`}>
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to blogs
            </Link>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
              {p.categoryId && (
                <Link
                  href={`/category/${(p.categoryId as { slug: string }).slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 hover:bg-white transition-colors"
                >
                  <Tag className="w-3.5 h-3.5" />
                  {(p.categoryId as { name: string }).name}
                </Link>
              )}
              {p.authorId && ((p.authorId as { name?: string }).name || (p.authorId as { email?: string }).email) && (
                authorProfileSlug ? (
                  <Link
                    href={`/@${authorProfileSlug}`}
                    className="inline-flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    Written by <span className="underline underline-offset-2">{(p.authorId as { name?: string }).name || (p.authorId as { email?: string }).email}</span>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5" />
                    Written by {(p.authorId as { name?: string }).name || (p.authorId as { email?: string }).email}
                  </span>
                )
              )}
              {dateStr && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {dateStr}
                </span>
              )}
              {readTime && <span>{readTime}</span>}
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-6">
              {p.title}
            </h1>
            {p.excerpt && (
              <p className="text-xl text-gray-600 mb-8">{p.excerpt}</p>
            )}
            
            {p.password ? (
              <PostPasswordWall correctPassword={p.password}>
                {p.featuredImage && (
                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-10 bg-gradient-to-br from-purple-100 to-orange-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.featuredImage.startsWith("http") || p.featuredImage.startsWith("/") ? p.featuredImage : `/${p.featuredImage}`}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <article className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary prose-strong:text-gray-900 prose-ul:text-gray-600 prose-ol:text-gray-600">
                  <RichTextDisplay html={p.content || ""} />
                </article>
              </PostPasswordWall>
            ) : (
              <>
                {p.featuredImage && (
                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-10 bg-gradient-to-br from-purple-100 to-orange-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.featuredImage.startsWith("http") || p.featuredImage.startsWith("/") ? p.featuredImage : `/${p.featuredImage}`}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <article className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary prose-strong:text-gray-900 prose-ul:text-gray-600 prose-ol:text-gray-600">
                  <RichTextDisplay html={p.content || ""} />
                </article>
              </>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
