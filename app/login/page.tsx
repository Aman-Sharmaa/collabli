"use client";

import Script from "next/script";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

type UserRole = "brand" | "creator";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("creator");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clientId = useMemo(() => process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "", []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("collabli_remember_email");
      if (saved) setEmail(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      setError("");
      setLoading(true);
      const res = await fetch("/api/collabli/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credential, role }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return setError(data.message || "Google login failed");
      router.push("/dashboard");
    },
    [role, router]
  );

  useEffect(() => {
    if (!clientId || !window.google?.accounts?.id) return;
    const target = document.getElementById("google-login-btn");
    if (!target) return;
    target.innerHTML = "";
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (!response?.credential) return setError("Google sign-in incomplete");
        void handleGoogleCredential(response.credential);
      },
    });
    window.google.accounts.id.renderButton(target, {
      theme: "outline",
      size: "large",
      shape: "rectangular",
      text: "continue_with",
      width: 360,
      logo_alignment: "left",
    });
  }, [clientId, role, handleGoogleCredential]);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (remember) localStorage.setItem("collabli_remember_email", email);
      else localStorage.removeItem("collabli_remember_email");
    } catch {
      /* ignore */
    }
    const res = await fetch("/api/collabli/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.message || "Login failed");
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-neutral-100">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />

      <header className="border-b border-neutral-200 bg-white px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-neutral-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-400 text-sm font-black text-black">
            C
          </span>
          Collabli
        </Link>
      </header>

      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px] rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex rounded-full border border-neutral-200 bg-neutral-50 p-1">
            <button
              type="button"
              onClick={() => setRole("creator")}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                role === "creator" ? "bg-yellow-400 text-black" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Creator
            </button>
            <button
              type="button"
              onClick={() => setRole("brand")}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                role === "brand" ? "bg-yellow-400 text-black" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Brand
            </button>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Login</h1>
          <p className="mt-1 text-sm text-neutral-600">Hi, Welcome back 👋</p>

          <div className="mt-6">
            {clientId ? (
              <div id="google-login-btn" className="flex justify-center [&>div]:w-full" />
            ) : (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-900">
                Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google login.
              </p>
            )}
          </div>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1 bg-neutral-200" />
            <span className="shrink-0 text-xs text-neutral-500">or Login with Email</span>
            <Separator className="flex-1 bg-neutral-200" />
          </div>

          <form onSubmit={onLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="johndoe@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg border-neutral-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-lg border-neutral-300 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" checked={remember} onCheckedChange={(c) => setRemember(c === true)} />
                <Label htmlFor="remember" className="cursor-pointer text-sm font-normal text-neutral-600">
                  Remember Me
                </Label>
              </div>
              <Link href="/forgot-password" className="text-sm font-medium text-yellow-600 hover:text-yellow-700">
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-black font-semibold text-white hover:bg-neutral-800"
            >
              {loading ? "Signing in..." : "Login"}
            </Button>

            {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Not registered yet?{" "}
            <Link href="/signup" className="font-semibold text-yellow-600 hover:text-yellow-700">
              Create an account ↗
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-neutral-500">
            Team admin?{" "}
            <Link href="/admin/login" className="font-medium text-neutral-800 underline-offset-2 hover:underline">
              Sign in at admin login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
