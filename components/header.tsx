"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  ExternalLink,
  Code,
  Smartphone,
  Palette,
  Megaphone,
  Video,
  Wrench,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";


/* ---------------- ICONS MAP ---------------- */
const ICON_MAP: Record<string, any> = {
  Code,
  Smartphone,
  Palette,
  Megaphone,
  Video,
  Wrench,
};

type HeaderSettings = {
  header: {
    logo: string;
    logoDark: string;
    cta: { label: string; href: string; show: boolean };
    navItems: {
      label: string;
      href: string;
      type: "link" | "dropdown";
      children?: { label: string; href: string; description?: string }[];
    }[];
  };
  products: any[];
  services: any[];
};

const DEFAULT_HEADER_SETTINGS: HeaderSettings = {
  header: { logo: "/header_logo.svg", logoDark: "/rl_logo.svg", cta: { show: true, label: "Book a call", href: "https://cal.com/amansharma" }, navItems: [] },
  products: [
    { name: "Gram", href: "/gram", image: "/gram_logo.svg", tagline: "Hyperlocal delivery" },
    { name: "SniffUrl", href: "/sniffurl", image: "/sniff_logo.svg", tagline: "URL shortener with analytics" },
  ],
  services: [],
};

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [settings, setSettings] = useState<HeaderSettings | null>(DEFAULT_HEADER_SETTINGS);

  const pathname = usePathname();
  const isRapydlaunchPage = pathname === "/rapydlaunch";
  const isSniffurlPage = pathname === "/products/sniffurl" || pathname === "/sniffurl";
  const isGramPage = pathname === "/gram";
  const isProductPage = isSniffurlPage || isGramPage;

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
        else setSettings(DEFAULT_HEADER_SETTINGS);
      })
      .catch(() => {
        setSettings(DEFAULT_HEADER_SETTINGS);
      });
  }, []);

  const { header, products, services } = settings || DEFAULT_HEADER_SETTINGS;
  const logoSrc = isRapydlaunchPage ? (header.logoDark || "/rl_logo.svg") : (header.logo || "/header_logo.svg");

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* ---------------- NAVBAR ---------------- */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`backdrop-blur-xl ${isRapydlaunchPage || isSniffurlPage
          ? "bg-black/80 border-b border-gray-800"
          : "bg-white/60"
          }`}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">

            {/* LOGO */}
            <div className="flex items-center gap-3">
              {isRapydlaunchPage ? (
                <>
                  <Link href="/rapydlaunch">
                    <Image
                      src={logoSrc}
                      alt="Rapydlaunch"
                      width={100}
                      height={30}
                      className="brightness-0 invert"
                    />
                  </Link>
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-sm font-medium text-gray-300"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to kalp
                  </Link>
                </>
              ) : isProductPage ? (
                <>
                  <Link href={isGramPage ? "/gram" : "/sniffurl"}>
                    <Image
                      src={isGramPage ? "/gram_logo_2.svg" : "/sniffurl_logo_2.svg"}
                      alt={isGramPage ? "Gram" : "SniffURL"}
                      width={100}
                      height={30}
                      className={`h-6 sm:h-7 w-auto ${isSniffurlPage ? "brightness-[2]" : ""}`}
                    />
                  </Link>
                  <Link
                    href="/"
                    className={`flex items-center gap-2 text-sm font-medium ${isSniffurlPage ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Kalp
                  </Link>
                </>
              ) : (
                <Link href="/">
                  <Image
                    src={logoSrc}
                    alt="Kalp.ltd"
                    width={100}
                    height={30}
                  />
                </Link>
              )}
            </div>

            {/* NOTIFICATIONS & DESKTOP NAV */}
            <div className="flex items-center gap-4">


              <div className="hidden lg:flex items-center gap-6">
                {(header.navItems?.length ? header.navItems : [{ label: "About us", href: "/about-us", type: "link" as const }]).map((item) => (
                  <NavLink
                    key={item.label}
                    href={item.href || item.children?.[0]?.href || "#"}
                    isDark={isRapydlaunchPage || isSniffurlPage}
                  >
                    {item.label}
                  </NavLink>
                ))}

                {!isRapydlaunchPage && !isProductPage && products.length > 0 && (
                  <Dropdown label="Our Products" open={productsOpen} setOpen={setProductsOpen}>
                    {products.map((p) => {
                      const isExternal = p.href?.startsWith("http");
                      return isExternal ? (
                      <a
                        key={p.name}
                        href={p.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                      >
                        <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          {p.image ? <Image src={p.image} alt={p.name} fill /> : <div className="w-full h-full bg-gray-200" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.tagline}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 ml-auto text-gray-400" />
                      </a>
                      ) : (
                      <Link
                        key={p.name}
                        href={p.href || "#"}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                      >
                        <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          {p.image ? <Image src={p.image} alt={p.name} fill /> : <div className="w-full h-full bg-gray-200" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.tagline}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 ml-auto text-gray-400" />
                      </Link>
                      );
                    })}
                  </Dropdown>
                )}

                {!isRapydlaunchPage && !isProductPage && services.length > 0 && (
                  <Dropdown label="Rapydlaunch" open={servicesOpen} setOpen={setServicesOpen} wide>
                    <div className="grid grid-cols-2 gap-3">
                      {services.map((s) => {
                        const Icon = ICON_MAP[s.icon] || Code;
                        return (
                          <Link
                            key={s.title}
                            href={s.href || "/rapydlaunch"}
                            className="flex gap-3 p-3 rounded-lg hover:bg-gray-50"
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Icon className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-semibold">{s.title}</p>
                          </Link>
                        );
                      })}
                    </div>
                  </Dropdown>
                )}

                {header.cta?.show && (
                  <Link
                    href={header.cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-sm font-medium"
                  >
                    <span>{header.cta.label}</span>
                  </Link>
                )}
              </div>

            </div>

            {/* MOBILE BUTTON */}
            {/* MOBILE BUTTON */}
            <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ---------------- MOBILE MENU ---------------- */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b">
              <span className="text-sm font-semibold">Menu</span>
              <button onClick={() => setMobileOpen(false)}>
                <X />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-10">
              {(header.navItems?.length ? header.navItems : [{ label: "About us", href: "/about-us", type: "link" as const }]).map((item) => (
                <div key={`mobile-${item.label}`} className="space-y-3">
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-lg font-medium"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <p className="text-lg font-medium">{item.label}</p>
                  )}
                  {item.type === "dropdown" && (item.children?.length || 0) > 0 && (
                    <div className="pl-3 border-l border-gray-200 space-y-2">
                      {(item.children || []).map((child) =>
                        child.href?.startsWith("http") ? (
                          <a
                            key={`mobile-${item.label}-${child.label}`}
                            href={child.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-gray-700"
                          >
                            {child.label}
                          </a>
                        ) : (
                          <Link
                            key={`mobile-${item.label}-${child.label}`}
                            href={child.href || "#"}
                            onClick={() => setMobileOpen(false)}
                            className="block text-sm text-gray-700"
                          >
                            {child.label}
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* PRODUCTS */}
              {products.length > 0 && (
                <div>
                  <p className="text-xs uppercase text-gray-400 mb-4">Products</p>
                  <div className="space-y-4">
                    {products.map((p) => {
                      const isExternal = p.href?.startsWith("http");
                      return isExternal ? (
                        <a
                          key={p.name}
                          href={p.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between"
                        >
                          <span className="font-medium">{p.name}</span>
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </a>
                      ) : (
                        <Link
                          key={p.name}
                          href={p.href || "#"}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between"
                        >
                          <span className="font-medium">{p.name}</span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SERVICES */}
              {services.length > 0 && (
                <div>
                  <p className="text-xs uppercase text-gray-400 mb-4">Services</p>
                  <div className="grid grid-cols-1 gap-4">
                    {services.map((s) => {
                      const Icon = ICON_MAP[s.icon] || Code;
                      return (
                        <Link
                          key={s.title}
                          href={s.href || "/rapydlaunch"}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 active:scale-[0.98] transition"
                        >
                          <div className="w-12 h-12 rounded-lg bg-white shadow flex items-center justify-center">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-medium">{s.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            {header.cta?.show && (
              <div className="p-6 border-t">
                <Link
                  href={header.cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-black text-white py-3 rounded-full"
                >
                  <span>{header.cta.label}</span>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------------- HELPERS ---------------- */

function NavLink({ href, children, isDark = false }: any) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium ${isDark
        ? "text-gray-300 hover:text-white"
        : "text-gray-700 hover:text-gray-900"
        }`}
    >
      {children}
    </Link>
  );
}

function Dropdown({ label, open, setOpen, children, wide = false }: any) {
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="flex items-center gap-1 text-sm font-medium">
        {label}
        <ChevronDown className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`absolute top-full left-0 mt-3 ${wide ? "w-[520px]" : "w-80"
              } bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl p-4`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
