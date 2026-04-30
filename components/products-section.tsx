"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ProductItem = {
  name: string;
  description: string;
  image: string;
  learnMore: string;
  beta?: boolean;
};

const products: ProductItem[] = [
  {
    name: "Gram",
    description:
      "Hyperlocal delivery, simplified. Order anything from nearby stores and get it delivered in minutes , fast, reliable, and local.",
    image: "/gram_logo.svg",
    learnMore: "/gram",
  },
  {
    name: "SniffUrl",
    description:
      "Short links. Deep insights. Create smart links, track clicks in real time, and optimize every campaign with powerful analytics.",
    image: "/sniff_logo.svg",
    learnMore: "/sniffurl",
  },
];

export function ProductsSection() {
  return (
    <section className="py-24" id="product">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-medium text-gray-900">
            Our Products
          </h2>
          <p className="mt-3 text-gray-600 max-w-xl">
            Thoughtfully designed tools that help teams move faster and smarter.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="h-full"
            >
              <div
                className="
                  relative h-full flex flex-col
                  rounded-3xl p-8
                  bg-white/60
                  backdrop-blur-xl
                  backdrop-saturate-150
                  border border-white/40
                  shadow-[0_8px_30px_rgba(0,120,255,0.08)]
                  hover:shadow-[0_14px_45px_rgba(0,120,255,0.14)]
                  transition-all
                "
              >
                {/* Quote accent */}
                <div className="text-5xl text-gray-200 leading-none mb-4">
                  “
                </div>

                {/* Description */}
                <p className="text-[15px] text-gray-700 leading-relaxed mb-10">
                  {product.description}
                </p>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {product.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      Product
                    </span>
                  </div>

                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain "
                    />
                  </div>
                </div>

                {/* Learn more / Beta badge */}
                {product.beta ? (
                  <span className="mt-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
                    Beta Testing
                  </span>
                ) : (
                  <Link
                    href={product.learnMore as string}
                    className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline"
                  >
                    Learn more
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
