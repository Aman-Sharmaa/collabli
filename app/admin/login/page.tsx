"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/collabli/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: "admin" }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.message || "Login failed");
    router.push("/dashboard/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-6">
      <Card className="w-full max-w-md border-neutral-800 bg-neutral-900 text-white">
        <CardHeader>
          <CardTitle>Admin login</CardTitle>
          <CardDescription className="text-neutral-400">
            Team access only. Approve users from the admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-neutral-200">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-neutral-700 bg-neutral-950 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-200">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-neutral-700 bg-neutral-950 text-white"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-yellow-400 text-black hover:bg-yellow-300" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
          </form>
          <p className="mt-4 text-center text-sm text-neutral-500">
            <Link href="/login" className="text-yellow-400 hover:underline">
              Creator / Brand login
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
