import { getAllNewsDigests } from "@/lib/content";
import { NewsCard } from "@/components/news-card";

export default function HomePage() {
  const digests = getAllNewsDigests();
  const latest = digests[0];
  const olderDigests = digests.slice(1, 6);

  return (
    <div>
      <section className="mb-12">
        <p className="text-sm font-medium text-brand-gold uppercase tracking-wide">
          Täglich kuratiert
        </p>
        <h1 className="mt-1 text-3xl font-bold text-brand-dark">
          Golf & Putting Insights
        </h1>
        <p className="mt-2 text-gray-600 max-w-xl">
          Aktuelle News, Technologie-Trends und Analysen rund um Putting und
          Indoor-Golf. Zusammengestellt für das Putting Lab.
        </p>
      </section>

      {latest && (
        <section className="mb-12">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Aktuellster Digest
          </h2>
          <NewsCard
            date={latest.date}
            title={latest.title}
            summary={latest.summary}
            featured
          />
        </section>
      )}

      {olderDigests.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Frühere Digests
          </h2>
          <div className="space-y-4">
            {olderDigests.map((digest) => (
              <NewsCard
                key={digest.date}
                date={digest.date}
                title={digest.title}
                summary={digest.summary}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
