"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  CheckCircle2,
  ExternalLink,
  User,
  Mail,
  Phone,
  Building2,
  Globe,
  DollarSign,
  Clock,
  MessageSquare,
  Briefcase,
  IndianRupee,
} from "lucide-react";
import { BRAND_RED } from "@/lib/rapydlaunch-data";

const budgetOptionsUSD = [
  "Under $500",
  "$500 to $2,000",
  "$2,000 to $5,000",
  "$5,000 to $10,000",
  "$10,000 to $25,000",
  "$25,000+",
  "Not sure yet",
];

const budgetOptionsINR = [
  "Under ₹25,000",
  "₹25,000 to ₹1 Lakh",
  "₹1 to ₹3 Lakh",
  "₹3 to ₹5 Lakh",
  "₹5 to ₹10 Lakh",
  "₹10 Lakh+",
  "Not sure yet",
];

function detectIsIndia(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return true;
    const lang = navigator.language || "";
    if (lang.endsWith("-IN") || lang === "hi") return true;
  } catch {
    // fallback
  }
  return false;
}

const timelineOptions = [
  "ASAP",
  "Within 1 week",
  "Within 2 weeks",
  "Within 1 month",
  "1-3 months",
  "Flexible",
];

type LeadFormProps = {
  isOpen: boolean;
  onClose: () => void;
  serviceCategory?: string;
  serviceCategorySlug?: string;
  sourcePage?: string;
};

