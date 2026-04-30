"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

type Role = "brand" | "creator" | "admin" | string;

export function OnboardingGate({ role, children }: { role: Role; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const skip = pathname?.startsWith("/dashboard/onboarding");

  useEffect(() => {
    if (skip || (role !== "creator" && role !== "brand")) return;
    let cancelled = false;
    void (async () => {
      const res = await fetch("/api/collabli/auth/me");
      const data = await res.json();
      if (cancelled) return;
      if (data.needsOnboarding) {
        router.replace(role === "brand" ? "/dashboard/onboarding/brand" : "/dashboard/onboarding/creator");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, role, router, skip]);

  return <>{children}</>;
}
