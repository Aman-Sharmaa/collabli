"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { serviceCategories, BRAND_RED } from "@/lib/rapydlaunch-data";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

export function RapydlaunchNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isOverview = pathname === "/rapydlaunch";

  // Find current category for mobile header subtitle
  const currentCat = serviceCategories.find(
    (c) => pathname === `/rapydlaunch/${c.slug}`
  );

  return (
    <>
      {/* ─── Mobile Header Bar ─── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-black/90 backdrop-blur-xl border-b border-gray-800/60 flex items-center justify-between px-4">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-10 h-10 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-300 hover:text-white hover:border-gray-600 transition-all"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <Link
            href="/rapydlaunch"
            className="flex items-center gap-2.5"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs"
              style={{ backgroundColor: BRAND_RED }}
            >
              R
            </div>
            <div className="leading-tight">
              <span className="text-white font-semibold text-sm block">
                Rapydlaunch
              </span>
              {currentCat ? (
                <span className="text-[10px] text-gray-500 block truncate max-w-[140px]">
                  {currentCat.shortName}
                </span>
              ) : (
                <span className="text-[10px] text-gray-500 block">
                  Services
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Right: CTA */}
        <a
          href="https://cal.com/amansharma"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-xs font-semibold rounded-lg transition-all"
          style={{ backgroundColor: BRAND_RED }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#d0171e";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = BRAND_RED;
          }}
        >
          <span className="hidden xs:inline">Book a Call</span>
          <span className="xs:hidden">Call</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </header>

      {/* ─── Mobile Overlay ─── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Sidebar / Mobile Drawer ─── */}
      <nav
        className={cn(
          "fixed top-0 left-0 h-screen w-[280px] bg-black/95 backdrop-blur-xl border-r border-gray-800/60 flex flex-col transition-transform duration-300 ease-out",
          // Desktop: always visible
          "lg:translate-x-0 lg:z-40",
          // Mobile: slide in/out above everything
          mobileOpen
            ? "translate-x-0 z-[60]"
            : "-translate-x-full z-[60]"
        )}
      >
        {/* Sidebar Logo / Header */}
        <div className="px-5 pt-6 pb-4 border-b border-gray-800/60 flex items-center justify-between">
          <Link
            href="/rapydlaunch"
            className="flex items-center gap-3 group"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ backgroundColor: BRAND_RED }}
            >
              R
            </div>
            <div>
              <span className="text-white font-semibold text-sm block leading-tight">
                Rapydlaunch
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
                Services
              </span>
            </div>
          </Link>

          {/* Close button inside drawer (mobile only) */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-800">
          {/* Overview link */}
          <Link
            href="/rapydlaunch"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isOverview
                ? "bg-[#ED1C24]/15 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            )}
          >
            <LayoutDashboard
              className="w-4 h-4 shrink-0"
              style={isOverview ? { color: BRAND_RED } : undefined}
            />
            <span>All Services</span>
          </Link>

          {/* Divider */}
          <div className="h-px bg-gray-800/60 my-3" />

          {/* Category links */}
          {serviceCategories.map((cat) => {
            const isActive = pathname === `/rapydlaunch/${cat.slug}`;
            return (
              <Link
                key={cat.slug}
                href={`/rapydlaunch/${cat.slug}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
                  isActive
                    ? "bg-[#ED1C24]/15 text-white font-medium"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                )}
              >
                <cat.icon
                  className="w-4 h-4 shrink-0 transition-colors"
                  style={isActive ? { color: BRAND_RED } : undefined}
                />
                <span className="truncate">{cat.shortName}</span>
                {isActive && (
                  <ChevronRight
                    className="w-3.5 h-3.5 ml-auto shrink-0"
                    style={{ color: BRAND_RED }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="px-4 py-4 border-t border-gray-800/60">
          <a
            href="https://cal.com/amansharma"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-white text-sm font-semibold rounded-lg transition-all"
            style={{ backgroundColor: BRAND_RED }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#d0171e";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = BRAND_RED;
            }}
          >
            Book a Call
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 mt-2 text-xs text-gray-500 hover:text-gray-300 transition-colors py-1.5"
          >
            <ChevronLeft className="w-3 h-3" />
            Back to Kalp.ltd
          </Link>
        </div>
      </nav>
    </>
  );
}
