"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  categorySlug: string;
  href: string;
  readTime: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

interface BlogsPageClientProps {
  initialPosts: BlogPost[];
  categories: Category[];
  initialCategory?: string;
  categoryTitle?: string;
}

export function BlogsPageClient({
  initialPosts,
  categories,
  initialCategory,
  categoryTitle,
}: BlogsPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "all");

  useEffect(() => {
    setSelectedCategory(initialCategory || "all");
  }, [initialCategory]);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "all") return initialPosts;
    return initialPosts.filter((p) => p.categorySlug === selectedCategory);
  }, [initialPosts, selectedCategory]);

  return (
    <main className="min-h-screen bg-[#f7f5f0]">
      <Header />

      {/* Hero */}
      <section className="pt-32 sm:pt-40 pb-16 sm:pb-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 mb-6">
              {categoryTitle || "Blogs"}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              {categoryTitle
                ? `Posts in ${categoryTitle}`
                : "We've partnered with growing businesses to build foundations for sustainable success. Explore real stories of transformation."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter - linkable */}
      <section className="pb-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/blogs"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === "all"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 hover:no-underline"
                }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.slug
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 hover:no-underline"
                  }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="pb-20 sm:pb-28">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No posts yet. Check back soon for new content.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={post.href} className="group block h-full">
                    <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      {/* Image Container */}
                      {post.image && (
                        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
                          <Image
                            src={post.image.startsWith("http") || post.image.startsWith("/") ? post.image : `/${post.image}`}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Overlay Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                          {/* Category Badge - linkable */}
                          {post.category && post.categorySlug && (
                            <div className="absolute top-4 left-4">
                              <Link
                                href={`/category/${post.categorySlug}`}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Tag className="w-3.5 h-3.5 text-gray-600" />
                                <span className="text-xs font-medium text-gray-900">
                                  {post.category}
                                </span>
                              </Link>
                            </div>
                          )}
                          {/* Date Tag */}
                          {post.date && (
                            <div className="absolute bottom-4 right-4">
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm">
                                <Calendar className="w-3.5 h-3.5 text-gray-600" />
                                <span className="text-xs font-medium text-gray-700">
                                  {post.date.split(" ")[1] || post.date}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                          {post.date && <span>{post.date}</span>}
                          {post.date && post.readTime && <span>•</span>}
                          {post.readTime && <span>{post.readTime}</span>}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:gap-3 transition-all">
                          Read more
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
