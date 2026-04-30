import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Plan } from "@/models/Plan";
import { verifyToken } from "@/lib/auth";
import { PlanPagesClient } from "@/components/plan-pages-client";
import { notFound } from "next/navigation";

const COOKIE_NAME = "kalp_auth_token";

interface PlanPageProps {
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

async function getPlan(id: string) {
    await connectDB();
    const plan = await Plan.findById(id).lean();
    if (!plan) return null;
    return {
        ...plan,
        _id: String(plan._id),
    };
}

export default async function ViewPlanFull({ params }: PlanPageProps) {
    const { id } = await params;
    const user = await requireAuth();
    const plan = await getPlan(id);

    if (!plan) {
        notFound();
    }

    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading pages...</div>}>
            <PlanPagesClient planId={plan._id} planName={plan.name} />
        </Suspense>
    );
}
