"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Star,
  ExternalLink,
  ArrowRight,
  Calendar,
  ClipboardList,
  Hammer,
  Ship,
} from "lucide-react";
import { RapydlaunchHeader } from "@/components/rapydlaunch-header";
import { RapydlaunchFooter } from "@/components/rapydlaunch-footer";
import { serviceCategories, BRAND_RED } from "@/lib/rapydlaunch-data";
import { RapydlaunchLeadForm } from "@/components/rapydlaunch-lead-form";

const clientLogos = [
  "/clients/dm.svg",
  "/clients/as.svg",
  "/clients/medone.svg",
  "/clients/zuari.svg",
  "/clients/dmca.svg",
  "/clients/flp.svg",
  "/clients/serrisvg.svg",
  "/clients/smep.svg",
  "/clients/floro.svg",
];

const processSteps = [
  {
    step: 1,
    icon: Calendar,
    title: "Intro Call",
    description: "Discuss goals, challenges, and fit.",
    cta: "Schedule a Call",
    href: "https://cal.com/amansharma",
  },
  {
    step: 2,
    icon: ClipboardList,
    title: "Shaping Phase",
    description: "Define scope, edge cases, timeline, and budget.",
    cta: null,
    href: null,
  },
  {
    step: 3,
    icon: Hammer,
    title: "Build & Deliver",
    description: "Execute, iterate, and deliver working results fast.",
    cta: null,
    href: null,
  },
  {
    step: 4,
    icon: Ship,
    title: "Launch & Scale",
    description: "Go live, optimize, and grow - with ongoing support.",
    cta: null,
    href: null,
  },
];

export default function RapydlaunchPage() {
  const [formOpen, setFormOpen] = useState(false);

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
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, delay: 0.6, ease: "easeOut" }}
            className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px]"
            style={{ backgroundColor: "rgba(168, 85, 247, 0.2)" }}
          />
        </div>
      </div>

      <div className="relative z-10">
        <RapydlaunchHeader onGetStarted={() => setFormOpen(true)} />

        {/* Lead form modal */}
        <RapydlaunchLeadForm
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          sourcePage="/rapydlaunch"
        />

        {/* Hero */}
        <section className="pt-32 sm:pt-40 pb-20 sm:pb-28">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-900/80 backdrop-blur-sm border border-gray-800 mb-6">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-gray-300 font-medium">
                  Powered by Rapydlaunch
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-white leading-tight mb-6">
                Your Full-Service Digital Partner
               
              </h1>

              <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto mb-4">
                Video, design, development, marketing, AI, social media,
                influencer management, and everything in between - one team, one
                goal.
              </p>

              <p className="text-base text-gray-400 max-w-2xl mx-auto mb-8">
              Launch Anything in 45 Days
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  4.9/5 • 20+ reviews
                </span>
                <span className="text-gray-600">·</span>
                <span className="text-sm text-gray-400">
                  Trusted by 50+ founders & businesses worldwide
                </span>
                <span className="text-gray-600">·</span>
                <span className="text-sm text-gray-400">
                  100+ projects delivered
                </span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap items-center justify-center gap-4 mb-16"
              >
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
              </motion.div>

              {/* Clients */}
              <div className="mt-16">
                <p className="text-sm text-gray-400 mb-6 text-center">
                  Trusted by 100+ clients worldwide
                </p>
                <div
                  className="relative w-full overflow-hidden h-12 sm:h-16"
                  style={{
                    maskImage:
                      "linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,1) 90%, transparent 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,1) 90%, transparent 100%)",
                  }}
                >
                  <motion.div
                    className="flex items-center gap-8 sm:gap-12 h-full"
                    animate={{ x: [0, -(100 + 32) * 5] }}
                    transition={{
                      duration: 15,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{ willChange: "transform" }}
                  >
                    {[...clientLogos, ...clientLogos, ...clientLogos].map(
                      (logo, i) => (
                        <div
                          key={`${logo}-${i}`}
                          className="flex items-center justify-center h-full flex-shrink-0 px-4"
                          style={{ width: 100 }}
                        >
                          <img
                            src={logo}
                            alt=""
                            className="object-contain h-10 sm:h-12 w-auto opacity-40 brightness-0 invert hover:opacity-70 transition-all"
                            loading="lazy"
                          />
                        </div>
                      )
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Service Categories Grid */}
        <section className="py-20 sm:py-28">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-4">
                Everything You Need Under One Roof
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                11 categories, 66+ services - from video editing and graphic
                design to software development, marketing, social media,
                influencer management, and AI.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceCategories.map((cat, i) => (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                >
                  <Link
                    href={`/rapydlaunch/${cat.slug}`}
                    className="group block p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-[#ED1C24]/40 transition-all duration-300 h-full shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: "rgba(237, 28, 36, 0.12)" }}
                      >
                        <cat.icon
                          className="w-6 h-6"
                          style={{ color: BRAND_RED }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-white text-base leading-tight group-hover:text-[#ED1C24] transition-colors">
                          {cat.category}
                        </h3>
                        <p className="text-sm text-gray-400 mt-2 leading-relaxed line-clamp-2">
                          {cat.description}
                        </p>
                        <div className="flex items-center gap-1 mt-3 text-xs font-medium text-gray-500 group-hover:text-[#ED1C24] transition-colors">
                          <span>{cat.services.length} services</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* CTA after grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-14 text-center"
            >
              <button
                onClick={() => setFormOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold rounded-full transition-all shadow-lg cursor-pointer"
                style={{ backgroundColor: BRAND_RED }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#d0171e";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = BRAND_RED;
                }}
              >
                Get a Free Quote for Your Project
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* How We Work */}
        <section className="py-16 sm:py-24">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-3xl sm:text-4xl font-medium text-white mb-4">
                Here&apos;s how we work together
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Simple, transparent process from first call to launch.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {processSteps.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="flex gap-4 p-6 rounded-2xl bg-gray-900 border border-gray-800 shadow-sm"
                >
                  <span
                    className="flex w-12 h-12 rounded-xl text-white font-semibold items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: BRAND_RED }}
                  >
                    {step.step}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                      {step.description}
                    </p>
                    {step.cta && step.href && (
                      <a
                        href={step.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-3 text-sm font-medium transition-colors"
                        style={{ color: BRAND_RED }}
                      >
                        {step.cta}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-24">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl p-8 sm:p-12 text-center border border-[#ED1C24]/20"
              style={{
                background:
                  "linear-gradient(135deg, rgba(237,28,36,0.1) 0%, rgba(0,0,0,0) 60%)",
              }}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4">
                Let&apos;s build something great together
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto mb-8">
                Book a free consultation. We&apos;ll understand your
                requirements and share a custom plan within 24 hours.
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

        {/* Footer */}
        <RapydlaunchFooter />
      </div>
    </main>
  );
}
