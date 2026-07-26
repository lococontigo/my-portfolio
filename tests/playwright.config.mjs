import { defineConfig, devices } from '@playwright/test';
import { PREVIEW_BASE_URL } from './routes.mjs';

// No webServer block here on purpose — run-audit.mjs owns the full
// build -> preview -> test -> teardown lifecycle so the same preview
// server instance is shared across Playwright, Lighthouse, and the
// HTML/SEO audit instead of every tool starting its own copy. Run these
// spec files directly (e.g. `npx playwright test`) only after the preview
// server is already up on PREVIEW_BASE_URL (see run-audit.mjs or
// `npm run preview -- --port 4322`).
export default defineConfig({
  testDir: '.',
  globalTeardown: './global-teardown.mjs',
  // Safe to run in parallel: each test writes its own small result file
  // via report-utils.mjs (see that file) instead of accumulating into a
  // shared in-memory array, so separate worker processes never clobber
  // each other's data the way a single shared-array + afterAll would.
  // Worker count capped rather than left to Playwright's CPU-count
  // autodetection: on a constrained/virtualized host, `os.cpus().length`
  // can report far more logical processors than are actually schedulable,
  // and spinning up that many concurrent Chromium instances causes severe
  // contention (each axe-core scan going from ~2s to 30-45s) rather than
  // real speedup. 4 is a conservative default that stays fast on a normal
  // dev machine without oversubscribing a limited one.
  fullyParallel: true,
  workers: 4,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['json', { outputFile: 'tests/report/playwright-results.json' }]],
  use: {
    baseURL: PREVIEW_BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
