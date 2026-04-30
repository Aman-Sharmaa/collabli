"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageHero } from "@/components/page-hero";
import { ArrowRight } from "lucide-react";

type ProductItem = {
  name: string;
  description: string;
  image: string;
  href: string;
  beta?: boolean;
};

const products: ProductItem[] = [
  {
    name: "Gram",
    description:
      "Social media management made simple. Create, schedule, and analyze your content all in one place.",
    image: "/gram_logo.svg",
    href: "/gram",
  },
  {
    name: "SniffUrl",
    description:
      "URL shortener with analytics. Track clicks, monitor performance, and optimize your links.",
    image: "/sniff_logo.svg",
    href: "/sniffurl",
  },
];

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Header />
      <PageHero
        title="Our Products"
        subtitle="Thoughtfully designed tools that help teams move faster and smarter."
      />
      <section className="py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {product.beta ? (
                  <div
                    className="relative h-full rounded-3xl p-8 bg-white/60 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_30px_rgba(0,120,255,0.08)] border border-white/40 transition-all"
                  >
                    <div className="text-5xl text-gray-200 leading-none mb-4">
                      "
                    </div>
                    <p className="text-[15px] text-gray-700 leading-relaxed mb-10">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <span className="text-sm text-gray-500">Product</span>
                      </div>
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
                        Beta Testing
                      </span>
                    </div>
                  </div>
                ) : (
                  <Link href={product.href as string}>
                    <div
                      className="relative h-full rounded-3xl p-8 bg-white/60 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_30px_rgba(0,120,255,0.08)] border border-white/40 hover:shadow-[0_12px_40px_rgba(0,120,255,0.12)] transition-all group"
                    >
                      <div className="text-5xl text-gray-200 leading-none mb-4">
                        "
                      </div>
                      <p className="text-[15px] text-gray-700 leading-relaxed mb-10">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 group-hover:text-black">
                            {product.name}
                          </h3>
                          <span className="text-sm text-gray-500">Product</span>
                        </div>
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                      </div>
                      <div className="mt-6 inline-flex items-center gap-1 text-sm text-gray-900 group-hover:gap-2 transition-all">
                        <span>Learn more</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
