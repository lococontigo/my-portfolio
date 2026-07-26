// Shared route list for every audit script. Reads public/sitemap.xml (the
// manually-maintained source of truth for what's actually shipped) instead
// of crawling dist/ or hardcoding paths here, so the audit suite never
// drifts from the real sitemap — if a route is added/removed there, every
// audit picks it up automatically on the next run.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITEMAP_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');

export function getRoutes() {
  const xml = readFileSync(SITEMAP_PATH, 'utf-8');
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((m) => {
    const url = new URL(m[1]);
    return url.pathname; // e.g. "/", "/ch/services/contact/"
  });
}

// 404.html isn't (and shouldn't be) in the sitemap, but a few audits
// (SEO/meta checks, security headers) still care about it existing and
// behaving correctly — kept as a separate, explicit export rather than
// silently injected into getRoutes() so nothing double-counts it.
export const NOT_FOUND_ROUTE = '/404.html';

export const PREVIEW_PORT = 4322;
export const PREVIEW_BASE_URL = `http://127.0.0.1:${PREVIEW_PORT}`;
