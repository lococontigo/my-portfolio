// Technical SEO & HTML markup validation.
//   - html-validate lints the rendered markup of every route (fails on
//     severity "error"; "warn" is recorded but non-blocking).
//   - A Playwright page per route checks the live DOM for: exactly one
//     <h1>, no skipped heading levels, title/description/canonical/OG tags,
//     and at least one syntactically-valid JSON-LD block.
import { chromium } from '@playwright/test';
import { HtmlValidate } from 'html-validate';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getRoutes, PREVIEW_BASE_URL } from './routes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = path.join(__dirname, 'report');

// html-validate:recommended as-is is too noisy for this codebase: Astro
// serializes boolean attributes as `required=""` rather than bare
// `required`, which is 100% valid HTML5 but trips the preset's stylistic
// attribute-boolean-style/attribute-empty-style rules on every single page.
// Turned off rather than fixed, since there's nothing to fix — it's a
// style preference that doesn't match Astro's (correct) output.
const htmlvalidate = new HtmlValidate({
  extends: ['html-validate:recommended'],
  rules: {
    'attribute-boolean-style': 'off',
    'attribute-empty-style': 'off',
    // Honeypot spam-check field intentionally sets autocomplete="off" on a
    // checkbox to fight password-manager autofill — off-spec per the letter
    // of the HTML standard but a deliberate, harmless choice.
    'input-attributes': 'warn',
    'valid-autocomplete': 'warn',
    // CLAUDE.md permits inline style for genuinely dynamic one-off values
    // (case-study-deliverable-image.astro, case-study-compare-slider.astro,
    // case-study-gif.astro, tech-stack.astro all set a per-instance
    // aspect-ratio/icon-url this way) — more nuanced than html-validate's
    // blanket ban, so this is downgraded to a warning for human review
    // rather than disabled outright.
    'no-inline-style': 'warn',
    // Autoplaying <video> here is mitigated in JS, not by avoiding the
    // attribute: case-study-video.astro pauses on load under
    // prefers-reduced-motion (and always ships real play/pause/mute/seek
    // controls regardless), and hero-showcase-gallery.astro's decorative
    // clip does the same. A static linter can't see that runtime behavior.
    'no-autoplay': 'warn',
  },
});

function checkHeadingOrder(levels) {
  let maxSeen = 0;
  const skips = [];
  for (const level of levels) {
    if (level > maxSeen + 1) skips.push({ level, expectedMaxAllowed: maxSeen + 1 });
    maxSeen = Math.max(maxSeen, level);
  }
  return skips;
}

async function auditRoute(page, route) {
  const url = `${PREVIEW_BASE_URL}${route}`;

  // Lint the raw server-rendered HTML (not page.content()) — some pages
  // set inline styles via JS at runtime (e.g. the mobile nav toggling
  // document.body.style.overflow), which would otherwise show up as a
  // false-positive no-inline-style violation that has nothing to do with
  // the actual markup shipped from the server.
  const rawHtml = await (await fetch(url)).text();
  const lintReport = await htmlvalidate.validateString(rawHtml);

  // 'load' rather than 'networkidle' — a couple of case-study pages carry
  // an autoplaying video/heavy imagery that never lets the network go
  // fully idle, which isn't a bug (confirmed earlier this session) but
  // does make networkidle an unreliable wait condition here.
  await page.goto(url, { waitUntil: 'load' });
  const messages = lintReport.results[0]?.messages ?? [];
  const errors = messages.filter((m) => m.severity === 2);
  const warnings = messages.filter((m) => m.severity === 1);

  // ── Heading structure ──
  const headingLevels = await page.evaluate(() =>
    Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((h) => Number(h.tagName[1])),
  );
  const h1Count = headingLevels.filter((l) => l === 1).length;
  const skippedLevels = checkHeadingOrder(headingLevels);

  // ── Meta / canonical / OG ──
  const meta = await page.evaluate(() => ({
    title: document.title || null,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || null,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || null,
    ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || null,
    ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || null,
    ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || null,
  }));

  // ── JSON-LD ──
  const jsonLdBlocks = await page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => s.textContent || ''),
  );
  const jsonLdResults = jsonLdBlocks.map((raw) => {
    try {
      const parsed = JSON.parse(raw);
      return { valid: true, type: parsed['@type'] ?? null };
    } catch (err) {
      return { valid: false, error: String(err.message || err) };
    }
  });

  const problems = [];
  if (errors.length) problems.push(`${errors.length} html-validate error(s)`);
  if (h1Count !== 1) problems.push(`expected exactly one <h1>, found ${h1Count}`);
  if (skippedLevels.length) problems.push(`skipped heading level(s): ${JSON.stringify(skippedLevels)}`);
  if (!meta.title || !meta.title.includes('Andrew YIP')) problems.push('missing/malformed <title>');
  if (!meta.description) problems.push('missing meta description');
  if (!meta.canonical) problems.push('missing canonical link');
  if (!meta.ogTitle || !meta.ogDescription || !meta.ogImage) problems.push('missing one or more og: tags');
  if (jsonLdBlocks.length === 0) problems.push('no JSON-LD block found');
  if (jsonLdResults.some((r) => !r.valid)) problems.push('invalid JSON-LD (fails to parse)');

  return {
    route,
    pass: problems.length === 0,
    problems,
    htmlValidate: { errorCount: errors.length, warningCount: warnings.length, errors: errors.map((e) => ({ rule: e.ruleId, message: e.message, selector: e.selector })) },
    headings: { h1Count, allLevels: headingLevels, skippedLevels },
    meta,
    jsonLd: jsonLdResults,
  };
}

export async function runSeoHtmlAudit() {
  const routes = getRoutes();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const results = [];
  try {
    for (const route of routes) {
      process.stdout.write(`  seo/html: ${route} ... `);
      try {
        const r = await auditRoute(page, route);
        results.push(r);
        console.log(r.pass ? 'PASS' : `FAIL (${r.problems.join('; ')})`);
      } catch (err) {
        results.push({ route, pass: false, error: String(err.message || err) });
        console.log('ERROR');
      }
    }
  } finally {
    await browser.close();
  }

  mkdirSync(REPORT_DIR, { recursive: true });
  const report = { generatedAt: new Date().toISOString(), results };
  writeFileSync(path.join(REPORT_DIR, 'seo-html-results.json'), JSON.stringify(report, null, 2));

  return report;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const report = await runSeoHtmlAudit();
  const failed = report.results.filter((r) => !r.pass);
  console.log(`\nSEO/HTML: ${report.results.length - failed.length}/${report.results.length} routes passed.`);
  if (failed.length) {
    console.log('Failing routes:', failed.map((f) => f.route).join(', '));
    process.exitCode = 1;
  }
}
