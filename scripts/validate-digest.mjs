#!/usr/bin/env node
/**
 * Deterministischer Digest-Linter für putt_news.
 *
 * Prüft eine `news/YYYY-MM-DD.md`-Datei gegen die maschinell prüfbaren Regeln aus
 * CLAUDE.md UND gegen die Parse-Verträge beider Konsumenten:
 *   - Website  src/lib/content.ts  (H1 `# `, `## Zusammenfassung`, `## `-Sektionen)
 *   - App      keep-putting/lib/news.ts (Bullet `**Titel** (dd.mm.) - text | Quelle | https://url`,
 *              keine `---`/Footer-Zeilen, Datum im Kurzformat)
 *
 * Aufruf:   node scripts/validate-digest.mjs news/2026-06-26.md [--quiet] [--baseline]
 * Ausgabe:  JSON-Report nach stdout. Exit 0 = pass (keine error-Verstöße), 1 = fail.
 * Flags:
 *   --quiet     nur JSON (kein menschenlesbarer Zusatz auf stderr)
 *   --baseline  alle error → warn herabstufen (für Back-Catalogue-Sweeps; Exit immer 0)
 *
 * Keine Dependencies. Kein Git, kein Netz. "Heute" und "letzte 7 Digests" werden
 * deterministisch aus den Dateinamen im news/-Verzeichnis abgeleitet.
 */

import { readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";

// ---------------------------------------------------------------------------
// Konfiguration / Schwellenwerte (Quelle: CLAUDE.md, footer-frei)
// ---------------------------------------------------------------------------
const WORDS_MIN = 650;
const WORDS_MAX = 1100;
const WORDS_HARD_MIN = 500; // darunter: error statt warn
const WORDS_HARD_MAX = 1300; // darüber: error statt warn
const SUMMARY_MIN = 100;
const SUMMARY_MAX = 140;
const ENTRIES_MIN = 6;
const ENTRIES_MAX = 9;
const ENTRIES_HARD_MAX = 12; // darüber: error (Bloat)
const RECENT_DAYS = 7;

/** 3.-Person-Aktiv-Verben, die eine eigenständige News-Klausel markieren. */
const NEWS_VERBS =
  /\b(siegt|gewinnt|gewann|führt|verpasst|stellt|startet|starten|holt|baut|setzt|kehrt|traf|trifft|schlägt|jagt|krönt|sichert|dominiert|eröffnet|verteidigt|übernimmt|liefert|bringt|lanciert|kassiert|stürmt|patzt|debütiert|bricht|einlocht|locht)\b/i;

/**
 * Umlaut-Substitutionen: KONSERVATIVE Denylist von Wort-Stämmen, die im Deutschen
 * praktisch immer einen Umlaut/ß bräuchten. Bewusst KEINE bare-substring-Suche
 * (würde "neue", "Steuer", "Trauer" etc. fälschlich treffen).
 */
const UMLAUT_DENY =
  /\b(fuer|fuers|ueber\w*|koenn\w*|koennt\w*|moegl\w*|moecht\w*|groess\w*|groesst\w*|fuehr\w*|waehr\w*|naechst\w*|schoen\w*|gruend\w*|gegruend\w*|laeuf\w*|uebertraeg\w*|uebertragung|praezis\w*|hoehe\w*|hoeher\w*|erhoeh\w*|geraet\w*|proprietaer\w*|taeglich\w*|zaehl\w*|vergroess\w*|draeng\w*|haelt|faellt|faehrt|staerk\w*|waehl\w*|spaeter|maerz|gaeste?|gewaehr\w*|erklaer\w*|verfueg\w*|unterstuetz\w*|beruecksicht\w*|zusaetzlich\w*|urspruenglich\w*|natuerlich\w*|persoenlich\w*|moeglichkeit\w*|aehnlich\w*|waehrend|ueblich\w*|kuerz\w*|zukuenftig\w*)\b/i;

/** Index-/Kategorie-Pfade ohne konkreten Artikel. */
const URL_GENERIC_TAIL =
  /\/(news|news-magazin|category|kategorie|tag|tags|topics|aktuelles|magazin|blog|stories|artikel)\/?$/i;

// ---------------------------------------------------------------------------
// Eingabe
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith("--")));
const files = argv.filter((a) => !a.startsWith("--"));
const QUIET = flags.has("--quiet");
const BASELINE = flags.has("--baseline");

