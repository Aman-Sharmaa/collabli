import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { connectDB } from "@/lib/db";
import { CmsPage } from "@/models/CmsPage";
import { slugify } from "@/lib/utils";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RichTextDisplay } from "@/components/rich-text-editor";

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
  const normalized = slugify(decoded) || slugify(slug) || decoded;
  return normalized;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const normalized = normalizeSlug(slug);
  await connectDB();
  const page = await CmsPage.findOne({ slug: normalized, status: "published" }).lean();
  if (!page) return { title: "Not Found" };
  const p = page as { metaTitle?: string; metaDescription?: string; title: string; ogImage?: string };
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kalp.ltd";
  const canonical = `${baseUrl}/page/${normalized}`;
  return {
    title: p.metaTitle || p.title,
    description: p.metaDescription || undefined,
    alternates: { canonical },
    openGraph: {
      title: p.metaTitle || p.title,
      description: p.metaDescription || undefined,
      images: p.ogImage ? [p.ogImage] : undefined,
      url: canonical,
    },
  };
}

export default async function CmsPageRoute({ params }: Props) {
  const { slug } = await params;
  const normalized = normalizeSlug(slug);
  await connectDB();
  const page = await CmsPage.findOne({ slug: normalized, status: "published" }).lean();
  if (!page) {
    // Fallback: redirect known static pages when no CMS page exists
    if (normalized === "about-us") redirect("/about-us");
    notFound();
  }
  const p = page as { title: string; content: string; metaTitle?: string; metaDescription?: string; layout?: string };
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kalp.ltd";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: p.metaTitle || p.title,
    description: p.metaDescription || undefined,
    url: `${baseUrl}/page/${normalized}`,
    publisher: { "@type": "Organization", name: "Kalp.ltd", url: baseUrl },
  };
  const innerLayoutClass =
    p.layout === "full-width" ? "max-w-none" :
    p.layout === "narrow" ? "max-w-[600px]" : "max-w-[800px]";

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
          <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-8">
            {p.title}
          </h1>
          <article className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary prose-strong:text-gray-900">
            <RichTextDisplay html={p.content || ""} />
          </article>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
