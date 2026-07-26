// Parallel-safe result collection. Playwright workers are separate
// processes, so a shared in-memory array + a single afterAll write (the
// first approach here) silently loses data: whichever worker's afterAll
// fires last overwrites the report with only its own slice of the routes.
// Fix: each test writes its own small JSON file immediately, and a
// separate merge step (called after the whole Playwright run finishes)
// combines every file in that category's directory into the one combined
// report the rest of the audit tooling expects.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = path.join(__dirname, 'report');

function categoryDir(category) {
  return path.join(REPORT_DIR, `.${category}-partial`);
}

function slugify(name) {
  return name.replace(/[^a-z0-9]/gi, '_').slice(0, 150);
}

export function writeResult(category, name, data) {
  const dir = categoryDir(category);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, `${slugify(name)}.json`), JSON.stringify(data));
}

// Call once, after all workers running tests in this category have
// finished — merges every per-test file into tests/report/<category>-results.json
// and removes the scratch directory. A no-op (leaves any existing combined
// report untouched) if the category's scratch dir was never created —
// e.g. running `test:a11y` alone shouldn't blank out a previous
// `links-results.json` from a separate `test:functional` run.
export function mergeResults(category) {
  const dir = categoryDir(category);
  if (!existsSync(dir)) return null;

  const results = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(path.join(dir, f), 'utf-8')));

  mkdirSync(REPORT_DIR, { recursive: true });
  writeFileSync(
    path.join(REPORT_DIR, `${category}-results.json`),
    JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2),
  );

  rmSync(dir, { recursive: true, force: true });

  return results;
}
