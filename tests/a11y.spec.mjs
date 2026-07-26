// Automated accessibility audit — axe-core scan on every route in the
// sitemap. Fails the run only on "critical" or "serious" impact violations;
// "moderate"/"minor" findings are still recorded in the JSON report so
// nothing is silently dropped, they just don't block the suite.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { getRoutes } from './routes.mjs';
import { writeResult } from './report-utils.mjs';

const FAILING_IMPACT = new Set(['critical', 'serious']);
const routes = getRoutes();

for (const route of routes) {
  test(`a11y: ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'load' });

    const axe = await new AxeBuilder({ page })
      // WCAG 2.1 AA is this project's documented bar (CLAUDE.md) — scope
      // the ruleset accordingly rather than axe's much larger default set.
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const violations = axe.violations.map((v) => ({
      id:       v.id,
      impact:   v.impact,
      help:     v.help,
      helpUrl:  v.helpUrl,
      nodes:    v.nodes.length,
      targets:  v.nodes.slice(0, 5).map((n) => n.target.join(' ')),
    }));

    const failing = violations.filter((v) => FAILING_IMPACT.has(v.impact));

    // Written immediately, one small file per route — safe under parallel
    // workers (see report-utils.mjs for why a shared array + afterAll
    // isn't). run-audit.mjs merges these once the whole run finishes.
    writeResult('a11y', route, { route, violations, failingCount: failing.length, pass: failing.length === 0 });

    expect(
      failing,
      `Critical/serious a11y violations on ${route}:\n` +
        failing.map((v) => `  [${v.impact}] ${v.id} — ${v.help} (${v.nodes} node(s): ${v.targets.join(', ')})`).join('\n'),
    ).toHaveLength(0);
  });
}
