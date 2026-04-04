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

### Quellen-Verifikation (PFLICHT)
- Verifiziere JEDEN Artikel mit WebFetch bevor du ihn aufnimmst
- Wenn WebFetch fehlschlägt (403, Timeout): Artikel NICHT aufnehmen
- Schreibe NUR Fakten in die Zusammenfassung, die du tatsächlich im Artikel gelesen hast
- Artikel die du nicht lesen konntest, werden weggelassen

### Nur spezifische Artikel-URLs
- Jede URL muss zu einem konkreten Artikel führen, nicht zu einer Index- oder Kategorie-Seite
- FALSCH: `https://swissgolf.ch/de/news-magazin/news/`
- RICHTIG: `https://swissgolf.ch/de/news-magazin/news/details/1811-titel-des-artikels/`
- Wenn kein direkter Artikel-Link verfügbar ist, den Eintrag weglassen

### Sprache
- Deutsch mit echten Umlauten (ä, ö, ü, ß). NIEMALS ae, oe, ue, ss verwenden
- FALSCH: proprietaere, Hoehe, Geraet, gruendet, laeuft, uebertraegt
- RICHTIG: proprietäre, Höhe, Gerät, gründet, läuft, überträgt

### Review-Pass nach Erstellung
Prüfe vor dem Speichern/Committen den gesamten Digest auf:
1. Enthält jeder Eintrag NUR Fakten aus dem verlinkten Artikel?
2. Sind alle Umlaute korrekt (keine ae/oe/ue)?
3. Führt jede URL zu einem spezifischen Artikel (nicht Index/Kategorie)?
4. Ist jeder Artikel tatsächlich aus den letzten 7 Tagen?
5. Gibt es Duplikate mit früheren Digests?

### Duplikat-Check
- Vor jeder Recherche die letzten 7 Tages-Dateien in `news/` lesen
- Keine URLs oder Titel wiederholen die bereits in früheren Digests vorkommen

### Aktualität
- NUR Artikel aus den letzten 7 Tagen
- Veröffentlichungsdatum jedes Artikels prüfen und in Klammern angeben

## Dateistruktur
- `news/YYYY-MM-DD.md` - Tägliche News-Digests
- `deep-dives/YYYY-MM-DD-[slug].md` - Detailanalysen
- `src/` - Next.js 16 Website (feed.putting-lab.ch)
