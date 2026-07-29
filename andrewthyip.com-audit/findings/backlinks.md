# Backlink Profile — andrewthyip.com

**Audit date:** 2026-07-26
**Tier:** 0 (Common Crawl + verification crawler only — no Moz / Bing / DataForSEO credentials configured in this environment)

## Data sources used
| Source | Method | Confidence | Freshness |
|---|---|---|---|
| Common Crawl Web Graph | `commoncrawl_graph.py andrewthyip.com` (public data, no key) | 0.50 | Quarterly (release: cc-main-2026-jan-feb-mar) |
| Verification crawler | `verify_backlinks.py` against 3 candidate source URLs | 0.50–0.95 per-URL (see below) | Real-time (fetched during this audit) |
| Site source review | Direct grep of `src/pages` and `src/components/footer.astro` in this repo | 0.95 (ground truth — this is the shipped source, not an inference) | Current |

Not available in this environment: Moz API (DA/PA/spam score), Bing Webmaster Tools (inbound link index), DataForSEO. No numeric Backlink Health Score is produced — see "Why no score" below.

---

## Finding 1: Domain not present in Common Crawl's web graph
**Severity:** Info (not a defect)

**Evidence:** `commoncrawl_graph.py andrewthyip.com --json` returned `"in_crawl": false, "in_rankings": false, "pagerank": null, "harmonic_centrality": null, "top_referring_domains": []"`, with the note: "Domain not found in Common Crawl data. It may be too new, too small, or not yet crawled." (Common Crawl, domain-level, confidence: 0.50)

**Interpretation:** This must **not** be read as "the site has low authority" or "zero backlinks." Common Crawl's graph only reflects domains that appeared in its (large but incomplete) crawl sample and cleared a minimum in-degree threshold to be scored. A small personal portfolio with a naturally thin backlink profile is exactly the kind of domain CC's public graph release will miss — this is a coverage gap, not a negative signal.

**Recommendation:** No action required for the site itself. If a paid tier (Moz/DataForSEO) is later configured, re-run to get an actual referring-domain count rather than relying on CC's incomplete coverage.

---

## Finding 2: One confirmed likely backlink source (LinkedIn), unverifiable via automated crawl
**Severity:** Info

**Evidence:** The site's own `about.astro` schema and footer link out to `https://www.linkedin.com/in/andrewthyip/` (Site source review, confidence: 0.95 — this confirms Andrew's LinkedIn profile URL, not that it links back). Running `verify_backlinks.py` against that URL as a candidate backlink source returned `"status": "error", "http_status": 405"` — LinkedIn blocks the crawler's request method/lacks a session, so the check is inconclusive rather than negative. (Verify crawler, confidence: 0.50 — could not confirm either way)

**Interpretation:** It is common practice, and plausible, for a professional to list their portfolio URL on their own LinkedIn profile "Contact info" / "Featured" section, which would constitute a real backlink — but this cannot be confirmed by a no-login HTTP crawler, since LinkedIn requires authentication to render most profile content and returns non-200 responses to bots. This is reported as a **known, unverified candidate**, not a confirmed backlink.

**Recommendation:** Manually check the LinkedIn profile's "Contact info" and "Featured" sections to confirm the andrewthyip.com URL is listed there — a one-time manual check outside any API. If DataForSEO or Moz is later configured, they may have crawled the public snapshot of this profile with more success.

---

## Finding 3: No live backlinks found from case-study client companies' own homepages
**Severity:** Info

**Evidence:** The site's case studies feature four past projects: Yocale, Delta Controls, Ant Equipment Group ("Ant Rentals"), and Crowd Ease (`src/pages/work/yocale.astro`, `delta.astro`, `ant.astro`, `crowd-ease.astro`). A grep of these case-study pages found **zero outbound `href="https://..."` links** to any of these companies' own domains in the shipped source — Andrew's site doesn't even link out to them, so there is no reciprocal-link risk. Separately, `verify_backlinks.py` fetched the homepages of the two companies with clearly identifiable live domains — `https://www.yocale.com/` and `https://www.deltacontrols.com/` — and checked their outbound links for a reference back to andrewthyip.com. Both returned HTTP 200 with `"status": "link_removed"` (i.e., no such link found on the page fetched). (Verify crawler, confidence: 0.50 — homepage only, not the full site)

