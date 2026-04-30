"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Smartphone,
  Calendar,
  QrCode,
  Link2,
  Megaphone,
  Bell,
  Eye,
  Code,
  BarChart3,
  ExternalLink,
  Check,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ClientMarquee } from "@/components/client-marquee";

const features = [
  {
    icon: Smartphone,
    title: "Track iOS & Android Users",
    description: "Monitor user behavior across iOS and Android platforms with comprehensive analytics and insights.",
  },
  {
    icon: Calendar,
    title: "Events",
    description: "Track custom events and user interactions to understand how users engage with your app.",
  },
  {
    icon: QrCode,
    title: "QR Codes",
    description: "Generate and track QR codes with detailed analytics on scans, locations, and user behavior.",
  },
  {
    icon: Link2,
    title: "One Link",
    description: "Create a single link that works across all platforms and track performance in one place.",
  },
  {
    icon: Megaphone,
    title: "Campaigns",
    description: "Launch and manage marketing campaigns with real-time tracking and performance metrics.",
  },
  {
    icon: Bell,
    title: "Push Notifications",
    description: "Send targeted push notifications and track engagement rates across all devices.",
  },
  {
    icon: Eye,
    title: "Live User Insights",
    description: "Get real-time insights into user behavior, sessions, and interactions as they happen.",
  },
  {
    icon: Code,
    title: "Web SDK",
    description: "Easy-to-integrate SDK for web applications with comprehensive tracking capabilities.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Comprehensive analytics dashboard with detailed reports, charts, and actionable insights.",
  },
];

const benefits = [
  "Real-time user tracking across all platforms",
  "Comprehensive analytics and reporting",
  "Easy integration with Web SDK",
  "Campaign management and optimization",
  "Push notification delivery and tracking",
  "QR code generation and analytics",
];

export default function SniffUrlPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Abstract Background Light Effects - Same as Homepage */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Red Abstract Lights */}
        <div className="absolute bottom-0 left-0 w-full h-2/3">
          {/* Red light from bottom left */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{ backgroundColor: 'rgba(241, 31, 31, 0.2)' }}
          />
          
          {/* Red light from bottom right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
            className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px]"
            style={{ backgroundColor: 'rgba(241, 31, 31, 0.2)' }}
          />
          
          {/* Red light from center */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, delay: 0.6, ease: "easeOut" }}
            className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[90px]"
            style={{ backgroundColor: 'rgba(241, 31, 31, 0.15)' }}
          />
        </div>
      </div>

      <div className="relative z-10">
        <Header />

        {/* Hero Section */}
        <section className="pt-32 sm:pt-40 pb-20 sm:pb-28">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-gray-900 leading-tight mb-6">
                  Track, Analyze, and Optimize Your Users
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8">
                  Comprehensive user tracking and analytics platform for iOS, Android, and Web. 
                  Get real-time insights, manage campaigns, and optimize your user experience.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <a
                      href="https://cal.com/amansharma"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-full transition-all duration-300 shadow-lg shadow-black/30"
                    >
                      <span>Get Pricing</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/sniffurl"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent hover:bg-gray-100 text-gray-900 text-sm font-medium rounded-full transition-all duration-300 border border-gray-300"
                    >
                      <span>Login</span>
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </motion.div>
                </div>
                <p className="text-sm text-gray-500">
                  Contact us for custom pricing plans
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-2xl p-8">
                  <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">SniffURL Dashboard Preview</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Client Marquee */}
        <section className="py-12">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <ClientMarquee />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 sm:py-28">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 mb-4">
                Powerful Features for Modern Apps
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to track, analyze, and optimize your user experience across all platforms.
              </p>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative rounded-3xl p-8 bg-white/60 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_30px_rgba(0,120,255,0.08)] border border-white/40 hover:shadow-[0_12px_40px_rgba(0,120,255,0.12)] transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 sm:py-28 bg-white/50 backdrop-blur-sm">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-medium text-gray-900 mb-6">
                  Why Choose SniffURL?
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  A comprehensive platform that gives you complete visibility into your user behavior 
                  and helps you make data-driven decisions.
                </p>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <motion.li
                      key={benefit}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="text-gray-700">{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-8 border border-gray-200/60">
                  <div className="space-y-6">
                    <div>
                      <div className="text-sm text-gray-500 mb-2">Active Users</div>
                      <div className="text-3xl font-bold text-gray-900">12,458</div>
                      <div className="text-sm text-green-600 mt-1">+23% from last month</div>
                    </div>
                    <div className="h-px bg-gray-200" />
                    <div>
                      <div className="text-sm text-gray-500 mb-2">Events Tracked</div>
                      <div className="text-3xl font-bold text-gray-900">1.2M+</div>
                      <div className="text-sm text-green-600 mt-1">+45% from last month</div>
                    </div>
                    <div className="h-px bg-gray-200" />
                    <div>
                      <div className="text-sm text-gray-500 mb-2">Campaigns Active</div>
                      <div className="text-3xl font-bold text-gray-900">47</div>
                      <div className="text-sm text-green-600 mt-1">+12% from last month</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-28">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl sm:text-4xl font-medium text-gray-900 mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Contact us for pricing and start tracking your users today. 
                Or login to your existing account to access your dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a
                    href="https://cal.com/amansharma"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-full transition-all duration-300 shadow-lg shadow-black/30"
                  >
                    <span>Contact for Pricing</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/sniffurl"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent hover:bg-gray-100 text-gray-900 text-sm font-medium rounded-full transition-all duration-300 border border-gray-300"
                  >
                    <span>Login to Dashboard</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
