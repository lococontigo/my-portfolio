// Functional, link, and cross-viewport audit.
//   1. Link crawl — every internal href must resolve (2xx/3xx); external
//      hrefs are checked too but only ever reported as warnings, never a
//      hard failure (many sites, e.g. LinkedIn, block bare HEAD/GET requests
//      from non-browser clients with 999/403 even when the link is fine —
//      that's a source-site policy, not something this repo can fix).
//   2. Contact form — empty submit, invalid email, and a valid submission
//      are all tested against every contact page found in the sitemap.
//      The real Web3Forms endpoint is ALWAYS intercepted and mocked so the
//      suite never sends a real email on every test run.
//   3. Viewport overflow — every route at mobile/tablet/desktop must not
//      produce horizontal scroll.
import { test, expect } from '@playwright/test';
import { getRoutes, PREVIEW_BASE_URL } from './routes.mjs';
import { writeResult } from './report-utils.mjs';

const routes = getRoutes();
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

// ───────────────────────── Link crawl ─────────────────────────
test.describe('Link crawl', () => {
  for (const route of routes) {
    test(`links: ${route}`, async ({ page, request }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      const hrefs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href')),
      );

      const seen = new Set();
      const brokenInternal = [];
      const warnExternal = [];

      for (const href of hrefs) {
        if (!href || seen.has(href)) continue;
        seen.add(href);

        if (href.startsWith('mailto:') || href.startsWith('tel:')) continue;

        // In-page anchor — verify the target element actually exists
        // instead of doing a network check.
        if (href.startsWith('#')) {
          if (href.length > 1) {
            const exists = await page.locator(href).count();
            if (exists === 0) brokenInternal.push({ href, reason: 'anchor target not found on page' });
          }
          continue;
        }

        let absoluteUrl;
        let isInternal;
        try {
          if (href.startsWith('http://') || href.startsWith('https://')) {
            absoluteUrl = new URL(href);
            isInternal = absoluteUrl.hostname === 'andrewthyip.com';
            if (isInternal) absoluteUrl = new URL(absoluteUrl.pathname + absoluteUrl.search, PREVIEW_BASE_URL);
          } else {
            absoluteUrl = new URL(href, PREVIEW_BASE_URL);
            isInternal = true;
          }
        } catch {
          brokenInternal.push({ href, reason: 'unparseable URL' });
          continue;
        }

        try {
          const res = await request.fetch(absoluteUrl.toString(), { method: 'GET', maxRedirects: 5, timeout: 10000 });
          if (res.status() >= 400) {
            (isInternal ? brokenInternal : warnExternal).push({ href, status: res.status() });
          }
        } catch (err) {
          (isInternal ? brokenInternal : warnExternal).push({ href, reason: String(err.message || err) });
        }
      }

      writeResult('links', route, { route, brokenInternal, warnExternal, pass: brokenInternal.length === 0 });
      expect(brokenInternal, `Broken internal links on ${route}: ${JSON.stringify(brokenInternal)}`).toHaveLength(0);
    });
  }
});

// ───────────────────────── Contact form ─────────────────────────
const contactRoutes = routes.filter((r) => r.includes('/contact/'));

test.describe('Contact form', () => {
  for (const route of contactRoutes) {
    test(`contact form: ${route}`, async ({ page }) => {
      let submitAttempted = false;
      await page.route(WEB3FORMS_ENDPOINT, async (routeHandler) => {
        submitAttempted = true;
        await routeHandler.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'mocked' }),
        });
      });

      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const form = page.locator('#contact-form');
      await expect(form).toBeVisible();

      const submitBtn = form.locator('button[type="submit"]');
      const nameInput = form.locator('input[name="name"]');
      const emailInput = form.locator('input[name="email"]');
      const messageInput = form.locator('[name="message"]');

      // 1. Empty submit must not reach the network.
      await submitBtn.click();
      await page.waitForTimeout(400);
      const emptySubmitBlocked = !submitAttempted;

      // 2. Invalid email must not reach the network either.
      await nameInput.fill('Audit Test');
      await emailInput.fill('not-an-email');
      await messageInput.fill('Automated audit test message.');
      await submitBtn.click();
      await page.waitForTimeout(400);
      const invalidEmailBlocked = !submitAttempted;

      // 3. A fully valid submission should reach the (mocked) endpoint and
      // the UI should reflect success once the async cycle finishes.
      await emailInput.fill('audit-test@example.com');
      await submitBtn.click();
      await page.waitForTimeout(600);
      const validSubmitSucceeded = submitAttempted;
      const statusText = (await page.locator('#contact-status').textContent().catch(() => '')) || '';

      writeResult('contact-form', route, {
        route,
        emptySubmitBlocked,
        invalidEmailBlocked,
        validSubmitSucceeded,
        statusText: statusText.trim(),
        pass: emptySubmitBlocked && invalidEmailBlocked && validSubmitSucceeded,
      });

      expect(emptySubmitBlocked, 'Empty form must not submit to Web3Forms').toBe(true);
      expect(invalidEmailBlocked, 'Invalid email must not submit to Web3Forms').toBe(true);
      expect(validSubmitSucceeded, 'A fully valid submission should reach the endpoint').toBe(true);
    });
  }
});

// ───────────────────────── Viewport overflow ─────────────────────────
test.describe('Viewport overflow', () => {
  for (const route of routes) {
    for (const vp of VIEWPORTS) {
      test(`overflow: ${route} @ ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route, { waitUntil: 'load' });

        const { scrollWidth, innerWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));

        const overflows = scrollWidth > innerWidth;
        writeResult('viewport', `${route}_${vp.name}`, { route, viewport: vp.name, scrollWidth, innerWidth, overflows, pass: !overflows });
        expect(overflows, `${route} overflows horizontally at ${vp.name} (${vp.width}px): scrollWidth=${scrollWidth}`).toBe(false);
      });
    }
  }
});
