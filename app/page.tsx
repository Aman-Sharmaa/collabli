import Link from "next/link";

export const dynamic = "force-dynamic";
import { MarketingFooter } from "@/components/collabli/marketing-footer";
import { MarketingHeader } from "@/components/collabli/marketing-header";
import { Button } from "@/components/ui/button";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { CreatorProfile } from "@/models/CreatorProfile";
import { BrandProfile } from "@/models/BrandProfile";

type DirCreator = { handle: string; name: string; niche: string; audienceSize: number; location: string; avatarUrl: string };
type DirBrand = { handle: string; name: string; industry: string; location: string; avatarUrl: string };

async function loadDirectory(): Promise<{ creators: DirCreator[]; brands: DirBrand[] }> {
  if (!process.env.MONGODB_URI) return { creators: [], brands: [] };
  try {
    await connectDB();
    const users = await User.find({
      publicHandle: { $exists: true, $nin: [null, ""] },
      role: { $in: ["creator", "brand"] },
      approvalStatus: "approved",
    })
      .select("name email publicHandle role avatarUrl company")
      .lean();

    const creatorIds = users.filter((u) => u.role === "creator").map((u) => u._id);
    const brandIds = users.filter((u) => u.role === "brand").map((u) => u._id);

    const [cProfiles, bProfiles] = await Promise.all([
      creatorIds.length ? CreatorProfile.find({ userId: { $in: creatorIds } }).lean() : [],
      brandIds.length ? BrandProfile.find({ userId: { $in: brandIds } }).lean() : [],
    ]);

    const cMap = new Map(cProfiles.map((p) => [String(p.userId), p]));
    const bMap = new Map(bProfiles.map((p) => [String(p.userId), p]));

    const creators: DirCreator[] = users
      .filter((u) => u.role === "creator")
      .map((u) => {
        const p = cMap.get(String(u._id));
        return {
          handle: u.publicHandle as string,
          name: u.name || "Creator",
          niche: p?.niche || "",
          audienceSize: p?.audienceSize || 0,
          location: p?.location || "",
          avatarUrl: u.avatarUrl || "",
        };
      });

    const brands: DirBrand[] = users
      .filter((u) => u.role === "brand")
      .map((u) => {
        const p = bMap.get(String(u._id));
        return {
          handle: u.publicHandle as string,
          name: p?.companyName || u.company || u.name || "Brand",
          industry: p?.industry || "",
          location: p?.location || "",
          avatarUrl: u.avatarUrl || "",
        };
      });

    return { creators, brands };
  } catch {
    return { creators: [], brands: [] };
  }
}

export default async function HomePage() {
  const { creators, brands } = await loadDirectory();
  const previewCreators = creators.slice(0, 6);
  const previewBrands = brands.slice(0, 6);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <MarketingHeader />

      <section className="relative overflow-hidden border-b border-neutral-100 bg-gradient-to-b from-neutral-50 to-white px-4 py-20 sm:px-6">
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-yellow-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-neutral-900/5 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-yellow-600">Creator × Brand</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Campaigns that feel like{" "}
            <span className="bg-gradient-to-r from-yellow-500 to-amber-400 bg-clip-text text-transparent">social</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-600">
            Public profiles, project grids, and synced social stats — discover creators and brands built for modern collabs.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="h-12 rounded-2xl bg-black px-8 text-base font-semibold text-white hover:bg-neutral-800">
              <Link href="/signup">Get started</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-2xl border-neutral-300 px-8 text-base font-semibold">
              <Link href="/creators">Browse creators</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="creators" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured creators</h2>
            <p className="mt-1 text-sm text-neutral-600">Instagram-style @ handles and live portfolio grids.</p>
          </div>
          <Link href="/creators" className="text-sm font-semibold text-yellow-700 hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {previewCreators.length === 0 ? (
            <p className="col-span-full text-sm text-neutral-500">No public creator profiles yet. Be the first to join.</p>
          ) : (
            previewCreators.map((c) => (
              <Link
                key={c.handle}
                href={`/u/${c.handle}`}
                className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-300 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 text-lg font-bold text-neutral-500">
                    {c.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      c.name[0]?.toUpperCase() || "C"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-neutral-900">{c.name}</p>
                    <p className="text-sm text-yellow-700">@{c.handle}</p>
                    <p className="mt-1 text-xs text-neutral-500">{c.niche || "Creator"} · {c.location || "—"}</p>
                    <p className="mt-2 text-xs font-medium text-neutral-600">{Number(c.audienceSize).toLocaleString()} reach</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section id="brands" className="border-t border-neutral-100 bg-neutral-50/80 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Brands on Collabli</h2>
              <p className="mt-1 text-sm text-neutral-600">Showcases, budgets, and social proof in one place.</p>
            </div>
            <Link href="/brands" className="text-sm font-semibold text-yellow-700 hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {previewBrands.length === 0 ? (
              <p className="col-span-full text-sm text-neutral-500">Brand profiles will appear here once published.</p>
            ) : (
              previewBrands.map((b) => (
                <Link
                  key={b.handle}
                  href={`/u/${b.handle}`}
                  className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-300 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-900 text-sm font-bold text-yellow-400">
                      {b.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        b.name[0]?.toUpperCase() || "B"
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-neutral-900">{b.name}</p>
                      <p className="text-sm text-yellow-700">@{b.handle}</p>
                      <p className="mt-1 text-xs text-neutral-500">{b.industry || "Brand"} · {b.location || "—"}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
