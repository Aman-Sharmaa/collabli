"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  ArrowRight,
  Download,
  Utensils,
  ShoppingBag,
  CalendarDays,
  Clock,
  Zap,
  MapPin,
  Package,
  Leaf,
  Droplets,
  Ban,
  HandCoins,
  Check,
  Star,
  Eye,
  RefreshCcw,
  Share2,
  Globe,
  Gift,
  Video,
  Plane,
  Users,
} from "lucide-react";

/* ─── Animations ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};
const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Constants ─── */
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.gram.kalp";
const APP_STORE_URL = "https://apps.apple.com/in/app/gram-app-anything-in-minutes/id6756883358";

/* ─── Store Buttons (reused) ─── */
function StoreButtons({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const base =
    variant === "dark"
      ? "bg-gray-900 text-white hover:bg-black"
      : "bg-white text-gray-900 hover:bg-gray-50";
  const sub = variant === "dark" ? "text-gray-400" : "text-gray-500";

  return (
    <div className="flex flex-col xs:flex-row sm:flex-row flex-wrap gap-3 w-full xs:w-auto sm:w-auto">
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`group flex items-center justify-center gap-2.5 px-5 py-3.5 sm:py-3 rounded-xl ${base} transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]`}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
        <div className="text-left">
          <div className={`text-[9px] uppercase tracking-widest ${sub} leading-none`}>
            Download on the
          </div>
          <div className="text-sm font-semibold leading-tight">App Store</div>
        </div>
      </a>
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`group flex items-center justify-center gap-2.5 px-5 py-3.5 sm:py-3 rounded-xl ${base} transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]`}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
          <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 1.33c.576.333.576.862 0 1.196l-2.302 1.33-2.535-2.535 2.535-2.321zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
        </svg>
        <div className="text-left">
          <div className={`text-[9px] uppercase tracking-widest ${sub} leading-none`}>
            Get it on
          </div>
          <div className="text-sm font-semibold leading-tight">Google Play</div>
        </div>
      </a>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* PAGE                                                           */
/* ═══════════════════════════════════════════════════════════════ */
export default function GramPage() {
  return (
    <div className="relative min-h-screen bg-[#faf9f7] text-gray-900 overflow-hidden">
      {/* ── Fixed ambient background ── */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {/* Warm gradient blobs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute -top-[15%] -left-[10%] w-[55%] h-[55%] rounded-full blur-[130px]"
          style={{ backgroundColor: "rgba(201,89,66,0.07)" }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
          className="absolute top-[30%] -right-[8%] w-[45%] h-[45%] rounded-full blur-[120px]"
          style={{ backgroundColor: "rgba(224,114,92,0.06)" }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.6, ease: "easeOut" }}
          className="absolute -bottom-[10%] left-[20%] w-[50%] h-[40%] rounded-full blur-[110px]"
          style={{ backgroundColor: "rgba(201,89,66,0.05)" }}
        />

        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #C95942 1px, transparent 1px), linear-gradient(to bottom, #C95942 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <WhatWeDo />
          <MealPlan />
          <Promise />
          <DownloadCTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* HERO                                                           */
/* ═══════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative pt-24 pb-14 sm:pt-40 sm:pb-28 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          {/* Badge */}
          <motion.div variants={fadeUp} className="mb-5 sm:mb-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C95942]/8 border border-[#C95942]/10 text-xs sm:text-sm font-medium text-[#C95942]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C95942] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#C95942]" />
              </span>
              Live in 10 cities
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-[2rem] sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]"
          >
            <span className="bg-gradient-to-r from-[#C95942] to-[#e0725c] bg-clip-text text-transparent">Gram</span>
            <br />
            <span className="text-gray-900">Home Food, Grocery</span>
            <br />
            <span className="text-gray-900">&amp; Monthly Meals</span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} className="mt-4 sm:mt-5 text-[15px] sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Home food, oil-free options &amp; groceries in 30 min. No platform fee. No hidden charges. Just honest delivery.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} custom={3} className="mt-7 sm:mt-8 flex justify-center">
            <StoreButtons />
          </motion.div>

          {/* Trust strip */}
          <motion.div variants={fadeUp} custom={4} className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2">
            {[
              { icon: Leaf, t: "Hygienic" },
              { icon: Droplets, t: "Oil-free" },
              { icon: Ban, t: "No platform fee" },
              { icon: HandCoins, t: "No hidden fees" },
              { icon: Clock, t: "30 min delivery" },
            ].map((p) => (
              <span key={p.t} className="inline-flex items-center gap-1.5 text-[11px] sm:text-sm text-gray-400">
                <p.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {p.t}
              </span>
            ))}
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadeUp} custom={5} className="mt-10 sm:mt-14 grid grid-cols-3 max-w-xs sm:max-w-md mx-auto">
            {[
              { v: "200+", l: "Outlets" },
              { v: "10", l: "Cities" },
              { v: "10K+", l: "Orders" },
            ].map((s, i) => (
              <div key={s.l} className={`text-center ${i !== 0 ? "border-l border-gray-100" : ""}`}>
                <p className="text-xl sm:text-3xl font-bold text-gray-900">{s.v}</p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">{s.l}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* WHAT WE DO — Two categories                                    */
/* ═══════════════════════════════════════════════════════════════ */
function WhatWeDo() {
  const categories = [
    {
      icon: Utensils,
      title: "Home Food",
      desc: "Home-style, hygienic, oil-free meals delivered to your door. Subscribe to monthly plans, order instantly, watch live cooking, and even earn by sharing.",
      points: ["Monthly meal schedules", "Immediate orders", "Watch live cooking", "Create & share plans — earn 1%"],
      accent: "bg-orange-50 text-orange-600",
      accentBg: "bg-orange-50",
    },
    {
      icon: ShoppingBag,
      title: "Grocery & Anything",
      desc: "Groceries, medicines, essentials — anything delivered in 30 minutes.",
      points: ["30-minute delivery", "200+ partner stores", "Zero platform fee"],
      accent: "bg-emerald-50 text-emerald-600",
      accentBg: "bg-emerald-50",
    },
  ];

  return (
    <section id="features" className="py-14 sm:py-24 border-t border-gray-200/30">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-10 sm:mb-14"
        >
          <motion.p variants={fadeUp} className="text-xs sm:text-sm font-semibold text-[#C95942] tracking-wider uppercase mb-2">
            What we do
          </motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="text-2xl sm:text-4xl font-bold tracking-tight">
            One app, every need
          </motion.h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              custom={i}
              className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-sm p-5 sm:p-8 hover:shadow-lg hover:shadow-gray-100/40 transition-all duration-300"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${cat.accent.split(" ")[0]} flex items-center justify-center mb-4 sm:mb-5`}>
                <cat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${cat.accent.split(" ")[1]}`} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2">{cat.title}</h3>
              <p className="text-gray-500 text-[13px] sm:text-sm leading-relaxed mb-4 sm:mb-5">{cat.desc}</p>
              <ul className="space-y-2 sm:space-y-2.5">
                {cat.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 sm:gap-2.5 text-[13px] sm:text-sm text-gray-600">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C95942] shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* MEAL PLAN — What happens after you schedule                    */
/* ═══════════════════════════════════════════════════════════════ */
function MealPlan() {
  const perks = [
    {
      icon: Video,
      title: "Watch Live Cooking",
      desc: "See your meal being prepared in real-time. Full transparency from kitchen to doorstep.",
      color: "text-violet-600 bg-violet-50",
      num: "01",
    },
    {
      icon: Plane,
      title: "Moving Cities? No Worries",
      desc: "Relocating to another city? Continue the same plan there or get a full refund — your choice.",
      color: "text-blue-600 bg-blue-50",
      num: "02",
    },
    {
      icon: Share2,
      title: "Create, Share & Earn",
      desc: "Build your own meal plan and share it with anyone. Earn 1% on every successful redeem — up to 10 people.",
      color: "text-emerald-600 bg-emerald-50",
      num: "03",
    },
    {
      icon: Globe,
      title: "All Regions, All Cuisines",
      desc: "North Indian, South Indian, Chinese, Continental — every cuisine, every region. Plans for every palate.",
      color: "text-orange-600 bg-orange-50",
      num: "04",
    },
  ];

  return (
    <section className="relative py-14 sm:py-24">
      {/* Section accent bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#C95942]/[0.03] via-transparent to-transparent pointer-events-none" />
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-10 sm:mb-14"
        >
          <motion.p variants={fadeUp} className="text-xs sm:text-sm font-semibold text-[#C95942] tracking-wider uppercase mb-2">
            After you schedule
          </motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="text-2xl sm:text-4xl font-bold tracking-tight">
            Your meal plan, supercharged
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-2.5 sm:mt-3 text-[13px] sm:text-base text-gray-500 max-w-lg mx-auto leading-relaxed">
            Scheduling is just the start. Here&apos;s what makes Gram meal plans unlike anything else.
          </motion.p>
        </motion.div>

        {/* Perks Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="grid sm:grid-cols-2 gap-3.5 sm:gap-5"
        >
          {perks.map((perk, i) => (
            <motion.div
              key={perk.title}
              variants={fadeUp}
              custom={i}
              className="group bg-white/70 backdrop-blur-sm rounded-2xl p-5 sm:p-7 border border-white/60 hover:shadow-lg hover:shadow-gray-100/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-start gap-3.5 sm:gap-5">
                {/* Icon */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${perk.color} flex items-center justify-center shrink-0`}>
                  <perk.icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                    <h3 className="font-bold text-[15px] sm:text-base text-gray-900">{perk.title}</h3>
                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-300 tracking-wider">{perk.num}</span>
                  </div>
                  <p className="text-[13px] sm:text-sm text-gray-500 leading-relaxed">{perk.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom highlight */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-8 sm:mt-10 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-3"
        >
          {[
            { icon: Eye, t: "Full Transparency" },
            { icon: RefreshCcw, t: "Flexible Plans" },
            { icon: Gift, t: "Earn by Sharing" },
            { icon: Users, t: "All Regions Covered" },
          ].map((tag) => (
            <span key={tag.t} className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm text-gray-400">
              <tag.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C95942]" />
              <span className="font-medium">{tag.t}</span>
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* THE GRAM PROMISE — Hygiene, Oil-free, No fees                  */
/* ═══════════════════════════════════════════════════════════════ */
function Promise() {
  const items = [
    { icon: Leaf, title: "100% Hygienic", desc: "Every kitchen audited. Every meal safe.", color: "text-rose-500 bg-rose-50" },
    { icon: Droplets, title: "Oil-Free Options", desc: "Health-first, minimal-oil cooking.", color: "text-sky-500 bg-sky-50" },
    { icon: Ban, title: "No Hidden Fees", desc: "What you see is what you pay.", color: "text-amber-500 bg-amber-50" },
    { icon: HandCoins, title: "Zero Platform Fee", desc: "No extra charges. Ever.", color: "text-emerald-500 bg-emerald-50" },
  ];

  return (
    <section className="relative py-14 sm:py-24">
      <div className="absolute inset-0 bg-gradient-to-t from-[#C95942]/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-10 sm:mb-14"
        >
          <motion.p variants={fadeUp} className="text-xs sm:text-sm font-semibold text-[#C95942] tracking-wider uppercase mb-2">
            Our promise
          </motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="text-2xl sm:text-4xl font-bold tracking-tight">
            Why people trust Gram
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
        >
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              custom={i}
              className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/60 text-center hover:shadow-md hover:shadow-gray-100/40 transition-shadow duration-300"
            >
              <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl ${item.color} flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-bold text-[13px] sm:text-base mb-0.5 sm:mb-1">{item.title}</h3>
              <p className="text-[11px] sm:text-sm text-gray-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* DOWNLOAD CTA                                                   */
/* ═══════════════════════════════════════════════════════════════ */
function DownloadCTA() {
  return (
    <section id="download" className="pb-14 sm:pb-24">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="relative rounded-2xl bg-gradient-to-br from-[#C95942] to-[#e0725c] p-7 sm:p-14 text-center overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative z-10">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Download Gram Today
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-white/80 max-w-md mx-auto">
              Your first delivery is on us. Available on iOS &amp; Android.
            </p>
            <div className="mt-6 sm:mt-8 flex justify-center">
              <StoreButtons variant="light" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