if (files.length === 0) {
  process.stderr.write("usage: node scripts/validate-digest.mjs news/<date>.md [--quiet] [--baseline]\n");
  process.exit(2);
}

// Bei mehreren Dateien jede einzeln prüfen und aggregiert beenden (für Sweeps).
let anyFail = false;
const reports = files.map((f) => {
  const report = validateFile(f);
  if (!report.pass) anyFail = true;
  return report;
});

const out = reports.length === 1 ? reports[0] : reports;
process.stdout.write(JSON.stringify(out, null, QUIET ? 0 : 2) + "\n");
process.exit(BASELINE ? 0 : anyFail ? 1 : 0);

// ---------------------------------------------------------------------------
// Hauptvalidierung
// ---------------------------------------------------------------------------
function validateFile(filePath) {
  const violations = [];
  const add = (rule, severity, line, message, extra = {}) =>
    violations.push({ rule, severity, line, message, ...extra });

  const raw = readFileSync(filePath, "utf8");
  const lines = raw.split("\n");
  const today = dateFromFilename(filePath); // "YYYY-MM-DD" | null

  // ---- H1 -----------------------------------------------------------------
  const h1Lines = lines
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => /^# /.test(l));
  if (h1Lines.length === 0) {
    add("h1-exactly-one", "error", 1, "Keine H1-Headline (`# …`) gefunden.");
  } else if (h1Lines.length > 1) {
    add("h1-exactly-one", "error", h1Lines[1].i + 1,
      `Mehrere H1-Zeilen (${h1Lines.length}); genau eine erwartet.`);
  }
  const h1 = h1Lines.length ? h1Lines[0].l.replace(/^# /, "").trim() : "";
  const h1Line = h1Lines.length ? h1Lines[0].i + 1 : 1;

  if (h1) {
    // generische Datums-Headline
    if (/golf\s*&\s*putting\s*news/i.test(h1) || /\bnews\b.*\d{1,2}\.\s*\w+\s*20\d\d/i.test(h1)) {
      add("h1-not-generic-date", "error", h1Line,
        "H1 ist eine generische (Datums-)Headline statt einer konkreten News.",
        { snippet: h1 });
    }
    // Kommaliste mehrerer News
    const segments = h1.split(",");
    const clausesWithVerb = segments.filter((s) => NEWS_VERBS.test(s)).length;
    if (segments.length >= 2 && clausesWithVerb >= 2) {
      add("h1-no-comma-list", "error", h1Line,
        "H1 listet mehrere News (Komma-getrennte Klauseln mit je eigenem Verb); genau EINE dominante News erwartet.",
        { snippet: h1 });
    }
  }

  // ---- Sektionen / Zusammenfassung ---------------------------------------
  const h2 = lines
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => /^## /.test(l))
    .map(({ l, i }) => ({ heading: l.replace(/^## /, "").trim(), i }));

  const firstH2 = h2[0];
  if (!firstH2 || firstH2.heading !== "Zusammenfassung") {
    add("summary-present", "error", firstH2 ? firstH2.i + 1 : h1Line,
      "Erste `## …`-Sektion muss `## Zusammenfassung` sein.");
  } else {
    const next = h2[1];
    const body = lines
      .slice(firstH2.i + 1, next ? next.i : lines.length)
      .join("\n")
      .trim();
    const sw = countWords(body);
    if (sw < SUMMARY_MIN || sw > SUMMARY_MAX) {
      add("summary-wordcount", "warn", firstH2.i + 1,
        `Zusammenfassung hat ${sw} Wörter (Zielband ${SUMMARY_MIN}-${SUMMARY_MAX}).`);
    }
  }

  // ---- Footer / Trennlinien ----------------------------------------------
  lines.forEach((l, i) => {
    if (/^---\s*$/.test(l)) {
      add("no-footer", "error", i + 1,
        "`---`-Trennlinie gefunden — bricht den App-Parser (wird an den letzten Eintrag angehängt).",
        { autofixable: true, suggestedFix: "Zeile entfernen" });
    }
    if (/Quellen-Verifikation/i.test(l)) {
      add("no-footer", "error", i + 1,
        "Quellen-Verifikation-Footer gefunden — gehört nicht in den Digest.",
        { autofixable: true, suggestedFix: "Footer-Block entfernen" });
    }
  });

  // ---- Umlaut-Substitutionen (URLs/Code vorher strippen) ------------------
  lines.forEach((l, i) => {
    const cleaned = l.replace(/https?:\/\/\S+/g, "").replace(/`[^`]*`/g, "");
    const m = cleaned.match(UMLAUT_DENY);
    if (m) {
      add("umlaut-substitution", "error", i + 1,
        `Mögliche Umlaut-Ersetzung „${m[0]}" (ae/oe/ue/ss statt ä/ö/ü/ß).`,
        { snippet: m[0] });
    }
  });

  // ---- Einträge (Bullets) -------------------------------------------------
  const entryLines = lines
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => /^[-*] /.test(l));

  const urlsInFile = [];
  const titlesInFile = [];

  for (const { l, i } of entryLines) {
    const ln = i + 1;

    // Titel
    const titleMatch = l.match(/^[-*]\s+\*\*(.+?)\*\*/);
    if (!titleMatch) {
      add("entry-format", "error", ln,
        "Eintrag beginnt nicht mit `**Titel**` (Fett-Titel fehlt).", { snippet: clip(l) });
      continue;
    }
    titlesInFile.push({ title: titleMatch[1].trim(), line: ln });
    let rest = l.slice(titleMatch[0].length);

    // Datum
    const dateMatch = rest.match(/^\s*\((\d{1,2}\.\d{1,2}\.?(?:\d{2,4})?)\)/);
    if (!dateMatch) {
      add("entry-format", "error", ln,
        "Kein `(dd.mm.)`-Datum direkt nach dem Titel.", { snippet: clip(l) });
    } else {
      const d = dateMatch[1];
      if (/\d{1,2}\.\d{1,2}\.\d{2,4}/.test(d)) {
        const short = d.replace(/^(\d{1,2}\.\d{1,2}\.).*/, "$1");
        add("date-format-short", "error", ln,
          `Datum „(${d})" enthält das Jahr; die App-Datumsanzeige braucht das Kurzformat.`,
          { snippet: `(${d})`, autofixable: true, suggestedFix: `(${short})` });
      } else if (recentCheck(d, today) === false) {
        add("entry-dates-recent", "warn", ln,
          `Datum „(${d})" liegt mehr als ${RECENT_DAYS} Tage vor dem Digest-Datum.`, { snippet: `(${d})` });
      }
    }

    // Schwanz: | Quelle | URL
    const tail = l.match(/\|\s*([^|]+?)\s*\|\s*(https?:\/\/\S+?)\s*$/);
    if (!tail) {
      add("app-parseable-tail", "error", ln,
        "Eintrag hat keinen `| Quelle | URL`-Schwanz am Zeilenende (App verliert Quelle/Link).",
        { snippet: clip(l) });
    } else {
      const url = tail[2];
      urlsInFile.push({ url, line: ln });
      if (isGenericUrl(url)) {
        add("url-specific", "error", ln,
          `URL führt nicht zu einem konkreten Artikel: ${url}`, { snippet: url });
      }
    }
  }

  // Eintragszahl
  const entryCount = entryLines.length;
  if (entryCount > ENTRIES_HARD_MAX) {
    add("entry-count", "error", h1Line,
      `${entryCount} Einträge — zu viele (Bloat), max. ${ENTRIES_MAX} üblich.`);
  } else if (entryCount < ENTRIES_MIN || entryCount > ENTRIES_MAX) {
    add("entry-count", "warn", h1Line,
      `${entryCount} Einträge (übliches Band ${ENTRIES_MIN}-${ENTRIES_MAX}).`);
  }

  // Interne URL-Dubletten
  const seen = new Map();
  for (const { url, line } of urlsInFile) {
    if (seen.has(url)) {
      add("url-no-dup", "error", line, `URL doppelt im selben Digest: ${url}`, { snippet: url });
    } else {
      seen.set(url, line);
    }
  }

  // Dubletten vs. letzte 7 Digests
  const prior = lastNDigests(filePath, today, 7);
  if (prior.urls.size || prior.titles.size) {
    for (const { url, line } of urlsInFile) {
      if (prior.urls.has(url)) {
        add("title-url-no-dup-7d", "error", line,
          `URL kommt bereits in einem der letzten 7 Digests vor: ${url}`, { snippet: url });
      }
    }
    for (const { title, line } of titlesInFile) {
      if (prior.titles.has(normalizeTitle(title))) {
        add("title-url-no-dup-7d", "error", line,
          `Titel dupliziert einen der letzten 7 Digests: „${title}"`, { snippet: title });
      }
    }
  }

  // Gesamtwortzahl
  const wordCount = countWords(raw);
  if (wordCount < WORDS_HARD_MIN || wordCount > WORDS_HARD_MAX) {
    add("total-wordcount", "error", 1,
      `${wordCount} Wörter (harter Bereich ${WORDS_HARD_MIN}-${WORDS_HARD_MAX}).`);
  } else if (wordCount < WORDS_MIN || wordCount > WORDS_MAX) {
    add("total-wordcount", "warn", 1,
      `${wordCount} Wörter (Zielband ${WORDS_MIN}-${WORDS_MAX}).`);
  }

  // ---- Baseline-Modus: error → warn --------------------------------------
  if (BASELINE) {
    for (const v of violations) if (v.severity === "error") v.severity = "warn";
  }

  const errorCount = violations.filter((v) => v.severity === "error").length;
  const warnCount = violations.filter((v) => v.severity === "warn").length;

  return {
    file: relNews(filePath),
    today,
    pass: errorCount === 0,
    errorCount,
    warnCount,
    stats: {
      wordCount,
      entryCount,
      summaryWordCount: summaryWords(lines, h2),
      h1,
    },
    violations: violations.sort((a, b) => a.line - b.line),
  };
}

// ---------------------------------------------------------------------------
// Helfer
// ---------------------------------------------------------------------------
function countWords(s) {
  const t = s.trim();
  return t ? t.split(/\s+/).length : 0;
}

function summaryWords(lines, h2) {
  const first = h2[0];
  if (!first || first.heading !== "Zusammenfassung") return 0;
  const next = h2[1];
  const body = lines.slice(first.i + 1, next ? next.i : lines.length).join("\n").trim();
  return countWords(body);
}

function clip(s, n = 90) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function normalizeTitle(t) {
  return t.toLowerCase().replace(/\s+/g, " ").trim();
}

function dateFromFilename(filePath) {
  const m = basename(filePath).match(/(\d{4}-\d{2}-\d{2})\.md$/);
  return m ? m[1] : null;
}

function isGenericUrl(url) {
  let u;
  try {
    u = new URL(url.replace(/[).,;]+$/, ""));
  } catch {
    return true; // unparsebare URL ist nie ein gültiger Artikel-Link
  }
  const path = u.pathname.replace(/\/+$/, "");
  if (path === "" || path === "/") return true; // bare Domain
  if (URL_GENERIC_TAIL.test(u.pathname)) return true;
  return false;
}

/** false = älter als RECENT_DAYS; true/undefined = ok bzw. nicht bestimmbar. */
function recentCheck(ddmm, today) {
  if (!today) return undefined;
  const m = ddmm.match(/^(\d{1,2})\.(\d{1,2})\.?$/);
  if (!m) return undefined;
  const [, dd, mm] = m.map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let year = ty;
  // Datum nach "heute" im selben Jahr → vermutlich Vorjahr (Jahreswende).
  const asThisYear = new Date(Date.UTC(ty, mm - 1, dd));
  const todayUTC = new Date(Date.UTC(ty, tm - 1, td));
  if (asThisYear.getTime() > todayUTC.getTime()) year = ty - 1;
  const entryDate = new Date(Date.UTC(year, mm - 1, dd));
  const diffDays = (todayUTC.getTime() - entryDate.getTime()) / 86400000;
  if (diffDays < 0 || diffDays > RECENT_DAYS) return false;
  return true;
}

/** URLs + Titel der 7 Digests vor `today` (nach Dateinamen-Datum). */
function lastNDigests(filePath, today, n) {
  const urls = new Set();
  const titles = new Set();
  if (!today) return { urls, titles };
  const dir = dirname(filePath);
  let names;
  try {
    names = readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f));
  } catch {
    return { urls, titles };
  }
  const prior = names
    .map((f) => f.replace(/\.md$/, ""))
    .filter((d) => d < today)
    .sort()
    .reverse()
    .slice(0, n);
  for (const d of prior) {
    let content;
    try {
      content = readFileSync(join(dir, `${d}.md`), "utf8");
    } catch {
      continue;
    }
    for (const m of content.matchAll(/https?:\/\/\S+/g)) {
      urls.add(m[0].replace(/[).,;]+$/, ""));
    }
    for (const m of content.matchAll(/^[-*]\s+\*\*(.+?)\*\*/gm)) {
      titles.add(normalizeTitle(m[1]));
    }
  }
  return { urls, titles };
}

function relNews(filePath) {
  const m = filePath.match(/news\/\d{4}-\d{2}-\d{2}\.md$/);
  return m ? m[0] : filePath;
}
