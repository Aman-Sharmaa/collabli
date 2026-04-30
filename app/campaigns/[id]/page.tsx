import { connectDB } from "@/lib/db";
import { Campaign } from "@/models/Campaign";

export default async function CampaignProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const campaign = await Campaign.findById(id).lean();
  if (!campaign) return <main className="p-6">Campaign not found.</main>;
  return <main className="mx-auto max-w-3xl space-y-4 p-6"><h1 className="text-2xl font-bold">{(campaign as any).title}</h1><div className="rounded-xl border bg-white p-4 text-sm"><p>Budget: {(campaign as any).budget}</p><p>Niche: {(campaign as any).niche}</p><p>Deliverables: {(campaign as any).deliverables}</p><p>Deadline: {new Date((campaign as any).deadline).toLocaleDateString()}</p><p>Status: {(campaign as any).status}</p></div></main>;
}
