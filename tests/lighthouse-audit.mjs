// Performance & Core Web Vitals audit — runs Lighthouse programmatically
// against every route on the local preview server.
//
// Thresholds asserted (hard pass/fail):
//   Performance score >= 90
//   LCP < 2.5s
//   CLS < 0.1
//   TBT < 200ms  — Lighthouse has no single "no long tasks" audit; Total
//                  Blocking Time is the standard scored proxy for exactly
//                  that ("main thread blocked by long tasks"), and 200ms is
//                  Lighthouse's own "good" TBT boundary. The diagnostic
//                  "long-tasks" audit (raw >50ms task list) is also
//                  collected and reported for transparency, but it isn't a
//                  scored audit with a defined pass threshold, so it's
//                  informational only and never fails the run on its own.
import lighthouse from 'lighthouse';
import { chromium } from '@playwright/test';
import { launch } from 'chrome-launcher';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getRoutes, PREVIEW_BASE_URL } from './routes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = path.join(__dirname, 'report');

const THRESHOLDS = {
  performanceScore: 90,
  lcpMs: 2500,
  clsScore: 0.1,
  tbtMs: 200,
};

async function runLighthouseForRoute(route, chromePort) {
  const url = `${PREVIEW_BASE_URL}${route}`;
  const result = await lighthouse(url, {
    port: chromePort,
    output: 'json',
    logLevel: 'silent',
    onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'],
    formFactor: 'mobile',
    screenEmulation: { mobile: true, width: 375, height: 812, deviceScaleFactor: 2, disabled: false },
    // Lighthouse defaults to 'simulate' (Lantern), which estimates network
    // timing from an unthrottled trace rather than actually replaying it
    // throttled. Lantern is known to produce wildly inflated numbers on
    // pages referencing several large lazy-loaded assets (confirmed here:
    // a page with real ~2.8s LCP was reported as 60,000-227,000ms under
    // 'simulate'). 'devtools' actually throttles the network/CPU and
    // replays for real — slower per page, but the numbers are trustworthy.
    throttlingMethod: 'devtools',
  });

  const lhr = result.lhr;
  const perfScore = Math.round((lhr.categories.performance.score ?? 0) * 100);
  const lcpMs = lhr.audits['largest-contentful-paint']?.numericValue ?? null;
  const clsScore = lhr.audits['cumulative-layout-shift']?.numericValue ?? null;
  const tbtMs = lhr.audits['total-blocking-time']?.numericValue ?? null;
  const longTasks = lhr.audits['long-tasks']?.details?.items ?? [];

  const checks = {
    performanceScore: { value: perfScore, threshold: THRESHOLDS.performanceScore, pass: perfScore >= THRESHOLDS.performanceScore },
    lcpMs:             { value: lcpMs, threshold: THRESHOLDS.lcpMs, pass: lcpMs !== null && lcpMs < THRESHOLDS.lcpMs },
    clsScore:          { value: clsScore, threshold: THRESHOLDS.clsScore, pass: clsScore !== null && clsScore < THRESHOLDS.clsScore },
    tbtMs:             { value: tbtMs, threshold: THRESHOLDS.tbtMs, pass: tbtMs !== null && tbtMs < THRESHOLDS.tbtMs },
  };

  return {
    route,
    pass: Object.values(checks).every((c) => c.pass),
    checks,
    longTaskCount: longTasks.length,
    otherCategoryScores: {
      accessibility:  Math.round((lhr.categories.accessibility?.score ?? 0) * 100),
      seo:            Math.round((lhr.categories.seo?.score ?? 0) * 100),
      bestPractices:  Math.round((lhr.categories['best-practices']?.score ?? 0) * 100),
    },
  };
}

// chrome-launcher registers its own internal listener on the Chrome child
// process's exit event that retries the same temp-dir rmSync — this fires
// asynchronously, outside of any try/catch around an explicit chrome.kill()
// call, and (confirmed by hitting this live) can still throw EPERM on
// Windows and crash the whole Node process well after runLighthouseAudit()
// has already returned its results. Narrowly scoped to that exact known
// pattern so a genuine unrelated crash elsewhere still surfaces normally.
function isChromeLauncherTempCleanupError(err) {
  return err?.code === 'EPERM' && err?.syscall === 'rm' && /lighthouse\.\d+/.test(String(err?.path || ''));
}

export async function runLighthouseAudit() {
  const routes = getRoutes();

  const uncaughtGuard = (err) => {
    if (isChromeLauncherTempCleanupError(err)) {
      console.log(`  (non-fatal: chrome-launcher temp cleanup failed asynchronously: ${err.path})`);
      return;
    }
    // Registering an uncaughtException listener at all suppresses Node's
    // default crash-and-exit behavior, so any *other* uncaught error needs
    // to explicitly fail loudly here instead of leaving the process
    // silently limping along in a broken state.
    console.error('Unexpected uncaught exception during Lighthouse run:', err);
    process.exit(1);
  };
  process.on('uncaughtException', uncaughtGuard);

  const chrome = await launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
  });

  const results = [];
  try {
    for (const route of routes) {
      process.stdout.write(`  lighthouse: ${route} ... `);
      try {
        const r = await runLighthouseForRoute(route, chrome.port);
        results.push(r);
        console.log(r.pass ? 'PASS' : 'FAIL');
      } catch (err) {
        results.push({ route, pass: false, error: String(err.message || err) });
        console.log('ERROR');
      }
    }
  } finally {
    // chrome-launcher's own temp-dir cleanup can throw EPERM on Windows
    // (file still momentarily locked by the just-killed process) — never
    // let that swallow the report we already collected.
    try {
      await chrome.kill();
    } catch (err) {
      console.log(`  (non-fatal: chrome cleanup failed: ${String(err.message || err)})`);
    }
  }

  mkdirSync(REPORT_DIR, { recursive: true });
  const report = { generatedAt: new Date().toISOString(), thresholds: THRESHOLDS, results };
  writeFileSync(path.join(REPORT_DIR, 'lighthouse-results.json'), JSON.stringify(report, null, 2));

  process.off('uncaughtException', uncaughtGuard);
  return report;
}

// Allow standalone invocation: `node tests/lighthouse-audit.mjs`
// (requires the preview server to already be running on PREVIEW_BASE_URL).
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const report = await runLighthouseAudit();
  const failed = report.results.filter((r) => !r.pass);
  console.log(`\nLighthouse: ${report.results.length - failed.length}/${report.results.length} routes passed.`);
  if (failed.length) {
    console.log('Failing routes:', failed.map((f) => f.route).join(', '));
    process.exitCode = 1;
  }
}
