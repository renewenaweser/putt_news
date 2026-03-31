import { getAllNewsDigests } from "@/lib/content";
import { NewsCard } from "@/components/news-card";

export const metadata = {
  title: "News Archiv - Putt News",
};

export default function NewsArchivePage() {
  const digests = getAllNewsDigests();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">News Archiv</h1>
      <p className="mt-1 text-gray-600">
        Alle taeglichen Golf & Putting Digests
      </p>

      <div className="mt-8 space-y-4">
        {digests.map((digest) => (
          <NewsCard
            key={digest.date}
            date={digest.date}
            title={digest.title}
            summary={digest.summary}
          />
        ))}
      </div>

      {digests.length === 0 && (
        <p className="mt-8 text-gray-500">Noch keine News vorhanden.</p>
      )}
    </div>
  );
}
