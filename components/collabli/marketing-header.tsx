import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-neutral-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400 text-sm font-black text-black">
            C
          </span>
          Collabli
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
          <Link href="/#creators" className="hover:text-neutral-900">
            Creators
          </Link>
          <Link href="/#brands" className="hover:text-neutral-900">
            Brands
          </Link>
          <Link href="/creators" className="hover:text-neutral-900">
            Directory
          </Link>
          <Link href="/campaigns" className="hover:text-neutral-900">
            Campaigns
          </Link>
          <Link href="/brands" className="hover:text-neutral-900">
            Brand hub
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Join
          </Link>
        </div>
      </div>
    </header>
  );
}
