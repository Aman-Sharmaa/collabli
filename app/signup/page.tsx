"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
type UserRole = "brand" | "creator";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("creator");
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [creator, setCreator] = useState({
    niche: "",
    platforms: "",
    audienceSize: "",
    location: "",
    rate: "",
    bio: "",
  });
  const [brand, setBrand] = useState({
    companyName: "",
    industry: "",
    website: "",
    location: "",
    monthlyBudget: "",
  });

  const totalSteps = 2;
  const progressPct = (step / totalSteps) * 100;

  function resetFlow() {
    setStep(1);
    setName("");
    setEmail("");
    setPassword("");
    setCreator({ niche: "", platforms: "", audienceSize: "", location: "", rate: "", bio: "" });
    setBrand({ companyName: "", industry: "", website: "", location: "", monthlyBudget: "" });
    setError("");
  }

  function switchRole(next: UserRole) {
    setRole(next);
    resetFlow();
  }

  function validateStep1(): boolean {
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill name, email, and password.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    setError("");
    return true;
  }

  function validateStep2(): boolean {
    if (role === "creator") {
      if (!creator.niche || !creator.platforms || !creator.audienceSize || !creator.location || !creator.rate || !creator.bio) {
        setError("Please complete all creator onboarding fields.");
        return false;
      }
    } else {
      if (!brand.companyName || !brand.industry || !brand.website || !brand.location || !brand.monthlyBudget) {
        setError("Please complete all brand onboarding fields.");
        return false;
      }
    }
    setError("");
    return true;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    setSuccess("");

    const profile =
      role === "creator"
        ? {
            niche: creator.niche,
            platforms: creator.platforms.split(",").map((v) => v.trim()).filter(Boolean),
            audienceSize: Number(creator.audienceSize || 0),
            location: creator.location,
            rate: Number(creator.rate || 0),
            bio: creator.bio,
          }
        : {
            companyName: brand.companyName,
            industry: brand.industry,
            website: brand.website,
            location: brand.location,
            monthlyBudget: Number(brand.monthlyBudget || 0),
          };

    const res = await fetch("/api/collabli/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, profile }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.message || "Signup failed");
    setSuccess("Application submitted. An admin will review and approve your account.");
    setTimeout(() => router.push("/login"), 1800);
  }

  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white px-6 py-4">
        <Link href="/landing" className="inline-flex items-center gap-2 font-semibold text-neutral-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-400 text-sm font-black text-black">
            C
          </span>
          Collabli
        </Link>
      </header>

      <div className="mx-auto max-w-xl px-4 py-10">
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <div className="mb-4 flex rounded-full border border-neutral-200 bg-neutral-50 p-1">
              <button
                type="button"
                onClick={() => switchRole("creator")}
                className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                  role === "creator" ? "bg-yellow-400 text-black" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Creator onboarding
              </button>
              <button
                type="button"
                onClick={() => switchRole("brand")}
                className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                  role === "brand" ? "bg-yellow-400 text-black" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Brand onboarding
              </button>
            </div>

            <CardTitle className="text-2xl">
              {role === "creator" ? "Creator signup" : "Brand signup"}
            </CardTitle>
            <CardDescription>
              Step {step} of {totalSteps} — {step === 1 ? "Account" : role === "creator" ? "Profile & niche" : "Company & budget"}
            </CardDescription>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (step === 1) {
                  if (validateStep1()) setStep(2);
                } else {
                  void onSubmit(e);
                }
              }}
              className="space-y-4"
            >
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label>Full name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="johndoe@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      minLength={8}
                    />
                  </div>
                </>
              )}

              {step === 2 && role === "creator" && (
                <div className="space-y-4 rounded-xl border border-neutral-200 bg-neutral-50/50 p-4">
                  <p className="text-sm font-semibold text-neutral-900">Creator profile</p>
                  <div className="space-y-2">
                    <Label>Niche</Label>
                    <Input
                      value={creator.niche}
                      onChange={(e) => setCreator((v) => ({ ...v, niche: e.target.value }))}
                      placeholder="e.g. Fitness, Tech, Beauty"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Platforms</Label>
                    <Input
                      value={creator.platforms}
                      onChange={(e) => setCreator((v) => ({ ...v, platforms: e.target.value }))}
                      placeholder="Instagram, YouTube, TikTok (comma separated)"
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Audience size</Label>
                      <Input
                        type="number"
                        value={creator.audienceSize}
                        onChange={(e) => setCreator((v) => ({ ...v, audienceSize: e.target.value }))}
                        placeholder="Total followers"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Typical rate (USD)</Label>
                      <Input
                        type="number"
                        value={creator.rate}
                        onChange={(e) => setCreator((v) => ({ ...v, rate: e.target.value }))}
                        placeholder="Per campaign"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={creator.location}
                      onChange={(e) => setCreator((v) => ({ ...v, location: e.target.value }))}
                      placeholder="City, Country"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                      value={creator.bio}
                      onChange={(e) => setCreator((v) => ({ ...v, bio: e.target.value }))}
                      placeholder="Tell brands who you are and what you create"
                      rows={4}
                      required
                    />
                  </div>
                </div>
              )}

              {step === 2 && role === "brand" && (
                <div className="space-y-4 rounded-xl border border-neutral-200 bg-neutral-50/50 p-4">
                  <p className="text-sm font-semibold text-neutral-900">Brand profile</p>
                  <div className="space-y-2">
                    <Label>Company name</Label>
                    <Input
                      value={brand.companyName}
                      onChange={(e) => setBrand((v) => ({ ...v, companyName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Input
                      value={brand.industry}
                      onChange={(e) => setBrand((v) => ({ ...v, industry: e.target.value }))}
                      placeholder="e.g. SaaS, Fashion, Food"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      type="url"
                      value={brand.website}
                      onChange={(e) => setBrand((v) => ({ ...v, website: e.target.value }))}
                      placeholder="https://"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={brand.location}
                      onChange={(e) => setBrand((v) => ({ ...v, location: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly influencer budget (USD)</Label>
                    <Input
                      type="number"
                      value={brand.monthlyBudget}
                      onChange={(e) => setBrand((v) => ({ ...v, monthlyBudget: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              )}

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {success ? <p className="text-sm text-green-600">{success}</p> : null}

              <div className="flex gap-2 pt-2">
                {step === 2 ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setStep(1);
                      setError("");
                    }}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" className="flex-1" asChild>
                    <Link href="/login">Cancel</Link>
                  </Button>
                )}
                <Button type="submit" className="flex-1 bg-black text-white hover:bg-neutral-800" disabled={loading}>
                  {step === 1 ? (
                    <>
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  ) : loading ? (
                    "Submitting..."
                  ) : (
                    "Submit for approval"
                  )}
                </Button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-600">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-yellow-600 hover:text-yellow-700">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
