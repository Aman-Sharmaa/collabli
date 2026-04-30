"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Linkedin, Instagram, Twitter, Mail, ExternalLink } from "lucide-react";
import { serviceCategories, BRAND_RED } from "@/lib/rapydlaunch-data";

type RapydNavItem = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterSettings = {
  rapydlaunch: {
    header: {
      logo: string;
    };
    footer: {
      description: string;
      email: string;
      companyLinks: RapydNavItem[];
    };
  };
  footer: {
    companyName: string;
    social: {
      linkedin?: string;
      twitter?: string;
      instagram?: string;
    };
  };
};

export function RapydlaunchFooter() {
  const [settings, setSettings] = useState<FooterSettings | null>(null);

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

  // Fallback defaults
  const rlFooter = settings?.rapydlaunch?.footer ?? {
    description: "Full-service digital partner for brands, startups, and businesses worldwide. One team, one goal.",
    email: "hello@kalp.ltd",
    companyLinks: [
      { label: "About Us", href: "/about-us", external: false },
      { label: "Contact", href: "/contact", external: false },
      { label: "Book a Call", href: "https://cal.com/amansharma", external: true },
      { label: "Kalp.ltd Home", href: "/", external: false },
    ],
  };
  const rlLogo = settings?.rapydlaunch?.header?.logo ?? "/rl_logo.svg";
  const social = settings?.footer?.social ?? {
    linkedin: "https://linkedin.com/company/kalp-ltd",
    instagram: "https://instagram.com/kalp.ltd",
    twitter: "https://twitter.com/kalp_ltd",
  };
  const companyName = settings?.footer?.companyName ?? "Kalp.ltd";

  return (
    <footer className="bg-black border-t border-gray-800 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-[1200px] mx-auto">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/rapydlaunch" className="inline-block mb-4">
              <Image
                src={rlLogo}
                alt="Rapydlaunch"
                width={120}
                height={32}
                className="brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              {rlFooter.description}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              A product by {companyName}
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Services Col 1 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-4">
              Services
            </h3>
            <ul className="space-y-2.5">
              {serviceCategories.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/rapydlaunch/${cat.slug}`}
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    {cat.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Col 2 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-4">
              More Services
            </h3>
            <ul className="space-y-2.5">
              {serviceCategories.slice(6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/rapydlaunch/${cat.slug}`}
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    {cat.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links - Dynamic */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {rlFooter.companyLinks.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-500 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                  Employee Login
                </Link>
              </li>
            </ul>

            {/* Contact */}
            {rlFooter.email && (
              <div className="mt-6">
                <a
                  href={`mailto:${rlFooter.email}`}
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {rlFooter.email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
          </p>

          {/* Socials */}
          <div className="flex gap-3">
            {social.linkedin && (
              <a
                href={social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-900 hover:bg-[#ED1C24] flex items-center justify-center transition-colors group"
              >
                <Linkedin className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
              </a>
            )}
            {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-900 hover:bg-[#ED1C24] flex items-center justify-center transition-colors group"
              >
                <Instagram className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
              </a>
            )}
            {social.twitter && (
              <a
                href={social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-900 hover:bg-[#ED1C24] flex items-center justify-center transition-colors group"
              >
                <Twitter className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
