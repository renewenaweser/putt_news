# Putt News - Golf Research System

Täglicher Golf/Putting-News-Digest für das Putting Lab Projekt (Indoor-Putting-Anlage in der Schweiz).

## Qualitätsregeln (KRITISCH)

### Keine Halluzinationen
- Schreibe NUR Fakten, die du direkt im Quell-Artikel gelesen und verifiziert hast
- ERFINDE NIEMALS Statistiken, Zahlen, Scores, Strokes-Gained-Werte oder Ergebnisse
- Wenn ein Artikel keine spezifischen Zahlen nennt, dann nenne auch keine
- Wenn du dir bei einem Fakt unsicher bist: weglassen statt raten
- Lieber eine kürzere, korrekte Zusammenfassung als eine ausgeschmückte mit erfundenen Details

### Kein erzwungener Putting-Bezug
- Füge KEINE Putting-Statistiken hinzu, wenn der Artikel keine enthält
- Ein Turniersieg ist auch ohne Putting-Analyse eine valide News
- Wenn der Artikel nichts über Putting sagt, erwähne Putting NICHT in der Zusammenfassung
- Beschreibe nur was im Artikel tatsächlich steht, nicht was thematisch passen würde
- FALSCH: "Woodland gewinnt mit 8,3 Strokes Gained Putting" (wenn nicht im Artikel)
- RICHTIG: "Woodland gewinnt die Houston Open mit Turnierrekord von 259 Schlägen (-21)"

### Fakten-Verifikation (PFLICHT)
- Dies ist eine Recherche-Regel, KEIN Output-Abschnitt: erzeuge daraus NIEMALS einen Quellen-/Verifikations-Footer im Digest
- Nutze nur Fakten die in den WebSearch-Snippets stehen
- Cross-referenziere jeden Fakt aus mindestens 2 unabhängigen Suchtreffern
- ERFINDE KEINE Details die nicht in den Snippets stehen
- Bei Zahlen/Statistiken: nur aufnehmen wenn sie explizit in einem Snippet stehen

### Nur spezifische Artikel-URLs
- Jede URL muss zu einem konkreten Artikel führen, nicht zu einer Index- oder Kategorie-Seite
- FALSCH: `https://swissgolf.ch/de/news-magazin/news/`
- RICHTIG: `https://swissgolf.ch/de/news-magazin/news/details/1811-titel-des-artikels/`
- Wenn kein direkter Artikel-Link verfügbar ist, den Eintrag weglassen

### Sprache
- Deutsch mit echten Umlauten (ä, ö, ü, ß). NIEMALS ae, oe, ue, ss verwenden
- FALSCH: proprietaere, Hoehe, Geraet, gruendet, laeuft, uebertraegt
- RICHTIG: proprietäre, Höhe, Gerät, gründet, läuft, überträgt

### Headline (H1)
- Die erste Zeile jedes Digests (`# …`) ist die Schlagzeile und wird auf der Website als Titel angezeigt (`src/lib/content.ts` liest die erste `# `-Zeile)
- Die Headline nennt GENAU EINE News — die wichtigste/dominanteste des Tages. KEINE Aufzählung mehrerer News, KEINE durch Kommas getrennte Liste.
- NIEMALS eine generische Datums-Headline verwenden
- FALSCH (generisch): `# Golf & Putting News - 23. Juni 2026`
- FALSCH (mehrere News aneinandergereiht): `# Clark gewinnt die US Open wire-to-wire, Yamashita siegt im Meijer-Stechen, Scheffler verpasst den Grand Slam`
- RICHTIG (eine dominante News): `# Korda gewinnt die US Women's Open mit zwei zitternden Putts`
- Wähle die News mit der grössten Tragweite. Stehen mehrere gleichwertig nebeneinander, nimm die für das Putting Lab relevanteste.
- Es gelten dieselben Regeln wie im Body: echte Umlaute, nur verifizierte Fakten, keine erfundenen Zahlen

