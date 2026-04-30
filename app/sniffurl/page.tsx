"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Menu,
  X,
  ArrowRight,
  Link2,
  BarChart3,
  Code2,
  Globe,
  Smartphone,
  ExternalLink,
  Check,
  Star,
  Layers,
  GitBranch,
  TrendingUp,
  MousePointerClick,
  Activity,
  Target,
  Zap,
  Shield,
  Fingerprint,
  Route,
  Loader2,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Building2,
  Sparkles,
} from "lucide-react";

/* ─── Animations ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};
const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Constants ─── */
const APP_URL = "https://app.sniffurl.com";
const CTA_URL = "https://cal.com/amansharma";

/* ═══════════════════════════════════════════════════════════════ */
/* PAGE                                                           */
/* ═══════════════════════════════════════════════════════════════ */
export default function SniffURLPage() {
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const openForm = () => setLeadFormOpen(true);

  return (
    <div className="relative min-h-screen bg-[#070707] text-white selection:bg-lime-400/20 selection:text-lime-300">
      {/* ── Fixed ambient bg ── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[30%] -left-[15%] w-[70%] h-[70%] rounded-full blur-[160px] bg-lime-500/[0.04]" />
        <div className="absolute top-[50%] -right-[15%] w-[55%] h-[55%] rounded-full blur-[140px] bg-emerald-500/[0.03]" />
        <div className="absolute -bottom-[20%] left-[30%] w-[50%] h-[50%] rounded-full blur-[130px] bg-lime-500/[0.025]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(163,230,53,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.4) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      <div className="relative z-10">
        <Header />
        <main>
          <Hero onOpenForm={openForm} />
          <Stats />
          <Clients />
          <Pricing onOpenForm={openForm} />
          <Features />
          <DashboardShowcase />
          <SDKSection />
          <TestimonialsSection />
          <FAQSection />
          <BottomCTA onOpenForm={openForm} />
        </main>
        <Footer />
      </div>

      {/* Lead form modal */}
      <LeadFormModal isOpen={leadFormOpen} onClose={() => setLeadFormOpen(false)} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* HERO                                                           */
/* ═══════════════════════════════════════════════════════════════ */
function Hero({ onOpenForm }: { onOpenForm: () => void }) {
  return (
    <section className="relative pt-28 pb-10 sm:pt-44 sm:pb-20 overflow-hidden">
      {/* Floating annotations — desktop only */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute top-[22%] left-[4%] -rotate-6 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/30 font-mono backdrop-blur-sm">
          campaigns.track(click)
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute top-[18%] right-[5%] rotate-3 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/30 font-mono backdrop-blur-sm">
          sniffurl.io/y8kQ2m
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 0.6 }}
          className="absolute bottom-[28%] left-[8%] rotate-2 px-3 py-1.5 rounded-lg bg-lime-400/[0.06] border border-lime-400/10 text-[11px] text-lime-400/50 font-mono backdrop-blur-sm">
          conversion_rate: 23.7%
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8, duration: 0.6 }}
          className="absolute bottom-[32%] right-[6%] -rotate-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/30 font-mono backdrop-blur-sm">
          sdk.init(config)
        </motion.div>
      </div>

      <div className="max-w-[860px] mx-auto px-5 sm:px-6 text-center relative">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          {/* Badge */}
          <motion.div variants={fadeUp} className="mb-6 sm:mb-7">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-lime-400/15 bg-lime-400/[0.06] text-[11px] sm:text-xs text-lime-400 font-medium tracking-wide">
              <Activity className="w-3 h-3" />
              Deep Linking &amp; Analytics Platform
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={fadeUp} custom={1} className="text-[2.2rem] leading-[1.08] sm:text-6xl lg:text-7xl font-bold tracking-[-0.03em]">
            <span className="text-white/90">Sniff Out</span>
            <br className="sm:hidden" />{" "}
            <span className="text-white/90">Your&nbsp;</span>
            <span className="relative">
              <span className="bg-gradient-to-r from-lime-300 via-lime-400 to-emerald-400 bg-clip-text text-transparent">Customers</span>
              <svg className="absolute -bottom-1.5 left-0 w-full" viewBox="0 0 200 8" fill="none"><path d="M2 5.5Q50 1 100 4.5T198 3" stroke="url(#ug)" strokeWidth="2.5" strokeLinecap="round" /><defs><linearGradient id="ug" x1="0" y1="0" x2="200" y2="0"><stop stopColor="#bef264" /><stop offset="1" stopColor="#34d399" /></linearGradient></defs></svg>
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} className="mt-5 sm:mt-7 text-[15px] sm:text-lg text-white/35 max-w-xl mx-auto leading-relaxed">
            Deep linking, real-time analytics, campaign management &amp; cross-platform SDKs. Everything to understand, reach &amp; convert.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} custom={3} className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={onOpenForm}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-lime-400 text-black text-sm font-semibold hover:bg-lime-300 active:scale-[0.97] transition-all shadow-[0_0_30px_rgba(163,230,53,0.15)]">
              <Zap className="w-4 h-4" />
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <Link href={APP_URL}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] active:scale-[0.97] transition-all">
              Login
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Sub-CTA trust */}
          <motion.div variants={fadeUp} custom={4} className="mt-6 flex items-center justify-center gap-5 sm:gap-7 text-[11px] text-white/25">
            {["100% Free", "All features", "No credit card"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-lime-400/50" /> {t}
              </span>
            ))}
          </motion.div>

          {/* Rating */}
          <motion.div variants={fadeUp} custom={5} className="mt-5 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            ))}
            <span className="text-[11px] text-white/25 ml-1.5">5.0 on Product Hunt</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* STATS                                                          */
