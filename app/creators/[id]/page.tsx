import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { normalizeHandle } from "@/lib/handle";
import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

/** Legacy /creators/[id] — only approved creators with a public handle resolve; others 404. */
export default async function CreatorPublicProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!process.env.MONGODB_URI) notFound();

  await connectDB();
  const user = await User.findById(id)
    .select("role approvalStatus publicHandle deletedAt")
    .lean();

  if (!user || user.role !== "creator" || user.approvalStatus !== "approved") {
    notFound();
  }
  if (user.deletedAt) notFound();

  const handle = user.publicHandle ? normalizeHandle(String(user.publicHandle)) : "";
  if (!handle) notFound();

  redirect(`/u/${handle}`);
}
