import type { ReactNode } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { MapPin, Eye, Heart, Share2, BarChart3 } from "lucide-react";
import { MarketingFooter } from "@/components/collabli/marketing-footer";
import { MarketingHeader } from "@/components/collabli/marketing-header";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { CreatorProfile } from "@/models/CreatorProfile";
import { BrandProfile } from "@/models/BrandProfile";
import { normalizeHandle } from "@/lib/handle";

type PageProps = { params: Promise<{ handle: string }> };

export default async function PublicProfilePage({ params }: PageProps) {
  const { handle: raw } = await params;
  const handle = normalizeHandle(raw);
  if (!handle) notFound();
  if (!process.env.MONGODB_URI) notFound();

  await connectDB();
  const user = await User.findOne({
    publicHandle: handle,
    role: { $in: ["creator", "brand"] },
    approvalStatus: "approved",
    $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
  })
    .select("name email role avatarUrl company publicHandle")
    .lean();

  if (!user) notFound();

  const isCreator = user.role === "creator";
  const profile = isCreator
    ? await CreatorProfile.findOne({ userId: user._id }).lean()
    : await BrandProfile.findOne({ userId: user._id }).lean();

  const displayName = isCreator
    ? user.name || "Creator"
    : (profile as { companyName?: string } | null)?.companyName || user.company || user.name || "Brand";

  const bio = isCreator ? (profile as { bio?: string } | null)?.bio || "" : (profile as { tagline?: string } | null)?.tagline || "";
  const location = profile?.location || "";
  const niche = isCreator ? (profile as { niche?: string }).niche || "" : (profile as { industry?: string }).industry || "";
  const socialLinks = (profile?.socialLinks || []) as {
    platform: string;
    profileUrl: string;
    followers?: number;
    following?: number;
  }[];
  const projects = (profile?.projects || []) as {
    imageUrl?: string;
    title: string;
    description?: string;
    views?: number;
    impressions?: number;
    likes?: number;
    shares?: number;
  }[];

  const totalFollowers = socialLinks.reduce((s, l) => s + (Number(l.followers) || 0), 0);
  const totalFollowing = socialLinks.reduce((s, l) => s + (Number(l.following) || 0), 0);

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <MarketingHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-800">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-800">@{user.publicHandle}</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
          <aside className="h-fit space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 text-3xl font-bold text-neutral-400">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                displayName[0]?.toUpperCase() || "?"
              )}
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold">{displayName}</h1>
              <p className="text-sm font-medium text-yellow-700">@{user.publicHandle}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">{isCreator ? "Creator" : "Brand"}</p>
            </div>
            {location ? (
              <p className="flex items-center justify-center gap-1 text-sm text-neutral-600">
                <MapPin className="h-4 w-4" />
                {location}
              </p>
            ) : null}
            {niche ? <p className="text-center text-sm text-neutral-600">{niche}</p> : null}
            {bio ? <p className="text-center text-sm leading-relaxed text-neutral-700">{bio}</p> : null}

            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-neutral-50 p-3 text-center">
              <div>
                <p className="text-lg font-bold text-neutral-900">{totalFollowers.toLocaleString()}</p>
                <p className="text-xs text-neutral-500">Followers (sum)</p>
              </div>
              <div>
                <p className="text-lg font-bold text-neutral-900">{totalFollowing.toLocaleString()}</p>
                <p className="text-xs text-neutral-500">Following (sum)</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Connected</p>
              {socialLinks.length === 0 ? (
                <p className="text-sm text-neutral-400">No public links yet.</p>
              ) : (
                socialLinks.map((l, i) => (
                  <a
                    key={i}
                    href={l.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col rounded-xl border border-neutral-100 bg-neutral-50/80 px-3 py-2 text-sm hover:border-yellow-200"
                  >
                    <span className="font-medium capitalize text-neutral-800">{l.platform}</span>
                    <span className="truncate text-xs text-neutral-500">{l.profileUrl}</span>
                    {(l.followers || l.following) ? (
                      <span className="mt-1 text-xs text-neutral-600">
                        {l.followers != null ? `${Number(l.followers).toLocaleString()} followers` : ""}
                        {l.followers != null && l.following != null ? " · " : ""}
                        {l.following != null ? `${Number(l.following).toLocaleString()} following` : ""}
                      </span>
                    ) : null}
                  </a>
                ))
              )}
            </div>

            {isCreator && profile && (profile as { rate?: number }).rate ? (
              <p className="text-center text-sm text-neutral-600">
                From <span className="font-semibold text-neutral-900">${Number((profile as { rate?: number }).rate).toLocaleString()}</span> / campaign
              </p>
            ) : null}

            <ButtonRow isCreator={isCreator} />
          </aside>

          <div className="space-y-6">
            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Statistics</h2>
                <div className="flex gap-2">
                  {socialLinks.slice(0, 4).map((l, i) => (
                    <span key={i} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium capitalize text-neutral-700">
                      {l.platform}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <Stat icon={<Eye className="h-4 w-4" />} label="Total views (portfolio)" value={projects.reduce((s, p) => s + (Number(p.views) || 0), 0)} />
                <Stat icon={<BarChart3 className="h-4 w-4" />} label="Impressions" value={projects.reduce((s, p) => s + (Number(p.impressions) || 0), 0)} />
                <Stat icon={<Heart className="h-4 w-4" />} label="Likes" value={projects.reduce((s, p) => s + (Number(p.likes) || 0), 0)} />
              </div>
            </section>

            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Media & projects</h2>
              <p className="mt-1 text-sm text-neutral-500">Thumbnails, views, and engagement on each piece.</p>
              {projects.length === 0 ? (
                <p className="mt-8 text-center text-sm text-neutral-400">No projects published yet.</p>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.map((p, i) => (
                    <article key={i} className="overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50">
                      <div className="relative aspect-[4/5] bg-neutral-200">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-neutral-400">No image</div>
                        )}
                        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-2 text-[10px] font-semibold text-white">
                          <span className="rounded-full bg-black/60 px-2 py-0.5 backdrop-blur">
                            <Eye className="mr-0.5 inline h-3 w-3" />
                            {Number(p.views || 0).toLocaleString()}
                          </span>
                          <span className="rounded-full bg-black/60 px-2 py-0.5 backdrop-blur">
                            <Heart className="mr-0.5 inline h-3 w-3" />
                            {Number(p.likes || 0).toLocaleString()}
                          </span>
                          <span className="rounded-full bg-black/60 px-2 py-0.5 backdrop-blur">
                            <Share2 className="mr-0.5 inline h-3 w-3" />
                            {Number(p.shares || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-neutral-900">{p.title}</h3>
                        {p.description ? <p className="mt-1 line-clamp-2 text-xs text-neutral-600">{p.description}</p> : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
      <div className="flex items-center gap-2 text-neutral-500">{icon}<span className="text-xs font-medium uppercase tracking-wide">{label}</span></div>
      <p className="mt-2 text-2xl font-bold text-neutral-900">{value.toLocaleString()}</p>
    </div>
  );
}

function ButtonRow({ isCreator }: { isCreator: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <Link
        href="/login"
        className="flex h-11 items-center justify-center rounded-2xl bg-yellow-400 text-sm font-semibold text-black hover:bg-yellow-500"
      >
        {isCreator ? "Invite to campaign" : "Work with this brand"}
      </Link>
      <Link href="/signup" className="text-center text-xs text-neutral-500 hover:text-neutral-800">
        Log in to Collabli to collaborate
      </Link>
    </div>
  );
}