/* ═══════════════════════════════════════════════════════════════ */
function Stats() {
  const items = [
    { v: "50M+", l: "Links Created", icon: Link2 },
    { v: "120+", l: "Countries", icon: Globe },
    { v: "99.9%", l: "Uptime", icon: Shield },
    { v: "10K+", l: "Teams", icon: Fingerprint },
  ];
  return (
    <section className="py-8 sm:py-12 border-y border-white/[0.04]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-0">
        {items.map((s, i) => (
          <motion.div
            key={s.l}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className={`flex flex-col items-center text-center ${i > 0 ? "sm:border-l sm:border-white/[0.04]" : ""}`}
          >
            <s.icon className="w-4 h-4 text-lime-400/40 mb-2" />
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{s.v}</p>
            <p className="text-[10px] sm:text-[11px] text-white/25 mt-0.5 uppercase tracking-wider">{s.l}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* CLIENTS — Same logos as homepage                               */
/* ═══════════════════════════════════════════════════════════════ */
const clientLogos = [
  "/clients/dm.svg",
  "/clients/as.svg",
  "/clients/medone.svg",
  "/clients/zuari.svg",
  "/clients/dmca.svg",
  "/clients/flp.svg",
  "/clients/smep.svg",
  "/clients/floro.svg",
  "/clients/serrisvg.svg",
  "/clients/pmc.png",
];

const LOGO_WIDTH = 80;
const LOGO_GAP = 28;
const MARQUEE_TRACK = clientLogos.length * LOGO_WIDTH + (clientLogos.length - 1) * LOGO_GAP;

function Clients() {
  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
        <p className="text-[11px] sm:text-xs text-white/20 uppercase tracking-[0.15em] mb-5">Trusted by 100+ clients</p>
        <div
          className="relative w-full overflow-hidden h-10 sm:h-12"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          }}
        >
          <motion.div
            className="flex items-center h-full w-max"
            style={{ gap: LOGO_GAP }}
            animate={{ x: [0, -MARQUEE_TRACK] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {[...clientLogos, ...clientLogos].map((logo, i) => (
              <div key={`${logo}-${i}`} className="flex items-center justify-center h-full flex-shrink-0" style={{ width: LOGO_WIDTH }}>
                <img
                  src={logo}
                  alt=""
                  className="object-contain h-7 sm:h-9 w-full max-w-[80px] opacity-40 hover:opacity-70 transition-opacity"
                  style={{ filter: "grayscale(100%) brightness(2) invert(1)" }}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* PRICING — Free, all features                                   */
/* ═══════════════════════════════════════════════════════════════ */
function Pricing({ onOpenForm }: { onOpenForm: () => void }) {
  const features = [
    "Unlimited deep links",
    "Real-time analytics dashboard",
    "Campaign management",
    "Custom branded domains",
    "iOS, Android & Web SDKs",
    "React Native & Flutter support",
    "Multi-touch attribution",
    "A/B testing & experiments",
    "Team collaboration",
    "REST API access",
    "Deferred deep linking",
    "Priority support",
  ];

  return (
    <section id="pricing" className="py-16 sm:py-28 border-t border-white/[0.04]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-10 sm:mb-14">
          <motion.p variants={fadeUp} className="text-[11px] sm:text-xs font-semibold text-lime-400/70 tracking-[0.2em] uppercase mb-3">Pricing</motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Free. <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent italic">Forever.</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-3 sm:mt-4 text-[13px] sm:text-[15px] text-white/25 max-w-lg mx-auto">
            Every feature. Every SDK. No credit card. No hidden charges. Just build.
          </motion.p>
        </motion.div>

        {/* Pricing card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-lg mx-auto relative"
        >
          {/* Glow */}
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-lime-400/40 to-transparent" />

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
            {/* Card header */}
            <div className="px-6 sm:px-8 pt-7 sm:pt-9 pb-6 text-center border-b border-white/[0.04]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/15 text-lime-400 text-[11px] font-semibold tracking-wide mb-5">
                <Sparkles className="w-3 h-3" /> ALL ACCESS
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl sm:text-6xl font-bold tracking-tight text-white">$0</span>
                <span className="text-white/20 text-sm">/month</span>
              </div>
              <p className="mt-3 text-[13px] text-white/30">All features included. No limits.</p>
            </div>

            {/* Feature grid */}
            <div className="px-6 sm:px-8 py-6 sm:py-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-lime-400/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-lime-400" />
                    </div>
                    <span className="text-[13px] text-white/50">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 sm:px-8 pb-7 sm:pb-9">
              <button onClick={onOpenForm}
                className="group w-full inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-lime-400 text-black text-sm font-semibold hover:bg-lime-300 active:scale-[0.97] transition-all shadow-[0_0_30px_rgba(163,230,53,0.15)]">
                <Zap className="w-4 h-4" />
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <p className="text-center mt-3 text-[11px] text-white/15 flex items-center justify-center gap-3">
                <span className="flex items-center gap-1"><Check className="w-2.5 h-2.5 text-lime-400/40" /> No credit card</span>
                <span className="flex items-center gap-1"><Check className="w-2.5 h-2.5 text-lime-400/40" /> Instant access</span>
                <span className="flex items-center gap-1"><Check className="w-2.5 h-2.5 text-lime-400/40" /> Free forever</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* FEATURES — Bento Grid                                          */
/* ═══════════════════════════════════════════════════════════════ */
function Features() {
  return (
    <section id="features" className="py-16 sm:py-28">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-12 sm:mb-16">
          <motion.p variants={fadeUp} className="text-[11px] sm:text-xs font-semibold text-lime-400/70 tracking-[0.2em] uppercase mb-3">Features</motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="text-2xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.15]">
            Everything to Sniff,
            <br />
            <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">Track &amp; Convert</span>
          </motion.h2>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Deep Linking — large card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="lg:col-span-2 relative rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-lime-400/30 via-transparent to-transparent" />
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-lime-400/10 border border-lime-400/10 flex items-center justify-center shrink-0">
                <Route className="w-5 h-5 sm:w-6 sm:h-6 text-lime-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">Deep Linking</h3>
                <p className="text-[13px] sm:text-sm text-white/35 leading-relaxed mb-5">
                  Route users to the right in-app content on any platform. Deferred deep links work seamlessly even through app installs.
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {["Universal links", "Deferred linking", "Custom domains", "Smart redirects"].map((p) => (
                    <span key={p} className="flex items-center gap-2 text-[12px] sm:text-[13px] text-white/30">
                      <Check className="w-3 h-3 text-lime-400/60 shrink-0" /> {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Analytics — tall card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.5 }}
            className="lg:row-span-2 relative rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-cyan-500/[0.04] to-white/[0.01] border border-white/[0.06] overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-cyan-400/30 via-transparent to-transparent" />
            <div className="w-11 h-11 rounded-xl bg-cyan-400/10 border border-cyan-400/10 flex items-center justify-center mb-5">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">Real-Time Analytics</h3>
            <p className="text-[13px] sm:text-sm text-white/35 leading-relaxed mb-6">
              Track every click, install, and event. Understand your funnel with dashboards that update in real-time.
            </p>
            {/* Mini chart */}
            <div className="mt-auto rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
              <div className="flex items-end gap-1 h-20">
                {[35, 55, 40, 70, 60, 85, 75, 50, 65, 80, 55, 90].map((h, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-cyan-400/60 to-cyan-400/20 rounded-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-white/20">Jan</span>
                <span className="text-[10px] text-cyan-400/60 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +32.5%
                </span>
                <span className="text-[10px] text-white/20">Dec</span>
              </div>
            </div>
            <ul className="mt-5 space-y-2">
              {["Live event tracking", "Funnel analysis", "Cohort reports", "Custom dashboards"].map((p) => (
                <li key={p} className="flex items-center gap-2 text-[12px] sm:text-[13px] text-white/30">
                  <Check className="w-3 h-3 text-cyan-400/60 shrink-0" /> {p}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Campaign Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.5 }}
            className="relative rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-violet-500/[0.04] to-white/[0.01] border border-white/[0.06] overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-violet-400/30 via-transparent to-transparent" />
            <div className="w-11 h-11 rounded-xl bg-violet-400/10 border border-violet-400/10 flex items-center justify-center mb-5">
              <Target className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">Campaign Management</h3>
            <p className="text-[13px] sm:text-sm text-white/35 leading-relaxed mb-4">
              Launch, measure &amp; A/B test across every channel. Multi-touch attribution built in.
            </p>
            <ul className="space-y-2">
              {["Multi-channel", "A/B testing", "Attribution", "ROI tracking"].map((p) => (
                <li key={p} className="flex items-center gap-2 text-[12px] sm:text-[13px] text-white/30">
                  <Check className="w-3 h-3 text-violet-400/60 shrink-0" /> {p}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* All SDKs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.5 }}
            className="relative rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-amber-500/[0.04] to-white/[0.01] border border-white/[0.06] overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-amber-400/30 via-transparent to-transparent" />
            <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/10 flex items-center justify-center mb-5">
              <Code2 className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">All Tech SDKs</h3>
            <p className="text-[13px] sm:text-sm text-white/35 leading-relaxed mb-4">
              Native SDKs for every platform. Install in under 5 minutes. Zero compromises.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["iOS", "Android", "React Native", "Flutter", "Web", "REST API"].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[10px] sm:text-[11px] text-white/30 font-medium">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* DASHBOARD SHOWCASE                                             */
/* ═══════════════════════════════════════════════════════════════ */
function DashboardShowcase() {
  return (
    <section className="py-16 sm:py-28">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-10 sm:mb-14">
          <motion.p variants={fadeUp} className="text-[11px] sm:text-xs font-semibold text-lime-400/70 tracking-[0.2em] uppercase mb-3">Dashboard</motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="text-2xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.15]">
            Beautiful Interface.
            <br />
            <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">Powerful Results.</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-3 sm:mt-4 text-[13px] sm:text-[15px] text-white/30 max-w-md mx-auto">
            A stunning dashboard that makes complex data simple and actionable.
          </motion.p>
        </motion.div>

        {/* Dashboard frame */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-2xl border border-white/[0.06] bg-[#0c0c0c] overflow-hidden"
        >
          {/* Top glow line */}
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-lime-400/40 to-transparent" />

          {/* Window chrome */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.04]">
            <span className="w-2.5 h-2.5 rounded-full bg-white/[0.06]" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/[0.06]" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/[0.06]" />
            <span className="ml-3 text-[10px] text-white/15 font-mono">app.sniffurl.com/dashboard</span>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
              {[
                { label: "Total Clicks", value: "2.79M", change: "+32.5%", icon: MousePointerClick, color: "text-lime-400" },
                { label: "Active Users", value: "479K", change: "+17%", icon: Activity, color: "text-cyan-400" },
                { label: "Conversions", value: "12,543", change: "+24%", icon: TrendingUp, color: "text-violet-400" },
                { label: "Campaigns", value: "47", change: "+8", icon: Target, color: "text-amber-400" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3.5 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] sm:text-[11px] text-white/25 uppercase tracking-wider">{s.label}</p>
                    <s.icon className={`w-3.5 h-3.5 ${s.color} opacity-40`} />
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-white tracking-tight">{s.value}</p>
                  <p className={`text-[11px] ${s.color} mt-0.5 font-medium opacity-70`}>{s.change}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="rounded-xl bg-white/[0.015] border border-white/[0.04] p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[11px] text-white/20 uppercase tracking-wider">Last 7 Days</p>
                  <p className="text-sm font-semibold text-white/80 mt-0.5">Link Performance</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[10px] text-white/25"><span className="w-1.5 h-1.5 rounded-full bg-lime-400" /> Clicks</span>
                  <span className="flex items-center gap-1.5 text-[10px] text-white/25"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Installs</span>
                </div>
              </div>
              <div className="flex items-end gap-[3px] sm:gap-1.5 h-24 sm:h-36">
                {[35, 55, 45, 70, 60, 85, 75, 50, 68, 82, 62, 78, 88, 95, 72, 58, 84, 68, 78, 65, 72, 90, 80, 70].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-px">
                    <div className="w-full rounded-[2px] bg-lime-400/70" style={{ height: `${h}%` }} />
                    <div className="w-full rounded-[2px] bg-cyan-400/30" style={{ height: `${h * 0.35}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* SDK SECTION                                                    */
/* ═══════════════════════════════════════════════════════════════ */
function SDKSection() {
  const sdks = [
    { name: "iOS", icon: Smartphone, lang: "Swift" },
    { name: "Android", icon: Smartphone, lang: "Kotlin" },
    { name: "React Native", icon: Layers, lang: "TypeScript" },
    { name: "Flutter", icon: Layers, lang: "Dart" },
    { name: "Web", icon: Globe, lang: "JavaScript" },
    { name: "REST API", icon: GitBranch, lang: "Any" },
  ];

  return (
    <section id="sdks" className="py-16 sm:py-28 border-t border-white/[0.04]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left — text + SDKs grid */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp} className="text-[11px] sm:text-xs font-semibold text-lime-400/70 tracking-[0.2em] uppercase mb-3">SDKs &amp; Integrations</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl sm:text-4xl font-bold tracking-tight leading-[1.15] mb-4">
              Works With
              <br />
              Every Stack
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-[13px] sm:text-[15px] text-white/30 leading-relaxed mb-8 max-w-sm">
              Install in under 5 minutes. Native performance on every platform. Zero compromises.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {sdks.map((sdk) => (
                <div key={sdk.name} className="rounded-xl p-3.5 sm:p-4 bg-white/[0.02] border border-white/[0.05] hover:border-lime-400/15 hover:bg-white/[0.04] transition-all group text-center">
                  <sdk.icon className="w-5 h-5 text-lime-400/50 group-hover:text-lime-400/80 mx-auto mb-2 transition-colors" />
                  <p className="text-[12px] sm:text-[13px] font-semibold text-white/70">{sdk.name}</p>
                  <p className="text-[9px] sm:text-[10px] text-white/20 mt-0.5">{sdk.lang}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — code block */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="rounded-2xl border border-white/[0.06] bg-[#0c0c0c] overflow-hidden"
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-white/[0.04]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]/60" />
              <span className="ml-3 text-[10px] text-white/15 font-mono">app.tsx</span>
            </div>
            <div className="p-4 sm:p-5 overflow-x-auto">
              <pre className="text-[12px] sm:text-[13px] leading-[1.7] font-mono">
                <code>
                  <span className="text-white/15">{"// Install"}</span>{"\n"}
                  <span className="text-lime-400/80">npm</span><span className="text-white/30"> i </span><span className="text-cyan-400/70">@kalporg/sniffurl</span>{"\n"}
                  {"\n"}
                  <span className="text-white/15">{"// Initialize"}</span>{"\n"}
                  <span className="text-violet-400/70">import</span><span className="text-white/30"> {"{ "}</span><span className="text-white/50">SniffURL</span><span className="text-white/30">{" }"} </span><span className="text-violet-400/70">from</span><span className="text-cyan-400/70"> &apos;@kalporg/sniffurl&apos;</span>{"\n"}
                  {"\n"}
                  <span className="text-white/50">SniffURL</span><span className="text-white/20">.</span><span className="text-lime-400/80">init</span><span className="text-white/20">{"({"}</span>{"\n"}
                  <span className="text-white/30">{"  "}apiKey</span><span className="text-white/15">: </span><span className="text-cyan-400/70">&apos;sk_live_...&apos;</span><span className="text-white/15">,</span>{"\n"}
                  <span className="text-white/30">{"  "}debug</span><span className="text-white/15">: </span><span className="text-amber-400/70">true</span>{"\n"}
                  <span className="text-white/20">{"})"}</span>{"\n"}
                  {"\n"}
                  <span className="text-white/15">{"// Track events"}</span>{"\n"}
                  <span className="text-white/50">SniffURL</span><span className="text-white/20">.</span><span className="text-lime-400/80">track</span><span className="text-white/20">(</span><span className="text-cyan-400/70">&apos;purchase&apos;</span><span className="text-white/15">, {"{"}</span>{"\n"}
                  <span className="text-white/30">{"  "}amount</span><span className="text-white/15">: </span><span className="text-amber-400/70">49.99</span><span className="text-white/15">,</span>{"\n"}
                  <span className="text-white/30">{"  "}currency</span><span className="text-white/15">: </span><span className="text-cyan-400/70">&apos;USD&apos;</span>{"\n"}
                  <span className="text-white/15">{"})"}</span>
                </code>
              </pre>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* TESTIMONIALS — Same as homepage, dark-themed                   */
/* ═══════════════════════════════════════════════════════════════ */
const testimonials = [
  { quote: "Donation platform is seamless and easy to use. Our donors love it!", name: "Matt Elston", role: "Donor Money" },
  { quote: "Medicine delivered in minutes. Medone has truly transformed our service.", name: "Ankit Bist", role: "Medone" },
  { quote: "VVD made learning engaging and fun. Students love the platform!", name: "Rishabh Shrivastav", role: "VVD" },
  { quote: "Our video showcase website looks professional and works flawlessly.", name: "Momita Jaisi", role: "Pinkfrogfilms" },
  { quote: "DMCA DENT simplifies managing digital content. Very user-friendly.", name: "William", role: "DMCA DENT" },
  { quote: "Couture Click allows our customers to book tailor services effortlessly.", name: "Anurag", role: "Couture Click" },
  { quote: "Our sensor monitoring system is accurate and reliable, thanks to Duton.", name: "Rohith", role: "Duton" },
  { quote: "Florosense website is clean, fast, and beautifully designed.", name: "Adarsh", role: "Florosense" },
];
const loopTestimonials = [...testimonials, ...testimonials];

function TestimonialsSection() {
  const [showAll, setShowAll] = useState(false);

  return (
    <section className="py-16 sm:py-28 border-t border-white/[0.04] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12 sm:mb-16">
          <motion.p variants={fadeUp} className="text-[11px] sm:text-xs font-semibold text-lime-400/70 tracking-[0.2em] uppercase mb-3">Testimonials</motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="text-2xl sm:text-4xl font-bold tracking-tight leading-[1.15]">
            Scale faster <span className="italic bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">than ever.</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-3 text-[13px] sm:text-[15px] text-white/25 max-w-md mx-auto">
            Built to create impact, not just dashboards.
          </motion.p>
        </motion.div>

        {/* Mobile — static grid */}
        <div className="lg:hidden">
          <div className="grid grid-cols-1 gap-3">
            {testimonials.slice(0, showAll ? testimonials.length : 3).map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="rounded-2xl p-5 bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-all"
              >
                <div className="flex gap-0.5 mb-3 text-amber-400">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <p className="text-[13px] text-white/40 leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime-400/15 to-emerald-400/15 border border-lime-400/10 flex items-center justify-center text-lime-400/80 text-[11px] font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white/70">{t.name}</p>
                    <p className="text-[10px] text-white/20">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {!showAll && (
            <div className="text-center mt-6">
              <button onClick={() => setShowAll(true)} className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-white/[0.08] text-[13px] font-medium text-white/40 hover:text-white hover:bg-white/[0.04] transition-all">
                + More
              </button>
            </div>
          )}
        </div>

        {/* Desktop — 3-column scrolling loop */}
        <div className="hidden lg:grid grid-cols-3 gap-4">
          {[0, 1, 2].map((col) => (
            <div key={col} className="relative h-[580px] overflow-hidden" style={{ maskImage: "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)" }}>
              <motion.div
                className="flex flex-col gap-4"
                animate={{ y: col === 1 ? ["-50%", "0%"] : ["0%", "-50%"] }}
                transition={{ duration: 22, ease: "linear", repeat: Infinity }}
              >
                {loopTestimonials.filter((_, i) => i % 3 === col).map((t, i) => (
                  <div key={i} className="rounded-2xl p-6 bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-all">
                    <div className="flex gap-0.5 mb-3 text-amber-400">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <p className="text-[13px] text-white/40 leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime-400/15 to-emerald-400/15 border border-lime-400/10 flex items-center justify-center text-lime-400/80 text-[11px] font-bold">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white/70">{t.name}</p>
                        <p className="text-[10px] text-white/20">{t.role}</p>
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

/* ═══════════════════════════════════════════════════════════════ */
/* FAQ — Same as homepage, dark-themed                            */
/* ═══════════════════════════════════════════════════════════════ */
const faqs = [
  { question: "How many products does Kalp Intelligence have?", answer: "Kalp Intelligence currently has 3 main products: Gram, SniffUrl, and RapydLaunch, designed to empower businesses and individuals with innovative solutions." },
  { question: "What does Kalp mean?", answer: "The word 'Kalp' signifies creation and innovation. It reflects our mission to build impactful products and generate opportunities for a better India." },
  { question: "Where is Kalp Intelligence registered?", answer: "Kalp Intelligence Private Limited is registered in Bangalore, Karnataka, with CIN U62013KA2025PTC203953. The company was incorporated on 10th June, 2025." },
  { question: "Who are the key management personnel of Kalp?", answer: "The company has two directors/key management personnel: Aman Kumar and Muskan Sharma." },
  { question: "What activities does Kalp Intelligence engage in?", answer: "Kalp Intelligence is involved in providing software support and maintenance to clients, along with building innovative SaaS and digital solutions." },
  { question: "Where is Kalp Intelligence's registered office?", answer: "The registered office is located at 12, R.no. 402, BBMP Ward 191, Parappana Agrahara, Electronics City, Bangalore South, Karnataka, India, 560100." },
  { question: "Does Kalp Intelligence support startups?", answer: "Yes. We provide end-to-end product strategy, rapid prototyping, development, and ongoing support to help startups scale faster and smarter." },
  { question: "Is Kalp Intelligence listed for government projects?", answer: "Kalp Intelligence is a private non-government company, but we focus on delivering software solutions to businesses of all sizes, including startups and enterprises." },
];

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 sm:py-28 border-t border-white/[0.04]">
      <div className="max-w-[800px] mx-auto px-5 sm:px-6">
        {/* Heading */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-10 sm:mb-14">
          <motion.h2 variants={fadeUp} className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Frequently Asked Questions
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="mt-4 text-[13px] sm:text-[15px] text-white/25 max-w-lg mx-auto">
            Find answers about Kalp Intelligence, our products, operations, and how we empower businesses and youth in India.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <Link href="/contact" className="inline-flex items-center justify-center mt-6 px-6 py-2.5 rounded-full border border-white/[0.08] text-[13px] font-medium text-white/40 hover:text-white hover:bg-white/[0.04] transition-all">
              Contact us
            </Link>
          </motion.div>
        </motion.div>

        {/* FAQ list */}
        <div className="space-y-2.5">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-xl border transition-all duration-200 ${isOpen ? "border-lime-400/15 bg-white/[0.03]" : "border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.025]"}`}
              >
                <button onClick={() => setOpenIdx(isOpen ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left gap-4">
                  <span className="text-[13px] sm:text-sm font-medium text-white/70">{faq.question}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex-shrink-0 text-lg ${isOpen ? "text-lime-400/70" : "text-white/15"}`}
                  >+</motion.span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                      <p className="px-5 pb-4 text-[13px] sm:text-sm text-white/30 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* BOTTOM CTA                                                     */
/* ═══════════════════════════════════════════════════════════════ */
function BottomCTA({ onOpenForm }: { onOpenForm: () => void }) {
  return (
    <section className="pb-16 sm:pb-28">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-lime-400/[0.08] via-emerald-500/[0.04] to-transparent" />
          <div className="absolute inset-0 border border-lime-400/10 rounded-2xl" />
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-lime-400/40 to-transparent" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(163,230,53,0.6) 1px, transparent 0)", backgroundSize: "24px 24px" }} />

          <div className="relative z-10 py-12 sm:py-16 px-6 sm:px-12 text-center">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Start Sniffing Your Users Today
            </h2>
            <p className="mt-2.5 sm:mt-3 text-sm sm:text-[15px] text-white/30 max-w-md mx-auto">
              100% free. All features included. No credit card required.
            </p>
            <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={onOpenForm}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-lime-400 text-black text-sm font-semibold hover:bg-lime-300 active:scale-[0.97] transition-all shadow-[0_0_30px_rgba(163,230,53,0.15)]">
                <Zap className="w-4 h-4" />
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <Link href={APP_URL}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] active:scale-[0.97] transition-all">
                Login to Dashboard <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* LEAD FORM MODAL                                                */
/* ═══════════════════════════════════════════════════════════════ */
function LeadFormModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", companyName: "" });

  function update(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
    setError("");
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setSuccess(false);
      setError("");
      setForm({ name: "", email: "", phone: "", companyName: "" });
    }, 300);
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setError("Please enter your name"); return; }
    if (!form.email.trim()) { setError("Please enter your email"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("Please enter a valid email"); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          source: "sniffurl",
          sourcePage: "/sniffurl",
          serviceCategory: "SniffURL",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Something went wrong"); return; }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" onClick={handleClose} />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-md bg-[#0c0c0c] border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {success ? "You're In!" : "Get Started Free"}
                  </h2>
                  {!success && (
                    <p className="text-[11px] text-white/25 mt-0.5">All features. No credit card required.</p>
                  )}
                </div>
                <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.06] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                {success ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-lime-400/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-7 h-7 text-lime-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1.5">
                      Thank you, {form.name.split(" ")[0]}!
                    </h3>
                    <p className="text-[13px] text-white/30 mb-6 max-w-xs mx-auto">
                      We&apos;ll get back to you within 24 hours with your account details.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                      <Link href={APP_URL}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-lime-400 text-black text-sm font-semibold hover:bg-lime-300 transition-all">
                        Go to Dashboard <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button onClick={handleClose} className="px-5 py-2.5 text-white/40 text-sm font-medium rounded-lg border border-white/[0.06] hover:text-white hover:border-white/10 transition-all">
                        Close
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                      <input type="text" placeholder="Full Name *" value={form.name} onChange={(e) => update("name", e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-lime-400/30 transition-colors" />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                      <input type="email" placeholder="Email Address *" value={form.email} onChange={(e) => update("email", e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-lime-400/30 transition-colors" />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                      <input type="tel" placeholder="Phone / WhatsApp" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-lime-400/30 transition-colors" />
                    </div>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                      <input type="text" placeholder="Company Name" value={form.companyName} onChange={(e) => update("companyName", e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-lime-400/30 transition-colors" />
                    </div>

                    {error && <p className="text-sm text-red-400">{error}</p>}
                  </div>
                )}
              </div>

              {/* Footer */}
              {!success && (
                <div className="px-6 py-4 border-t border-white/[0.04]">
                  <button onClick={handleSubmit} disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-lime-400 text-black text-sm font-semibold hover:bg-lime-300 active:scale-[0.97] transition-all disabled:opacity-50">
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : (
                      <><Zap className="w-4 h-4" /> Get Started Free</>
                    )}
                  </button>
                  <p className="text-center mt-2.5 text-[10px] text-white/15">
                    By signing up, you agree to our terms. We&apos;ll never spam you.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
