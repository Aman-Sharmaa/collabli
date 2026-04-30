import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { MonitorGroup } from "@/models/MonitorGroup";
import { StatusPageClient } from "@/components/status-page-client";

type Props = { params: Promise<{ groupSlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { groupSlug } = await params;
  await connectDB();
  const group = await MonitorGroup.findOne({ slug: groupSlug }).select("name").lean();
  return {
    title: group ? `${group.name} · Status` : "Status",
    description: group ? `Status page for ${group.name}` : "Service status",
  };
}

export default async function StatusPage({ params }: Props) {
  const { groupSlug } = await params;
  await connectDB();
  const group = await MonitorGroup.findOne({ slug: groupSlug }).lean();
  if (!group) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <StatusPageClient groupSlug={groupSlug} initialGroupName={(group as any).name} />
    </div>
  );
}
