import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { PlanPage } from "@/models/PlanPage";
import { verifyToken } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RichTextDisplay } from "@/components/rich-text-editor";
import Link from "next/link";

const COOKIE_NAME = "kalp_auth_token";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

async function requireAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) redirect("/login");
    try {
        return verifyToken(token);
    } catch {
        redirect("/login");
    }
}

async function getPageData(id: string) {
    await connectDB();
    const page = await PlanPage.findById(id).lean();
    if (!page) return null;
    return {
        ...page,
        _id: String(page._id),
    };
}

export default async function ViewPageFull({ params }: PageProps) {
    await requireAuth();
    const { id } = await params;
    const page = await getPageData(id);

    if (!page) {
        notFound();
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Action bar */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">{page.name}</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">Document View</p>
                </div>
                <Button variant="outline" size="sm" asChild className="gap-2 rounded-lg">
                    <Link href={`/dashboard/projects/plans/pages/${id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        Edit
                    </Link>
                </Button>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border shadow-sm p-8 md:p-12 min-h-[600px]">
                {page.content ? (
                    <RichTextDisplay html={page.content} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-muted-foreground min-h-[400px]">
                        <p>No content available for this document.</p>
                        <Button variant="link" asChild>
                            <Link href={`/dashboard/projects/plans/pages/${id}/edit`}>
                                Start writing...
                            </Link>
                        </Button>
                    </div>
                )}
            </div>

            {page.url && (
                <div className="pt-2 text-center">
                    <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center justify-center gap-1"
                    >
                        Reference Link: {page.url}
                    </a>
                </div>
            )}
        </div>
    );
}
