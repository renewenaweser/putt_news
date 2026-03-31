import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

function rewriteHref(href: string): string {
  if (href.startsWith("../deep-dives/")) {
    const slug = href.replace("../deep-dives/", "").replace(".md", "");
    return `/deep-dives/${slug}`;
  }
  return href;
}

const components: Components = {
  a: ({ href, children, ...props }) => {
    const resolvedHref = href ? rewriteHref(href) : "#";
    const isExternal =
      resolvedHref.startsWith("http://") ||
      resolvedHref.startsWith("https://");

    return (
      <a
        href={resolvedHref}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        {...props}
      >
        {children}
        {isExternal && (
          <span className="inline-block ml-1 text-xs opacity-50">&#8599;</span>
        )}
      </a>
    );
  },
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div className={`prose prose-lg max-w-none ${className || ""}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
