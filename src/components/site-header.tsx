import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-cream">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold text-brand-dark group-hover:text-brand-green transition-colors">
            Putt News
          </span>
          <span className="text-xs text-brand-gold font-medium bg-brand-cream px-2 py-0.5 rounded-full">
            by Putting Lab
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/news"
            className="text-gray-600 hover:text-brand-green transition-colors"
          >
            News
          </Link>
        </nav>
      </div>
    </header>
  );
}