export function RapydlaunchLeadForm({
  isOpen,
  onClose,
  serviceCategory,
  serviceCategorySlug,
  sourcePage,
}: LeadFormProps) {
  const [isIndia, setIsIndia] = useState(false);

  useEffect(() => {
    setIsIndia(detectIsIndia());
  }, []);

  const budgetOptions = isIndia ? budgetOptionsINR : budgetOptionsUSD;
  const currencyCode = isIndia ? "INR" : "USD";
  const CurrencyIcon = isIndia ? IndianRupee : DollarSign;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    companyWebsite: "",
    designation: "",
    projectDescription: "",
    budget: "",
    timeline: "",
    notes: "",
  });

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  function handleClose() {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setStep(1);
      setSuccess(false);
      setError("");
      setForm({
        name: "",
        email: "",
        phone: "",
        companyName: "",
        companyWebsite: "",
        designation: "",
        projectDescription: "",
        budget: "",
        timeline: "",
        notes: "",
      });
    }, 300);
  }

  function goToStep2() {
    if (!form.name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!form.email.trim()) {
      setError("Please enter your email");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email");
      return;
    }
    setError("");
    setStep(2);
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          currency: currencyCode,
          serviceCategory,
          serviceCategorySlug,
          sourcePage: sourcePage || window.location.pathname,
          source: "rapydlaunch",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full max-w-lg bg-[#0a0a0a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {success ? "Request Submitted!" : "Get Started"}
                  </h2>
                  {!success && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {serviceCategory
                        ? `${serviceCategory} | Tell us about your project`
                        : "Tell us about your project and we'll get back within 24 hours"}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: "rgba(237, 28, 36, 0.15)" }}
                    >
                      <CheckCircle2
                        className="w-8 h-8"
                        style={{ color: BRAND_RED }}
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Thank you, {form.name.split(" ")[0]}!
                    </h3>
                    <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                      We&apos;ve received your request. Our team will review your
                      requirements and get back to you within 24 hours.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <a
                        href="https://cal.com/amansharma"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-all"
                        style={{ backgroundColor: BRAND_RED }}
                      >
                        Book a Call Now
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={handleClose}
                        className="px-5 py-2.5 text-gray-400 text-sm font-medium rounded-lg border border-gray-700 hover:text-white hover:border-gray-500 transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                ) : step === 1 ? (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: BRAND_RED }}
                      >
                        1
                      </div>
                      <span className="text-sm text-gray-400">
                        Your details
                      </span>
                      <div className="flex-1 h-px bg-gray-800" />
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold bg-gray-800">
                        2
                      </div>
                      <span className="text-sm text-gray-600">
                        Project info
                      </span>
                    </div>

                    <div className="space-y-3">
                      <FormField
                        icon={User}
                        placeholder="Full Name *"
                        value={form.name}
                        onChange={(v) => updateField("name", v)}
                      />
                      <FormField
                        icon={Mail}
                        type="email"
                        placeholder="Email Address *"
                        value={form.email}
                        onChange={(v) => updateField("email", v)}
                      />
                      <FormField
                        icon={Phone}
                        type="tel"
                        placeholder="Phone / WhatsApp"
                        value={form.phone}
                        onChange={(v) => updateField("phone", v)}
                      />
                      <FormField
                        icon={Building2}
                        placeholder="Company Name"
                        value={form.companyName}
                        onChange={(v) => updateField("companyName", v)}
                      />
                      <FormField
                        icon={Globe}
                        placeholder="Company Website"
                        value={form.companyWebsite}
                        onChange={(v) => updateField("companyWebsite", v)}
                      />
                      <FormField
                        icon={Briefcase}
                        placeholder="Your Role / Designation"
                        value={form.designation}
                        onChange={(v) => updateField("designation", v)}
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-red-400 mt-1">{error}</p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-gray-800 text-gray-400 cursor-pointer hover:text-white transition-colors"
                        onClick={() => setStep(1)}
                      >
                        1
                      </div>
                      <span
                        className="text-sm text-gray-500 cursor-pointer hover:text-gray-300"
                        onClick={() => setStep(1)}
                      >
                        Your details
                      </span>
                      <div className="flex-1 h-px bg-gray-800" />
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: BRAND_RED }}
                      >
                        2
                      </div>
                      <span className="text-sm text-gray-400">
                        Project info
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Budget */}
                      <div>
                        <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                          <CurrencyIcon className="w-3.5 h-3.5" />
                          Budget Range {isIndia ? "(₹ INR)" : "($ USD)"}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {budgetOptions.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => updateField("budget", opt)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                form.budget === opt
                                  ? "border-[#ED1C24] bg-[#ED1C24]/15 text-white"
                                  : "border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div>
                        <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                          <Clock className="w-3.5 h-3.5" />
                          Timeline
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {timelineOptions.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => updateField("timeline", opt)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                form.timeline === opt
                                  ? "border-[#ED1C24] bg-[#ED1C24]/15 text-white"
                                  : "border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Project Description
                        </label>
                        <textarea
                          placeholder="Tell us about your project, goals, and any specific requirements..."
                          value={form.projectDescription}
                          onChange={(e) =>
                            updateField("projectDescription", e.target.value)
                          }
                          rows={4}
                          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#ED1C24]/50 transition-colors resize-none"
                        />
                      </div>

                      {/* Additional Notes */}
                      <textarea
                        placeholder="Anything else we should know? (optional)"
                        value={form.notes}
                        onChange={(e) => updateField("notes", e.target.value)}
                        rows={2}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#ED1C24]/50 transition-colors resize-none"
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-red-400 mt-1">{error}</p>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              {!success && (
                <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
                  {step === 2 ? (
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      ← Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {step === 1 ? (
                    <button
                      onClick={goToStep2}
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-white text-sm font-semibold rounded-lg transition-all"
                      style={{ backgroundColor: BRAND_RED }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#d0171e";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = BRAND_RED;
                      }}
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
                      style={{ backgroundColor: BRAND_RED }}
                      onMouseEnter={(e) => {
                        if (!loading)
                          e.currentTarget.style.backgroundColor = "#d0171e";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = BRAND_RED;
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Request"
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Reusable form field
function FormField({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  icon: any;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#ED1C24]/50 transition-colors"
      />
    </div>
  );
}
