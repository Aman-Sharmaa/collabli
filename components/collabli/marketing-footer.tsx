import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 font-semibold text-neutral-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400 text-sm font-black text-black">
                C
              </span>
              Collabli
            </div>
            <p className="mt-3 max-w-sm text-sm text-neutral-600">
              Where brands and creators run campaigns, track deals, and grow together.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-neutral-900">Product</p>
              <Link href="/creators" className="block text-neutral-600 hover:text-neutral-900">
                Creators
              </Link>
              <Link href="/brands" className="block text-neutral-600 hover:text-neutral-900">
                Brands
              </Link>
              <Link href="/signup" className="block text-neutral-600 hover:text-neutral-900">
                Sign up
              </Link>
            </div>
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-neutral-900">Company</p>
              <Link href="/landing" className="block text-neutral-600 hover:text-neutral-900">
                About
              </Link>
              <Link href="/admin/login" className="block text-neutral-600 hover:text-neutral-900">
                Admin
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-neutral-500">© {new Date().getFullYear()} Collabli</p>
      </div>
    </footer>
  );
}
