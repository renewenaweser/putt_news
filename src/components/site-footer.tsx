export function SiteFooter() {
  return (
    <footer className="border-t border-brand-cream mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        <p className="font-medium text-brand-dark">Putt News</p>
        <p className="mt-1">
          Taeglich kuratierte Golf & Putting Insights fuer das{" "}
          <a
            href="https://putting-lab.ch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-green hover:text-brand-light transition-colors"
          >
            Putting Lab
          </a>
        </p>
      </div>
    </footer>
  );
}
