import Link from "next/link";
import { formatDateDE } from "@/lib/utils";

interface NewsCardProps {
  date: string;
  title: string;
  summary: string;
  featured?: boolean;
}

export function NewsCard({ date, title, summary, featured }: NewsCardProps) {
  return (
    <Link href={`/news/${date}`} className="block group">
      <article
        className={`rounded-xl border border-gray-100 bg-white p-6 transition-all hover:shadow-md hover:border-brand-green/20 ${
          featured ? "ring-2 ring-brand-green/10" : ""
        }`}
      >
        <time className="text-xs font-medium text-brand-gold uppercase tracking-wide">
          {formatDateDE(date)}
        </time>
        <h3
          className={`mt-2 font-semibold text-brand-dark group-hover:text-brand-green transition-colors ${
            featured ? "text-xl" : "text-base"
          }`}
        >
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-3">{summary}</p>
        <span className="inline-block mt-3 text-sm font-medium text-brand-green">
          Weiterlesen &rarr;
        </span>
      </article>
    </Link>
  );
}
