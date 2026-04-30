"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import { serviceCategories, BRAND_RED } from "@/lib/rapydlaunch-data";

type RapydNavItem = {
  label: string;
  href: string;
  external?: boolean;
};

type RapydSettings = {
  rapydlaunch: {
    header: {
      logo: string;
      navItems: RapydNavItem[];
      cta: { label: string; show: boolean };
      bookCallUrl: string;
    };
  };
  footer: {
    social: {
      linkedin?: string;
      twitter?: string;
      instagram?: string;
      facebook?: string;
    };
  };
};

export function RapydlaunchHeader({
  onGetStarted,
}: {
  onGetStarted?: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [settings, setSettings] = useState<RapydSettings | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/cms/settings")
      .then(async (res) => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          return data?.settings ? data : { settings: null };
        } catch {
          return { settings: null };
        }
      })
      .then((data) => {
        if (data?.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  // Fallback defaults while loading
  const rlHeader = settings?.rapydlaunch?.header ?? {
    logo: "/rl_logo.svg",
    navItems: [
      { label: "About Us", href: "/about-us", external: false },
      { label: "Book a Call", href: "https://cal.com/amansharma", external: true },
    ],
    cta: { label: "Get Started", show: true },
    bookCallUrl: "https://cal.com/amansharma",
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-black/80 backdrop-blur-xl border-b border-gray-800"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Link href="/rapydlaunch">
                <Image
                  src={rlHeader.logo || "/rl_logo.svg"}
                  alt="Rapydlaunch"
                  width={120}
                  height={32}
                  className="brightness-0 invert"
                />
              </Link>
              <span className="hidden sm:block text-gray-700">|</span>
              <Link
                href="/"
                className="hidden sm:flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors"
              >
                A KALP PRODUCT
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Services dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <button className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Services
                  <ChevronDown
                    className={`w-4 h-4 transition ${servicesOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full right-0 mt-3 w-[480px] bg-[#0a0a0a]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-800 p-4"
                    >
                      <div className="grid grid-cols-2 gap-1">
                        {serviceCategories.map((cat) => {
                          const isActive =
                            pathname === `/rapydlaunch/${cat.slug}`;
                          return (
                            <Link
                              key={cat.slug}
                              href={`/rapydlaunch/${cat.slug}`}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                isActive
                                  ? "bg-[#ED1C24]/10 text-white"
                                  : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
                              }`}
                            >
                              <cat.icon
                                className="w-4 h-4 shrink-0"
                                style={{
                                  color: isActive ? BRAND_RED : undefined,
                                }}
                              />
                              <span className="text-sm font-medium truncate">
                                {cat.shortName}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dynamic nav items */}
              {rlHeader.navItems.map((item) =>
                item.external ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              )}

              {onGetStarted && rlHeader.cta?.show && (
                <button
                  onClick={onGetStarted}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm font-semibold transition-all"
                  style={{ backgroundColor: BRAND_RED }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#d0171e";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = BRAND_RED;
                  }}
                >
                  {rlHeader.cta.label || "Get Started"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile button */}
            <button
              className="lg:hidden text-gray-300"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col"
          >
            {/* Mobile header */}
            <div className="flex items-center justify-between px-6 h-14 border-b border-gray-800">
              <Link
                href="/rapydlaunch"
                onClick={() => setMobileOpen(false)}
              >
                <Image
                  src={rlHeader.logo || "/rl_logo.svg"}
                  alt="Rapydlaunch"
                  width={100}
                  height={28}
                  className="brightness-0 invert"
                />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              {/* Quick links */}
              <div className="space-y-4">
                <Link
                  href="/rapydlaunch"
                  onClick={() => setMobileOpen(false)}
                  className="block text-lg font-medium text-white"
                >
                  All Services
                </Link>
                {rlHeader.navItems.map((item) =>
                  item.external ? (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-lg font-medium text-gray-300"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block text-lg font-medium text-gray-300"
                    >
                      {item.label}
                    </Link>
                  )
                )}
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium text-gray-500"
                >
                  Back to Kalp.ltd
                </Link>
              </div>

              {/* Service categories */}
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-600 mb-4">
                  Services
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {serviceCategories.map((cat) => {
                    const isActive =
                      pathname === `/rapydlaunch/${cat.slug}`;
                    return (
                      <Link
                        key={cat.slug}
                        href={`/rapydlaunch/${cat.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                          isActive
                            ? "bg-[#ED1C24]/10 text-white border border-[#ED1C24]/20"
                            : "bg-gray-900/50 text-gray-400 active:bg-gray-800"
                        }`}
                      >
                        <cat.icon
                          className="w-5 h-5 shrink-0"
                          style={{
                            color: isActive ? BRAND_RED : undefined,
                          }}
                        />
                        <span className="text-sm font-medium">
                          {cat.shortName}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile CTA */}
            {onGetStarted && rlHeader.cta?.show && (
              <div className="p-6 border-t border-gray-800">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onGetStarted();
                  }}
                  className="block w-full text-center py-3 rounded-full text-white text-sm font-semibold"
                  style={{ backgroundColor: BRAND_RED }}
                >
                  {rlHeader.cta.label || "Get Started"}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
