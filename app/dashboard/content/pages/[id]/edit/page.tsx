"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageForm } from "@/components/cms-page-form";

export default function EditPagePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch(`/api/cms/pages/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(({ page }) => {
        setInitial({
          title: page.title,
          slug: page.slug,
          content: page.content || "",
          metaTitle: page.metaTitle || "",
          metaDescription: page.metaDescription || "",
          ogImage: page.ogImage || "",
          layout: page.layout || "default",
          status: page.status || "published",
        });
      })
      .catch(() => toast.error("Failed to load page"))
      .finally(() => setLoading(false));
  }, [id]);

  async function onSubmit(values: Record<string, unknown>) {
    const res = await fetch(`/api/cms/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to update");
    }
    toast.success("Page updated");
    router.push("/dashboard/content/pages");
  }

  if (loading || !initial) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/content/pages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Edit Page</h2>
          <p className="text-sm text-muted-foreground">{String(initial.title)}</p>
        </div>
      </div>
      <PageForm initialValues={initial} onSubmit={onSubmit} />
    </div>
  );
}
