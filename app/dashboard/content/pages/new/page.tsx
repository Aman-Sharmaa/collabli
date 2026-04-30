"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageForm } from "@/components/cms-page-form";

export default function NewPagePage() {
  const router = useRouter();

  async function onSubmit(values: Record<string, unknown>) {
    const res = await fetch("/api/cms/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to create");
    }
    toast.success("Page created");
    router.push("/dashboard/content/pages");
  }

  return (
    <div className="h-full">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/content/pages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold leading-none">Add Page</h2>
        </div>
      </div>
      <PageForm onSubmit={onSubmit} />
    </div>
  );
}
