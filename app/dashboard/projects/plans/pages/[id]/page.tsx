"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RichTextDisplay } from "@/components/rich-text-editor";

export default function ViewPlanPage() {
    const router = useRouter();
    const params = useParams();
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPage() {
            try {
                const res = await fetch(`/api/plans/pages/${params?.id}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to fetch page");
                setPage(data.page);
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to load page");
                router.push("/dashboard/projects/plans");
            } finally {
                setLoading(false);
            }
        }
        if (params?.id) fetchPage();
    }, [params?.id, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!page) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 py-4 -mx-4 px-4 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/projects/plans">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">{page.name}</h1>
                    </div>
                </div>
                <Button variant="outline" size="sm" asChild className="gap-2">
                    <Link href={`/dashboard/projects/plans/pages/${params?.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        Edit Document
                    </Link>
                </Button>
            </div>

            <div className="bg-white dark:bg-zinc-950 rounded-xl border shadow-sm p-8 md:p-12 min-h-[600px]">
                {page.content ? (
                    <RichTextDisplay html={page.content} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-muted-foreground min-h-[400px]">
                        <p>No content available for this document.</p>
                        <Button variant="link" asChild>
                            <Link href={`/dashboard/projects/plans/pages/${params?.id}/edit`}>
                                Start writing...
                            </Link>
                        </Button>
                    </div>
                )}
            </div>

            {page.url && (
                <div className="pt-4 text-center">
                    <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center justify-center gap-1"
                    >
                        Visit external link: {page.url}
                    </a>
                </div>
            )}
        </div>
    );
}
