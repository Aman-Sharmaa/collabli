import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Employee } from "@/models/Employee";
import { CmsPost } from "@/models/CmsPost";
import "@/models/User";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Briefcase,
  Calendar,
  ArrowRight,
  Tag,
} from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const employee = await Employee.findOne({ profileSlug: slug, isDismissed: { $ne: true } }).lean();
  if (!employee) return { title: "Profile Not Found" };
  return {
    title: `${employee.name} — ${employee.title || "Team Member"}`,
    description: `${employee.name} is part of our team${employee.department ? ` in ${employee.department}` : ""}.`,
  };
}

export default async function TeamProfilePage({ params }: Props) {
  const { slug } = await params;
  await connectDB();

  const employee = await Employee.findOne({
    profileSlug: slug,
    isDismissed: { $ne: true },
  }).lean();

  if (!employee) notFound();

  const posts = await CmsPost.find({ status: "published" })
    .populate("authorId", "name email")
    .populate("categoryId", "name slug")
    .sort({ publishedAt: -1 })
    .lean();

  const authorPosts = posts.filter((p: any) => {
    const author = p.authorId as { name?: string; email?: string } | null;
    return author && author.email === employee.email;
  });

  const initials = employee.name
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-[#f7f5f0]">
      <Header />
      <section className="pt-32 sm:pt-40 pb-20">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          {/* Profile header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12">
            <Avatar className="h-28 w-28 border-4 border-white shadow-xl rounded-2xl">
              <AvatarImage src={employee.avatarUrl} className="object-cover" />
              <AvatarFallback className="text-3xl font-black bg-primary/10 text-primary rounded-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                {employee.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-gray-500 mb-3">
                {employee.title && (
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    {employee.title}
                  </span>
                )}
                {employee.department && (
                  <Badge variant="secondary" className="text-xs">
                    {employee.department}
                  </Badge>
                )}
                {employee.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {employee.location}
                  </span>
                )}
              </div>
              <Badge variant="outline" className="capitalize">
                {employee.type}
              </Badge>
            </div>
          </div>

          {/* Blog posts by this author */}
          {authorPosts.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Posts by {employee.name.split(" ")[0]}
              </h2>
              <div className="space-y-6">
                {authorPosts.map((post: any) => {
                  const cat = post.categoryId as { name: string; slug: string } | null;
                  const dateStr = post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "";

                  return (
                    <Link
                      key={String(post._id)}
                      href={`/post/${post.slug}`}
                      className="group block bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        {post.featuredImage && (
                          <div className="hidden sm:block shrink-0 w-32 h-20 rounded-lg overflow-hidden bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors mb-1 line-clamp-1">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            {cat && (
                              <span className="inline-flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {cat.name}
                              </span>
                            )}
                            {dateStr && (
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {dateStr}
                              </span>
                            )}
                            {post.readTimeMinutes && (
                              <span>{post.readTimeMinutes} min read</span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors shrink-0 self-center" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {authorPosts.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">No published posts yet</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
