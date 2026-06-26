/**
 * Tests für den Digest-Linter. Läuft die echte CLI (inkl. Exit-Code) gegen
 * Fixtures: `node --test scripts/`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const LINTER = join(here, "validate-digest.mjs");
const fx = (name) => join(here, "fixtures", name);

/** Lintet eine Datei, gibt { report, exitCode } zurück. */
function lint(file) {
  let stdout = "";
  let exitCode = 0;
  try {
    stdout = execFileSync("node", [LINTER, "--quiet", file], { encoding: "utf8" });
  } catch (err) {
    stdout = err.stdout ?? "";
    exitCode = err.status ?? 1;
  }
  return { report: JSON.parse(stdout), exitCode };
}

const rules = (report) => new Set(report.violations.map((v) => v.rule));

test("good fixture: keine Fehler, exit 0", () => {
  const { report, exitCode } = lint(fx("good-2026-06-24.md"));
  assert.equal(report.pass, true);
  assert.equal(report.errorCount, 0);
  assert.equal(exitCode, 0);
  assert.equal(report.stats.entryCount, 8);
});

test("Komma-Listen-Headline wird erkannt", () => {
  const { report, exitCode } = lint(fx("bad-comma-h1.md"));
  assert.ok(rules(report).has("h1-no-comma-list"), "h1-no-comma-list erwartet");
  assert.equal(report.pass, false);
  assert.equal(exitCode, 1);
});

test("Volljahr-Datum wird erkannt und ist autofixbar", () => {
  const { report } = lint(fx("bad-fullyear.md"));
  const v = report.violations.find((x) => x.rule === "date-format-short");
  assert.ok(v, "date-format-short erwartet");
  assert.equal(v.autofixable, true);
  assert.equal(v.suggestedFix, "(16.06.)");
});

test("Footer (--- + Quellen-Verifikation) und Umlaut-Substitution werden erkannt", () => {
  const { report } = lint(fx("bad-footer-umlaut.md"));
  const r = rules(report);
  assert.ok(r.has("no-footer"), "no-footer erwartet");
  assert.ok(r.has("umlaut-substitution"), "umlaut-substitution erwartet");
});

test("fehlender | Quelle | URL -Schwanz wird erkannt", () => {
  const { report } = lint(fx("bad-missing-tail.md"));
  assert.ok(rules(report).has("app-parseable-tail"), "app-parseable-tail erwartet");
});

test("--baseline stuft Fehler zu Warnungen herab (exit 0)", () => {
  let exitCode = 0;
  let stdout = "";
  try {
    stdout = execFileSync("node", [LINTER, "--quiet", "--baseline", fx("bad-comma-h1.md")], {
      encoding: "utf8",
    });
  } catch (err) {
    stdout = err.stdout ?? "";
    exitCode = err.status ?? 1;
  }
  const report = JSON.parse(stdout);
  assert.equal(report.errorCount, 0, "im Baseline-Modus keine error-Verstöße");
  assert.ok(report.warnCount > 0, "Verstöße als Warnungen erhalten");
  assert.equal(exitCode, 0);
});
