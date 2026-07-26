// Runs once after the whole Playwright run finishes (all workers done),
// regardless of which spec file(s) were selected — merges whichever
// per-test result directories report-utils.mjs actually created. Needed so
// a standalone `npm run test:a11y` / `test:functional` still produces the
// combined JSON report, not just a run-audit.mjs-driven one.
import { mergeResults } from './report-utils.mjs';

export default function globalTeardown() {
  for (const category of ['a11y', 'links', 'contact-form', 'viewport']) {
    mergeResults(category);
  }
}
