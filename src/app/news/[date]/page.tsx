import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllNewsDigests, getNewsDigest } from "@/lib/content";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { formatDateDE } from "@/lib/utils";

interface Props {
  params: Promise<{ date: string }>;
}

export async function generateStaticParams() {
  const digests = getAllNewsDigests();
  return digests.map((d) => ({ date: d.date }));
}

export async function generateMetadata({ params }: Props) {
  const { date } = await params;
  const digest = getNewsDigest(date);
  return { title: digest ? digest.title : "News" };
}

export default async function NewsDetailPage({ params }: Props) {
  const { date } = await params;
  const digest = getNewsDigest(date);
  if (!digest) notFound();

  const contentWithoutTitle = digest.content.replace(/^# .+\n/, "");

  return (
    <div>
      <nav className="text-sm text-gray-500 mb-6">
        <Link
          href="/news"
          className="hover:text-brand-green transition-colors"
        >
          &larr; News Archiv
        </Link>
      </nav>

      <header className="mb-8">
        <time className="text-sm font-medium text-brand-gold">
          {formatDateDE(date)}
        </time>
        <h1 className="mt-1 text-2xl font-bold text-brand-dark">
          {digest.title}
        </h1>
      </header>

      <div className="flex gap-8">
        <article className="flex-1 min-w-0">
          <MarkdownRenderer content={contentWithoutTitle} />
        </article>

        <aside className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-20">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Sektionen
            </p>
            <nav className="space-y-2">
              {digest.sections.map((section) => (
                <a
                  key={section}
                  href={`#${section.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="block text-xs text-gray-500 hover:text-brand-green transition-colors"
                >
                  {section}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}
