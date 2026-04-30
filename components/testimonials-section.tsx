"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { DEFAULT_HOME_PAGE_SETTINGS, type HomeTestimonialsSettings } from "@/lib/home-page-defaults";

type TestimonialsSectionProps = {
  settings?: HomeTestimonialsSettings;
};

export function TestimonialsSection({
  settings = DEFAULT_HOME_PAGE_SETTINGS.testimonials,
}: TestimonialsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const testimonials = settings.items || [];
  const loopTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl sm:text-5xl font-medium text-black">
            {settings.title}
          </h2>
          <p className="mt-6 text-gray-500">
            {settings.subtitle}
          </p>
        </div>

        {/* Mobile View - Static Grid */}
        <div className="lg:hidden">
          <div className="grid grid-cols-1 gap-6">
            {testimonials.slice(0, showAll ? testimonials.length : 3).map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="
                  rounded-3xl p-8
                  backdrop-blur-xl backdrop-saturate-150
                  border border-white/40
                  bg-white/60
                  hover:shadow-[0_12px_40px_rgba(0,120,255,0.12)]
                  transition-all
                "
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4 text-sm text-black">
                  ★★★★★
                </div>

                {/* Quote */}
                <p className="text-sm leading-relaxed text-gray-700 mb-8">
                  "{t.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-sm font-medium text-black">
                      {t.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {t.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Show More Button */}
          {!showAll && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowAll(true)}
                className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-gray-900 text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
              >
                + More
              </button>
            </div>
          )}
        </div>

        {/* Desktop View - Infinite Loop Grid */}
        <div className="hidden lg:grid grid-cols-3 gap-8">
          {[0, 1, 2].map((col) => (
            <div
              key={col}
              className="relative h-[620px] overflow-hidden"
            >
              <motion.div
                className="flex flex-col gap-8"
                animate={{
                  y: col === 1 ? ["-50%", "0%"] : ["0%", "-50%"],
                }}
                transition={{
                  duration: 18,
                  ease: "linear",
                  repeat: Infinity,
                }}
              >
                {loopTestimonials
                  .filter((_, i) => i % 3 === col)
                  .map((t, i) => (
                    <div
                      key={i}
                      className="
                        rounded-3xl p-8
                        backdrop-blur-xl backdrop-saturate-150
                        border border-white/40
                        bg-white/60
                        hover:shadow-[0_12px_40px_rgba(0,120,255,0.12)]
                        transition-all
                      "
                    >
                      {/* Stars */}
                      <div className="flex gap-1 mb-4 text-sm text-black">
                        ★★★★★
                      </div>

                      {/* Quote */}
                      <p className="text-sm leading-relaxed text-gray-700 mb-8">
                        "{t.quote}"
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="text-sm font-medium text-black">
                            {t.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {t.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}