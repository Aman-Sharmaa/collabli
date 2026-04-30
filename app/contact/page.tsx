"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, ArrowRight, Send } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageHero } from "@/components/page-hero";

type ContactSettings = {
  email?: string;
  bookCallUrl?: string;
};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ContactSettings>({
    email: "hello@kalp.ltd",
    bookCallUrl: "https://cal.com/amansharma",
  });

  useEffect(() => {
    fetch("/api/cms/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.rapydlaunch) {
          const rl = data.settings.rapydlaunch as { header?: { bookCallUrl?: string }; footer?: { email?: string } };
          setSettings({
            email: rl.footer?.email || "hello@kalp.ltd",
            bookCallUrl: rl.header?.bookCallUrl || "https://cal.com/amansharma",
          });
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const companyName = String(formData.get("companyName") || "").trim();
    const message = String(formData.get("message") || "").trim();

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          companyName: companyName || undefined,
          projectDescription: message,
          source: "website",
          sourcePage: "/contact",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Header />
      <PageHero
        title="Contact us"
        subtitle="Have a project in mind? Book a demo or drop us a line,we’d love to hear from you."
      />
      <section className="py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Get in touch
                </h2>
                <p className="text-gray-600 leading-relaxed max-w-md">
                  Whether you need a new product built, want to discuss a
                  partnership, or just want to say hello,we're here.
                </p>
              </div>

              <div className="space-y-6">
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#f8f6f2] flex items-center justify-center group-hover:bg-gray-200 transition">
                    <Mail className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900 group-hover:text-black">
                      {settings.email}
                    </p>
                  </div>
                </a>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#f8f6f2] flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Based in</p>
                    <p className="font-medium text-gray-900">India</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <a
                  href={settings.bookCallUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-900 transition"
                >
                  Book a call
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>

            {/* Contact form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgba(0,120,255,0.08)] p-8 sm:p-10">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Message sent
                    </h3>
                    <p className="mt-2 text-gray-600 max-w-sm mx-auto">
                      Thanks for reaching out. We’ll get back to you within 1–2
                      business days.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                        {error}
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Name *
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          className="w-full rounded-xl bg-[#faf8f4] px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-900/20 border border-transparent focus:border-gray-300 transition"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Email *
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          className="w-full rounded-xl bg-[#faf8f4] px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-900/20 border border-transparent focus:border-gray-300 transition"
                          placeholder="you@company.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Phone
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          className="w-full rounded-xl bg-[#faf8f4] px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-900/20 border border-transparent focus:border-gray-300 transition"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="companyName"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Company
                        </label>
                        <input
                          id="companyName"
                          name="companyName"
                          type="text"
                          className="w-full rounded-xl bg-[#faf8f4] px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-900/20 border border-transparent focus:border-gray-300 transition"
                          placeholder="Your company"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        required
                        className="w-full rounded-xl bg-[#faf8f4] px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-900/20 border border-transparent focus:border-gray-300 transition resize-none"
                        placeholder="Tell us about your project or idea..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-900 transition disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        "Sending..."
                      ) : (
                        <>
                          Send message
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
