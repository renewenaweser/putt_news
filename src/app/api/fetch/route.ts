import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TOKEN = process.env.FETCH_API_TOKEN;

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,de;q=0.8",
  "Cache-Control": "no-cache",
};

function stripHtmlToText(html: string): string {
  let text = html;

  // Remove script and style blocks
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");

  // Convert common elements to readable text
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/h[1-6]>/gi, "\n\n");
  text = text.replace(/<\/li>/gi, "\n");
  text = text.replace(/<li[^>]*>/gi, "- ");
  text = text.replace(/<\/tr>/gi, "\n");
  text = text.replace(/<\/td>/gi, " | ");

  // Remove all remaining tags
  text = text.replace(/<[^>]+>/g, "");

  // Decode common HTML entities
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&mdash;/g, "—");
  text = text.replace(/&ndash;/g, "–");
  text = text.replace(/&#\d+;/g, "");

  // Clean up whitespace
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();

  // Truncate to ~15K chars to stay within reasonable limits
  if (text.length > 15000) {
    text = text.substring(0, 15000) + "\n\n[truncated]";
  }

  return text;
}

export async function GET(request: NextRequest) {
  // Auth check
  if (ALLOWED_TOKEN) {
    const token = request.nextUrl.searchParams.get("token");
    if (token !== ALLOWED_TOKEN) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json(
      { error: "missing ?url= parameter" },
      { status: 400 }
    );
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "invalid URL" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `upstream returned ${response.status}`, url },
        { status: 502 }
      );
    }

    const html = await response.text();
    const text = stripHtmlToText(html);

    return NextResponse.json({
      url,
      status: response.status,
      content: text,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed";
    return NextResponse.json({ error: message, url }, { status: 502 });
  }
}
