import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd());

export interface NewsDigest {
  date: string;
  title: string;
  summary: string;
  content: string;
  sections: string[];
}

export interface DeepDive {
  slug: string;
  date: string;
  title: string;
  source: string;
  category: string;
  content: string;
  excerpt: string;
}

function extractBetweenHeadings(
  content: string,
  heading: string
): string | null {
  const regex = new RegExp(
    `## ${heading}\\n([\\s\\S]*?)(?=\\n## |$)`,
    "m"
  );
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

function extractH2Headings(content: string): string[] {
  const matches = content.match(/^## .+$/gm);
  return matches ? matches.map((h) => h.replace("## ", "")) : [];
}

export function getAllNewsDigests(): NewsDigest[] {
  const newsDir = path.join(CONTENT_DIR, "news");
  if (!fs.existsSync(newsDir)) return [];

  const files = fs
    .readdirSync(newsDir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse();

  return files.map((file) => {
    const date = file.replace(".md", "");
    const content = fs.readFileSync(path.join(newsDir, file), "utf-8");
    const titleMatch = content.match(/^# (.+)$/m);
    const title = titleMatch ? titleMatch[1] : `News ${date}`;
    const summary = extractBetweenHeadings(content, "Zusammenfassung") || "";
    const sections = extractH2Headings(content);

    return { date, title, summary, content, sections };
  });
}

export function getNewsDigest(date: string): NewsDigest | null {
  const filePath = path.join(CONTENT_DIR, "news", `${date}.md`);
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, "utf-8");
  const titleMatch = content.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1] : `News ${date}`;
  const summary = extractBetweenHeadings(content, "Zusammenfassung") || "";
  const sections = extractH2Headings(content);

  return { date, title, summary, content, sections };
}

export function getAllDeepDives(): DeepDive[] {
  const deepDivesDir = path.join(CONTENT_DIR, "deep-dives");
  if (!fs.existsSync(deepDivesDir)) return [];

  const files = fs
    .readdirSync(deepDivesDir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse();

  return files.map((file) => parseDeepDive(file));
}

export function getDeepDive(slug: string): DeepDive | null {
  const deepDivesDir = path.join(CONTENT_DIR, "deep-dives");
  const file = `${slug}.md`;
  const filePath = path.join(deepDivesDir, file);
  if (!fs.existsSync(filePath)) return null;

  return parseDeepDive(file);
}

function parseDeepDive(file: string): DeepDive {
  const deepDivesDir = path.join(CONTENT_DIR, "deep-dives");
  const slug = file.replace(".md", "");
  const content = fs.readFileSync(path.join(deepDivesDir, file), "utf-8");

  const titleMatch = content.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1] : slug;

  const dateMatch = content.match(/\*\*Datum:\*\*\s*(.+)/);
  const date = dateMatch ? dateMatch[1].trim() : slug.substring(0, 10);

  const sourceMatch = content.match(/\*\*Quelle:\*\*\s*(.+)/);
  const source = sourceMatch ? sourceMatch[1].trim() : "";

  const categoryMatch = content.match(/\*\*Kategorie:\*\*\s*(.+)/);
  const category = categoryMatch ? categoryMatch[1].trim() : "";

  const kernaussagen = extractBetweenHeadings(content, "Kernaussagen") || "";
  const firstPoint = kernaussagen.split("\n").find((l) => l.trim().length > 0);
  const excerpt = firstPoint
    ? firstPoint.replace(/^\d+\.\s*\*\*.*?\*\*:\s*/, "").substring(0, 200)
    : "";

  return { slug, date, title, source, category, content, excerpt };
}