**Interpretation:** This is expected and normal, not a red flag. Corporate homepages of former clients/employers essentially never link out to an individual contractor's personal portfolio; that isn't where such attribution would naturally live (a "meet the team" or blog-post byline page would be a more likely location, and neither was checked here). Ant Equipment Group and Crowd Ease were not checked — Crowd Ease is described as a capstone/school project with no evident live commercial domain, and no confirmed production URL for Ant Equipment Group was found in the source to test.

**Recommendation:** No action needed; this doesn't indicate a problem with the portfolio. If Andrew wants to actively build this class of backlink, the highest-leverage move is asking past clients/collaborators (e.g., Delta Controls marketing contact, per the testimonial from Allan Lanzador) for a credit link on a case-study/blog post rather than expecting one on the homepage.

---

## Finding 4: No public GitHub or portfolio-directory listing referenced in the site itself
**Severity:** Low (opportunity, not a defect)

**Evidence:** A repo-wide grep for `github.com` across `src/` returned no matches. The only outbound social/profile link found anywhere in the shipped source is the LinkedIn profile URL noted in Finding 2. (Site source review, confidence: 0.95)

**Interpretation:** This isn't a backlink problem for andrewthyip.com per se — it just means there's no GitHub profile or listing (e.g., Awwwards, Behance, Dribbble, portfolio directories) currently wired into the site that could plausibly carry a reciprocal or one-way link back. For a designer/developer portfolio, directory listings (Behance, Dribbble for design work; GitHub for code) are typically the easiest, most legitimate class of backlink to acquire.

**Recommendation:** Low priority. If Andrew maintains a GitHub account or design-directory profiles (Behance/Dribbble), consider adding those links to the footer/about page — this both gives visitors another way to verify his work (trust-by-transparency, per project design principles) and creates a legitimate low-effort backlink from a high-DA platform domain.

---

## Why no numeric Backlink Health Score is reported

Per the confidence-weighted scoring model, a Backlink Health Score draws on 7 factors (referring domain count, domain quality distribution, anchor text naturalness, toxic link ratio, link velocity, follow/nofollow ratio, geographic relevance). At Tier 0, with no Moz/Bing/DataForSEO access:

- **Referring domain count:** no source returned a count (CC has no data for this domain)
- **Domain quality distribution:** no data source available
- **Anchor text naturalness:** no data source available
- **Toxic link ratio:** no data source available
- **Link velocity trend:** no data source available (DataForSEO-only factor)
- **Follow/nofollow ratio:** no data source available
- **Geographic relevance:** no data source available

**0 of 7 scoring factors have any data.** Per the mandatory rule ("fewer than 4 scoring factors with data → report INSUFFICIENT DATA, not a numeric score"), no score is produced. This is expected for a small personal site checked with free-only sources, not itself a critical finding.

## Summary

- **Confirmed:** No verifiable inbound backlinks were found by any available no-credential source. This is normal for a small personal portfolio and is not a critical or high-severity issue.
- **Plausible but unverified:** LinkedIn profile likely lists the site URL (industry-standard practice) but cannot be confirmed by automated crawl (LinkedIn blocks bots).
- **Checked and ruled out (homepage-level only):** Yocale and Delta Controls homepages do not link to andrewthyip.com. This is expected, not a gap to fix.
- **Not checked:** Ant Equipment Group and Crowd Ease (no confirmed live commercial domain identified for either from the site's own source).
- **Opportunity:** No GitHub/Behance/Dribbble links currently referenced on the site — adding them would be the most legitimate, lowest-effort way to build a first real backlink.
- **Recommendation for higher-confidence data:** Configure a free Moz API key (2,500 rows/month) to get real DA/PA and a referring-domain count; see `python3 scripts/backlinks_auth.py --check --json` output for setup instructions. For competitor gap analysis, Bing Webmaster Tools (also free) is uniquely useful once verified.
- This backlink check does not cover on-page E-E-A-T (see `/seo content <url>`) or crawlability/technical SEO (see `/seo technical <url>`, already present at `andrewthyip.com-audit/findings/technical.md`).
