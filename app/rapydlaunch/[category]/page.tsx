"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  getCategoryBySlug,
  serviceCategories,
  BRAND_RED,
} from "@/lib/rapydlaunch-data";
import {
  ArrowRight,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { RapydlaunchHeader } from "@/components/rapydlaunch-header";
import { RapydlaunchFooter } from "@/components/rapydlaunch-footer";
import { RapydlaunchLeadForm } from "@/components/rapydlaunch-lead-form";

export default function CategoryPage() {
  const [formOpen, setFormOpen] = useState(false);
  const params = useParams();
  const slug = params?.category as string;
  const cat = getCategoryBySlug(slug);

  if (!cat) {
    notFound();
  }

  // Find next/prev categories for navigation
  const currentIndex = serviceCategories.findIndex((c) => c.slug === slug);
  const prevCat = currentIndex > 0 ? serviceCategories[currentIndex - 1] : null;
  const nextCat =
    currentIndex < serviceCategories.length - 1
      ? serviceCategories[currentIndex + 1]
      : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      {/* Background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-2/3">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute bottom-0 left-0 w-[800px] h-[600px] rounded-full blur-[150px]"
            style={{ backgroundColor: "rgba(147, 51, 234, 0.3)" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
            className="absolute bottom-0 right-0 w-[700px] h-[500px] rounded-full blur-[140px]"
            style={{ backgroundColor: "rgba(59, 130, 246, 0.25)" }}
          />
        </div>
      </div>

      <div className="relative z-10">
        <RapydlaunchHeader onGetStarted={() => setFormOpen(true)} />

        {/* Lead form modal */}
        <RapydlaunchLeadForm
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          serviceCategory={cat.category}
          serviceCategorySlug={cat.slug}
          sourcePage={`/rapydlaunch/${cat.slug}`}
        />

        {/* Hero */}
        <section className="pt-32 sm:pt-40 pb-16 sm:pb-20">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                <Link
                  href="/rapydlaunch"
                  className="hover:text-gray-300 transition-colors"
                >
                  Rapydlaunch
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-gray-300">{cat.category}</span>
              </div>

              {/* Category icon + title */}
              <div className="max-w-3xl">
                <div className="flex items-start gap-5 mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(237, 28, 36, 0.15)" }}
                  >
                    <cat.icon
                      className="w-8 h-8"
                      style={{ color: BRAND_RED }}
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white leading-tight">
                      {cat.category}
                    </h1>
                    <p className="text-gray-300 mt-3 text-lg sm:text-xl max-w-2xl leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                {/* Long description */}
                <p
                  className="text-gray-400 text-base leading-relaxed max-w-3xl mt-6 mb-8 border-l-2 pl-5"
                  style={{ borderColor: BRAND_RED }}
                >
                  {cat.longDescription}
                </p>

                {/* CTA */}
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setFormOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-semibold rounded-full transition-all shadow-lg cursor-pointer"
                    style={{ backgroundColor: BRAND_RED }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#d0171e";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = BRAND_RED;
                    }}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <a
                    href="https://cal.com/amansharma"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-transparent hover:bg-gray-800 text-gray-300 text-sm font-medium rounded-full border border-gray-700 transition-all"
                  >
                    Book a Call
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 sm:py-24">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <h2 className="text-2xl sm:text-3xl font-medium text-white mb-2">
                What we offer
              </h2>
              <p className="text-gray-400">
                {cat.services.length} specialized services under {cat.shortName}.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.services.map((service, i) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="group p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-[#ED1C24]/40 transition-all duration-300 shadow-sm"
                >
                  <div className="flex gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "rgba(237, 28, 36, 0.12)" }}
                    >
                      <service.icon
                        className="w-6 h-6"
                        style={{ color: BRAND_RED }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white text-base leading-tight">
                        {service.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Rapydlaunch */}
        <section className="py-16 sm:py-24">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-gray-900 border border-gray-800 p-8 sm:p-12"
            >
              <h2 className="text-2xl sm:text-3xl font-medium text-white mb-8">
                Why Rapydlaunch for {cat.shortName}?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  "India-based team, international quality. Save 50-70% vs US/UK agencies",
                  "Fast turnarounds. Most deliverables in 24-72 hours",
                  "Dedicated project manager and direct Slack/WhatsApp communication",
                  "Scalable. Ramp up or down based on your needs",
                  "Transparent pricing. No hidden fees, no surprise invoices",
                  "Trusted by 50+ businesses across USA, UK, Europe, and Middle East",
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: "rgba(237, 28, 36, 0.2)" }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: BRAND_RED }}
                      />
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-24">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl p-8 sm:p-12 text-center border border-[#ED1C24]/20"
              style={{
                background:
                  "linear-gradient(135deg, rgba(237,28,36,0.1) 0%, rgba(0,0,0,0) 60%)",
              }}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4">
                Ready to get started with {cat.shortName}?
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto mb-8">
                Book a free consultation call. We&apos;ll understand your
                requirements and share a custom plan and pricing within 24
                hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setFormOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white text-sm font-semibold rounded-full transition-all shadow-lg cursor-pointer"
                  style={{ backgroundColor: BRAND_RED }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#d0171e";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = BRAND_RED;
                  }}
                >
                  Get a Free Quote
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="https://cal.com/amansharma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-gray-300 text-sm font-medium rounded-full border border-gray-700 hover:text-white hover:border-gray-500 transition-all"
                >
                  Book a Call Instead
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Prev / Next navigation */}
        <section className="pb-16">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row gap-4">
              {prevCat && (
                <Link
                  href={`/rapydlaunch/${prevCat.slug}`}
                  className="flex-1 group flex items-center gap-4 p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-600 transition-all"
                >
                  <ArrowRight className="w-5 h-5 text-gray-500 rotate-180 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                      Previous
                    </span>
                    <p className="text-sm text-gray-300 font-medium truncate group-hover:text-white transition-colors">
                      {prevCat.shortName}
                    </p>
                  </div>
                </Link>
              )}
              {nextCat && (
                <Link
                  href={`/rapydlaunch/${nextCat.slug}`}
                  className="flex-1 group flex items-center justify-end gap-4 p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-600 transition-all text-right"
                >
                  <div className="min-w-0">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                      Next
                    </span>
                    <p className="text-sm text-gray-300 font-medium truncate group-hover:text-white transition-colors">
                      {nextCat.shortName}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 shrink-0" />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Browse all services link */}
        <section className="pb-16">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Link
              href="/rapydlaunch"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Browse all 11 service categories
            </Link>
          </div>
        </section>

        {/* Footer */}
        <RapydlaunchFooter />
      </div>
    </main>
  );
}
