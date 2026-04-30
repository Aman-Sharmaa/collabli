"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Code,
  Smartphone,
  Palette,
  Megaphone,
  Video,
  Wrench,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageHero } from "@/components/page-hero";

const services = [
  {
    title: "SaaS Development",
    description: "Scalable, secure web applications built for growth.",
    icon: Code,
    href: "/services/saas-development",
  },
  {
    title: "SaaS Maintenance",
    description: "Ongoing support, updates, and performance tuning.",
    icon: Wrench,
    href: "/services/saas-maintenance",
  },
  {
    title: "Mobile App Development",
    description: "Native iOS and Android applications.",
    icon: Smartphone,
    href: "/services/mobile-app-development",
  },
  {
    title: "SaaS Designing",
    description: "UI/UX that converts and delights users.",
    icon: Palette,
    href: "/services/saas-designing",
  },
  {
    title: "Marketing & Branding",
    description: "Growth-focused positioning and campaigns.",
    icon: Megaphone,
    href: "/services/marketing-branding",
  },
  {
    title: "Video Editing",
    description: "Product demos and brand storytelling.",
    icon: Video,
    href: "/services/video-editing",
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Header />
      <PageHero
        title="Our Services"
        subtitle="From build to launch and beyond,design, development, maintenance, and growth under one roof."
      />
      <section className="py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((s, index) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <Link href={s.href}>
                  <div className="group flex gap-4 p-6 sm:p-8 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgba(0,120,255,0.08)] hover:shadow-[0_12px_40px_rgba(0,120,255,0.12)] transition-all h-full">
                    <div className="w-12 h-12 rounded-xl bg-[#f8f6f2] flex items-center justify-center shrink-0 group-hover:bg-gray-100 transition">
                      <s.icon className="w-6 h-6 text-gray-700" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-black">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                        {s.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-700 group-hover:gap-2 transition-all">
                        Learn more
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16"
          >
            <Link href="/rapydlaunch">
              <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 sm:p-10 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      Powered by Rapydlaunch
                    </h3>
                    <p className="mt-1 text-gray-300">
                      Launch your business in 45 days,strategy, build, and go-to-market.
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-white/90 sm:shrink-0">
                  Learn more →
                </span>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
