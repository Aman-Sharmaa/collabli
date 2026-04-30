"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Twitter, Instagram, Linkedin, Facebook } from "lucide-react";
import { usePathname } from "next/navigation";

// Define a type for your settings
type FooterSettings = {
  header: any; // We might need logo here too?
  footer: {
    companyName: string;
    description: string;
    contactEmail?: string;
    meetingCta?: { label: string; href: string };
    social: { linkedin?: string; twitter?: string; instagram?: string; facebook?: string };
    columns: { title: string; links: { label: string; href: string }[] }[];
  };
  products: { name: string; href: string }[];
  services: { title: string; href: string }[];
};

const DEFAULT_FOOTER: FooterSettings = {
  header: {},
  footer: {
    companyName: "Kalp Intelligence Pvt Ltd",
    description: "Empowering startups to scale smarter and faster.",
    contactEmail: "hello@kalp.ltd",
    meetingCta: { label: "Book a Meeting", href: "https://cal.com/amansharma" },
    columns: [],
    social: {},
  },
  products: [
    { name: "Gram", href: "/gram" },
    { name: "SniffUrl", href: "/sniffurl" },
  ],
  services: [],
};

export function Footer() {
  const pathname = usePathname();
  const isRapydlaunchPage = pathname === "/rapydlaunch";
  const isSniffurlPage = pathname === "/sniffurl" || pathname === "/products/sniffurl";
  const isDarkFooter = isRapydlaunchPage || isSniffurlPage;
  const [settings, setSettings] = useState<FooterSettings | null>(DEFAULT_FOOTER);

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
        else setSettings(DEFAULT_FOOTER);
      })
      .catch(() => {
        setSettings(DEFAULT_FOOTER);
      });
  }, []);

  const { footer, products, services } = settings || DEFAULT_FOOTER;

  return (
    <footer className={`px-4 sm:px-6 lg:px-8 py-10 ${isDarkFooter ? "bg-black" : "bg-white"}`}>
      <div className="max-w-[1200px] mx-auto">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Company */}
          <div>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkFooter ? "text-white" : "text-black"}`}>
              {footer.companyName}
            </h2>
            <p className={`text-sm mb-4 ${isDarkFooter ? "text-gray-400" : "text-gray-600"}`}>
              {footer.description}
            </p>
            <Link
              href={footer.meetingCta?.href || "/contact"}
              className={`inline-block mt-2 px-6 py-2 rounded-full font-medium transition ${isRapydlaunchPage ? "bg-red-600 text-white hover:bg-red-700" : isSniffurlPage ? "bg-lime-500 text-black hover:bg-lime-400" : "bg-black text-white hover:opacity-90"
                }`}
            >
              {footer.meetingCta?.label || "Book a Meeting"}
            </Link>
          </div>

          {/* Products */}
          {products.length > 0 && (
            <div>
              <h3 className={`font-semibold mb-3 ${isDarkFooter ? "text-gray-300" : "text-gray-900"}`}>Products</h3>
              <ul className="space-y-2">
                {products.map((product) => (
                  <li key={product.name}>
                    {product.href?.startsWith('http') ? (
                      <a
                        href={product.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:underline transition ${isDarkFooter ? "text-gray-400 hover:text-white" : "text-gray-700 hover:text-black"}`}
                      >
                        {product.name}
                      </a>
                    ) : (
                      <Link
                        href={product.href || "#"}
                        className={`hover:underline transition ${isDarkFooter ? "text-gray-400 hover:text-white" : "text-gray-700 hover:text-black"}`}
                      >
                        {product.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Services */}
          {services.length > 0 && (
            <div>
              <h3 className={`font-semibold mb-3 ${isDarkFooter ? "text-gray-300" : "text-gray-900"}`}>Services</h3>
              <ul className="space-y-2">
                {services.map((service) => (
                  <li key={service.title}>
                    <Link
                      href={service.href || "/rapydlaunch"}
                      className={`hover:underline transition ${isDarkFooter ? "text-gray-400 hover:text-white" : "text-gray-700 hover:text-black"}`}
                    >
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Custom Columns (Company, etc.) */}
          {footer.columns?.map((col, idx) => (
            <div key={idx}>
              <h3 className={`font-semibold mb-3 ${isDarkFooter ? "text-gray-300" : "text-gray-900"}`}>{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={`hover:underline transition ${isDarkFooter ? "text-gray-400 hover:text-white" : "text-gray-700 hover:text-black"}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Divider */}
        <div className={`my-8 border-t ${isDarkFooter ? "border-gray-800" : "border-gray-200"}`}></div>

        {/* Bottom section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
          {/* Copyright and Email */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <p className={`text-sm ${isDarkFooter ? "text-gray-400" : "text-gray-600"}`}>
              © {new Date().getFullYear()} {footer.companyName}. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <a
                href={`mailto:${footer.contactEmail || "hello@kalp.ltd"}`}
                className={`${isDarkFooter ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"} hover:underline`}
              >
                {footer.contactEmail || "hello@kalp.ltd"}
              </a>
              <span className={isDarkFooter ? "text-gray-600" : "text-gray-400"}>·</span>
              <Link
                href="/login"
                className={`${isDarkFooter ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"} hover:underline`}
              >
                Employee Login
              </Link>
            </div>
          </div>

          {/* Socials */}
          <div className="flex gap-3">
            {footer.social?.linkedin && (
              <a
                href={footer.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition group ${isDarkFooter ? "bg-gray-900 hover:bg-red-600" : "bg-[#faf8f4] hover:bg-black"
                  }`}
              >
                <Linkedin className={`w-4 h-4 transition ${isDarkFooter ? "text-gray-400 group-hover:text-white" : "text-gray-700 group-hover:text-white"}`} />
              </a>
            )}
            {footer.social?.instagram && (
              <a
                href={footer.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition group ${isDarkFooter ? "bg-gray-900 hover:bg-red-600" : "bg-[#faf8f4] hover:bg-black"
                  }`}
              >
                <Instagram className={`w-4 h-4 transition ${isDarkFooter ? "text-gray-400 group-hover:text-white" : "text-gray-700 group-hover:text-white"}`} />
              </a>
            )}
            {footer.social?.twitter && (
              <a
                href={footer.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition group ${isDarkFooter ? "bg-gray-900 hover:bg-red-600" : "bg-[#faf8f4] hover:bg-black"
                  }`}
              >
                <Twitter className={`w-4 h-4 transition ${isDarkFooter ? "text-gray-400 group-hover:text-white" : "text-gray-700 group-hover:text-white"}`} />
              </a>
            )}
            {footer.social?.facebook && (
              <a
                href={footer.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition group ${isDarkFooter ? "bg-gray-900 hover:bg-red-600" : "bg-[#faf8f4] hover:bg-black"
                  }`}
              >
                <Facebook className={`w-4 h-4 transition ${isDarkFooter ? "text-gray-400 group-hover:text-white" : "text-gray-700 group-hover:text-white"}`} />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}