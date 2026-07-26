// Security & header check — for LIVE deployments only. Local dev/preview
// servers don't (and shouldn't need to) set these headers, so this script
// always hits a real URL over the network rather than the local preview
// server the rest of the suite uses.
//
// Usage:
//   node tests/security-headers.mjs                       (defaults to astro.config.mjs's `site`)
//   node tests/security-headers.mjs --url=https://example.com
//   node tests/security-headers.mjs https://example.com
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = path.join(__dirname, 'report');

const DEFAULT_URL = 'https://andrewthyip.com'; // matches astro.config.mjs `site`

function getTargetUrl() {
  const urlArg = process.argv.find((a) => a.startsWith('--url='));
  if (urlArg) return urlArg.slice('--url='.length);
  const positional = process.argv.slice(2).find((a) => !a.startsWith('--'));
  if (positional) return positional;
  return DEFAULT_URL;
}

const REQUIRED_HEADERS = {
  'strict-transport-security': (v) => !!v,
  'x-content-type-options': (v) => (v || '').toLowerCase().includes('nosniff'),
  'content-security-policy': (v) => !!v,
};

export async function runSecurityHeaderCheck(targetUrl = getTargetUrl()) {
  const target = new URL(targetUrl);
  const results = { target: target.toString(), checks: {}, httpsRedirect: null, pass: false, fetchError: null };

  try {
    const res = await fetch(target.toString(), { redirect: 'follow' });
    for (const [header, validate] of Object.entries(REQUIRED_HEADERS)) {
      const value = res.headers.get(header);
      results.checks[header] = { present: value !== null, value, pass: validate(value) };
    }
  } catch (err) {
    results.fetchError = String(err.message || err);
  }

  // HTTPS redirect enforcement — only meaningful to check when the target
  // was requested as https:; probe the http:// origin with a manual
  // redirect so we see the *first hop* rather than the fully-followed chain.
  if (target.protocol === 'https:') {
    const httpUrl = new URL(target.toString());
    httpUrl.protocol = 'http:';
    try {
      const res = await fetch(httpUrl.toString(), { redirect: 'manual' });
      const location = res.headers.get('location');
      const isRedirect = res.status >= 300 && res.status < 400;
      const redirectsToHttps = isRedirect && !!location && new URL(location, httpUrl).protocol === 'https:';
      results.httpsRedirect = { status: res.status, location, pass: redirectsToHttps };
    } catch (err) {
      results.httpsRedirect = { pass: false, error: String(err.message || err) };
    }
  } else {
    results.httpsRedirect = { pass: false, error: 'target URL is not https:, cannot verify HTTPS enforcement' };
  }

  const headerChecksPass = Object.values(results.checks).every((c) => c.pass);
  results.pass = !results.fetchError && headerChecksPass && !!results.httpsRedirect?.pass;

  mkdirSync(REPORT_DIR, { recursive: true });
  writeFileSync(
    path.join(REPORT_DIR, 'security-headers-results.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), ...results }, null, 2),
  );

  return results;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const results = await runSecurityHeaderCheck();
  console.log(`Security headers for ${results.target}:`);
  if (results.fetchError) {
    console.log(`  Could not reach target: ${results.fetchError}`);
    console.log('  (Is it actually deployed yet? Pass a different URL with --url=...)');
    process.exitCode = 1;
  } else {
    for (const [header, check] of Object.entries(results.checks)) {
      console.log(`  ${check.pass ? 'PASS' : 'FAIL'}  ${header}: ${check.value ?? '(missing)'}`);
    }
    console.log(`  ${results.httpsRedirect.pass ? 'PASS' : 'FAIL'}  HTTPS redirect: ${results.httpsRedirect.status ?? results.httpsRedirect.error}`);
    process.exitCode = results.pass ? 0 : 1;
  }
}