### Länge & Stil (konsistent halten)
- Orientiere dich am Umfang der Vorwochen-Digests: ca. 6-9 News-Einträge, insgesamt rund 1400-1650 Wörter. Das ist eine weiche Obergrenze, keine Untergrenze — überschreite sie nicht deutlich, im Zweifel kürzer.
- Pro Eintrag 2-4 Sätze mit den wichtigsten verifizierten Fakten. NICHT jede Zahl, Quote, Uhrzeit und jeden Spec in Klammern nachschieben — die zentralen Fakten genügen.
- Die Zusammenfassung bleibt bei ca. 100-140 Wörtern.
- Im Zweifel kürzer und präziser statt länger und ausgeschmückt.

### Review-Pass nach Erstellung
Prüfe vor dem Speichern/Committen den gesamten Digest auf:
1. Enthält jeder Eintrag NUR Fakten aus dem verlinkten Artikel?
2. Sind alle Umlaute korrekt (keine ae/oe/ue)?
3. Führt jede URL zu einem spezifischen Artikel (nicht Index/Kategorie)?
4. Ist jeder Artikel tatsächlich aus den letzten 7 Tagen?
5. Gibt es Duplikate mit früheren Digests?
6. Nennt die H1-Headline GENAU EINE dominante News (keine Kommaliste) und ist NICHT generisch mit Datum?
7. Liegt der Digest im üblichen Umfang (~6-9 Einträge, ~1400-1650 Wörter) und sind die Einträge nicht mit Klammer-Details überladen?

### Duplikat-Check
- Vor jeder Recherche die letzten 7 Tages-Dateien in `news/` lesen
- Keine URLs oder Titel wiederholen die bereits in früheren Digests vorkommen

### Aktualität
- NUR Artikel aus den letzten 7 Tagen
- Veröffentlichungsdatum jedes Artikels prüfen und in Klammern angeben

### Turnier-Jahresausgabe (KRITISCH)
- Der Golfkalender wiederholt sich jährlich — dieselben Turniere (KLM Open, Swiss Challenge, US Women's Open, Memorial usw.) finden jedes Jahr in derselben Woche statt
- Ein Suchtreffer kann aus dem VORJAHR stammen, obwohl das Turnier auch dieses Jahr läuft. Prüfe bei JEDEM Turnier-Artikel die Jahreszahl in URL UND Text (z.B. „…-2025/…" in der URL = Vorjahr, NICHT verwenden)
- Übernimm NIEMALS Runde-1-/Leaderboard-Ergebnisse aus einem Vorjahres-Artikel für ein gerade gestartetes Turnier. Wenn die diesjährigen Ergebnisse noch nicht vorliegen: Eintrag weglassen oder Event nur als „gestartet, Ergebnisse noch nicht verfügbar" erwähnen

### Output-Format
- Dateiname: `news/YYYY-MM-DD.md` (heutiges Datum)
- Erste Zeile: die H1-Headline nach obiger Regel (genau EINE dominante News)
- Danach `## Zusammenfassung` (100-140 Wörter)
- Danach die News nach Kategorien gruppiert, je als `## …`-Überschrift. Übliche Kategorien: «Putting & Technik», «Technologie & Innovation», «Golf Business & Markt», «Tour & Performance», «Golf Schweiz». Leere Kategorien weglassen.
- Pro Eintrag eine Zeile: `- **[Titel]** ([Veröffentlichungsdatum]) - [2-4 Sätze] | [Quelle(n)] | [spezifische Artikel-URL]`
- Der Digest endet mit dem letzten Kategorie-Eintrag. KEINEN Quellen-Verifikation-Footer und KEINE zusammenfassende Quellenliste am Ende anhängen — die Quellen stehen bereits pro Eintrag in der `| Quelle(n) | URL`-Angabe

## Dateistruktur
- `news/YYYY-MM-DD.md` - Tägliche News-Digests
- `deep-dives/YYYY-MM-DD-[slug].md` - Detailanalysen
- `src/` - Next.js 16 Website (feed.putting-lab.ch)
