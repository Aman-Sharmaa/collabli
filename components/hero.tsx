"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FaGooglePlay, FaApple } from "react-icons/fa";
import { DEFAULT_HOME_PAGE_SETTINGS, type HomeHeroSettings } from "@/lib/home-page-defaults";

type HeroProps = {
  settings?: HomeHeroSettings;
};

export function Hero({ settings = DEFAULT_HOME_PAGE_SETTINGS.hero }: HeroProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const staticPart = settings.titleStatic || "";
  const typingPart = settings.titleTyping || "";

  useEffect(() => {
    let currentIndex = 0;
    const typingSpeed = 80;
    const startDelay = 1000;
    let typeInterval: NodeJS.Timeout | null = null;

    const startTyping = setTimeout(() => {
      typeInterval = setInterval(() => {
        if (currentIndex <= typingPart.length) {
          setDisplayedText(typingPart.substring(0, currentIndex));
          currentIndex++;
        } else {
          setTimeout(() => setIsTyping(false), 500);
          if (typeInterval) clearInterval(typeInterval);
        }
      }, typingSpeed);
    }, startDelay);

    return () => {
      clearTimeout(startTyping);
      if (typeInterval) clearInterval(typeInterval);
    };
  }, []);

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-[1200px] mx-auto relative z-10 text-center w-full">
        <div className="flex flex-col items-center space-y-8 max-w-4xl mx-auto w-full">
          {/* New Feature Label */}
          <Link href={settings.announcementHref || "#"}>
            <motion.span
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white transition cursor-pointer"
            >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm sm:text-base text-gray-900 font-medium whitespace-nowrap">
              {settings.announcementText}
            </span>
            <div className="flex items-center gap-2 text-gray-700">
              <FaGooglePlay className="w-4 h-4 sm:w-5 sm:h-5" />
              <FaApple className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            </motion.span>
          </Link>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-gray-900 leading-snug sm:leading-tight break-words"
          >
            <span>{staticPart}</span>
            <span
              className={`italic inline-block transition-all [transition-duration:1.5s] ease-out ${isTyping ? "blur-md" : "blur-0"
                }`}
              style={{ filter: isTyping ? "blur(8px)" : "blur(0px)" }}
            >
              {displayedText}
              {isTyping && displayedText.length > 0 && (
                <span className="inline-block w-0.5 h-[1em] bg-gray-900 ml-1 animate-pulse" />
              )}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl"
          >
            {settings.description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center w-full"
          >
            {/* Explore Products Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <button
                onClick={() => {
                  const productSection = document.getElementById(
                    settings.primaryCtaTargetId || "product"
                  );
                  if (productSection) {
                    productSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 py-3 bg-black hover:bg-gray-900 text-white text-sm sm:text-base font-medium rounded-full transition-all duration-300 shadow-lg shadow-black/30"
              >
                <span>{settings.primaryCtaLabel}</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </motion.div>

            {/* Contact Us Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Link
                href={settings.secondaryCtaHref || "https://cal.com/amansharma"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 py-3 bg-transparent hover:bg-gray-100 text-gray-900 text-sm sm:text-base font-medium rounded-full transition-all duration-300 border border-gray-300"
              >
                <span>{settings.secondaryCtaLabel}</span>
              </Link>
            </motion.div>
          </motion.div>


          {/* Partner Logos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-12 sm:mt-16 w-full sm:w-3/4 mx-auto px-2"
          >
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
              {settings.trustedText}
            </p>

            <div
              className="relative w-full overflow-hidden h-10 sm:h-12"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,1) 90%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,1) 90%, transparent 100%)",
              }}
            >
              <div className="flex overflow-hidden h-full">
                <motion.div
                  className="flex items-center gap-4 sm:gap-6 h-full"
                  animate={{ x: [0, -((72 + 16) * (settings.clientLogos?.length || 1))] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                >
                  {[...(settings.clientLogos || []), ...(settings.clientLogos || []), ...(settings.clientLogos || [])].map(
                    (logo, index) => (
                      <div
                        key={`${logo}-${index}`}
                        className="flex items-center justify-center h-full flex-shrink-0 px-2"
                        style={{ width: "72px" }}
                      >
                        <img
                          src={logo}
                          alt="Client logo"
                          className="object-contain opacity-70 hover:opacity-100 transition-opacity h-6 sm:h-8 w-auto max-w-[72px]"
                          style={{
                            filter: "grayscale(100%) brightness(0.5)",
                          }}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
