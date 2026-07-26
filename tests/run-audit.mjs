// Orchestrator for the full audit suite: build -> start preview -> run
// every category -> aggregate into one unified pass/fail report -> tear
// down. This is what `npm run test:audit` calls.
import { spawn, execSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { PREVIEW_BASE_URL, PREVIEW_PORT } from './routes.mjs';
import { runLighthouseAudit } from './lighthouse-audit.mjs';
import { runSeoHtmlAudit } from './seo-html-audit.mjs';
import { runSecurityHeaderCheck } from './security-headers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const REPORT_DIR = path.join(__dirname, 'report');

function readJsonIfExists(file) {
  const p = path.join(REPORT_DIR, file);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf-8'));
  } catch {
    return null;
  }
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return true;
    } catch {
      // server not up yet — keep polling
    }
    await sleep(400);
  }
  throw new Error(`Preview server never responded at ${url} within ${timeoutMs}ms`);
}

function runPlaywrightTests() {
  return new Promise((resolve) => {
    const child = spawn('npx', ['playwright', 'test', '--config=tests/playwright.config.mjs'], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: true,
    });
    child.on('close', (code) => resolve(code === 0));
    child.on('error', () => resolve(false));
  });
}

function summarizeRouteResults(results, label) {
  if (!results) return { label, ran: false };
  const total = results.length;
  const passed = results.filter((r) => r.pass).length;
  return { label, ran: true, total, passed, pass: passed === total };
}

async function main() {
  mkdirSync(REPORT_DIR, { recursive: true });

  console.log('\n=== 1/6 · Building production bundle ===');
  execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });

  console.log('\n=== 2/6 · Starting preview server ===');
  const preview = spawn('npx', ['astro', 'preview', '--host', '127.0.0.1', '--port', String(PREVIEW_PORT)], {
    cwd: ROOT,
    shell: true,
  });
  preview.stdout?.on('data', () => {});
  preview.stderr?.on('data', () => {});

  let playwrightPass = false;
  let lighthouseReport = null;
  let seoReport = null;

  try {
    await waitForServer(PREVIEW_BASE_URL);
    console.log(`Preview server ready at ${PREVIEW_BASE_URL}`);

    console.log('\n=== 3/6 · Accessibility + Functional (Playwright + axe-core) ===');
    // Playwright's own global-teardown.mjs merges every worker's per-test
    // result files into the combined JSON reports once this returns — see
    // report-utils.mjs.
    playwrightPass = await runPlaywrightTests();

    console.log('\n=== 4/6 · Performance & Core Web Vitals (Lighthouse) ===');
    lighthouseReport = await runLighthouseAudit();

    console.log('\n=== 5/6 · Technical SEO & HTML markup validation ===');
    seoReport = await runSeoHtmlAudit();
  } finally {
    // preview.kill() only signals the intermediate shell wrapper spawn()
    // created (shell: true is needed for npx on Windows) — it doesn't
    // reliably reach the actual `astro preview` child process underneath,
    // leaving an orphaned server on PREVIEW_PORT after every run. Kill the
    // whole process tree explicitly on Windows; plain kill() is fine on
    // POSIX where signals propagate to the process group.
    if (process.platform === 'win32' && preview.pid) {
      try {
        execSync(`taskkill /pid ${preview.pid} /T /F`, { stdio: 'ignore' });
      } catch {
        // already exited — fine
      }
    } else {
      preview.kill();
    }
  }

  console.log('\n=== 6/6 · Security headers (live deployment) ===');
  const securityReport = await runSecurityHeaderCheck();
  if (securityReport.fetchError) {
    console.log(`  Could not reach ${securityReport.target}: ${securityReport.fetchError}`);
    console.log('  (Skipping — this only applies once the site is actually deployed there.)');
  } else {
    console.log(`  ${securityReport.pass ? 'PASS' : 'FAIL'}  ${securityReport.target}`);
  }

  // ── Aggregate every category's already-written JSON report ──
  const a11y = summarizeRouteResults(readJsonIfExists('a11y-results.json')?.results, 'Accessibility (axe-core)');
  const links = summarizeRouteResults(readJsonIfExists('links-results.json')?.results, 'Functional — link crawl');
  const contactForm = summarizeRouteResults(readJsonIfExists('contact-form-results.json')?.results, 'Functional — contact form');
  const viewport = summarizeRouteResults(readJsonIfExists('viewport-results.json')?.results, 'Functional — viewport overflow');
  const lighthouse = summarizeRouteResults(lighthouseReport?.results, 'Performance & Core Web Vitals (Lighthouse)');
  const seo = summarizeRouteResults(seoReport?.results, 'Technical SEO & HTML markup');
  const security = { label: 'Security headers (live)', ran: !securityReport.fetchError, total: 1, passed: securityReport.pass ? 1 : 0, pass: securityReport.pass };

  const categories = [lighthouse, a11y, seo, links, contactForm, viewport, security];
  const overallPass = categories.every((c) => !c.ran || c.pass);

  const lines = [];
  lines.push('# Audit Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('| Category | Result | Detail |');
  lines.push('| --- | --- | --- |');
  for (const c of categories) {
    const result = !c.ran ? 'SKIPPED' : c.pass ? 'PASS' : 'FAIL';
    const detail = c.ran ? `${c.passed}/${c.total} passed` : 'no report generated';
    lines.push(`| ${c.label} | ${result} | ${detail} |`);
  }
  lines.push('');
  lines.push(`## Overall: ${overallPass ? 'PASS' : 'FAIL'}`);
  lines.push('');
  lines.push('Per-route detail lives in the individual JSON files in `tests/report/`.');

  const markdown = lines.join('\n');
  writeFileSync(path.join(REPORT_DIR, 'audit-report.md'), markdown);
  writeFileSync(
    path.join(REPORT_DIR, 'audit-report.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), overallPass, categories, playwrightExitedClean: playwrightPass }, null, 2),
  );

  console.log('\n' + markdown);
  console.log(`\nFull reports written to ${path.relative(ROOT, REPORT_DIR)}/`);

  process.exitCode = overallPass ? 0 : 1;
}

main().catch((err) => {
  console.error('Audit run failed:', err);
  process.exitCode = 1;
});
