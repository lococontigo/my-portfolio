# GEO / AI-Search Readiness Audit — andrewthyip.com

Audited: 2026-07-27 (live production, fetched directly via curl/WebFetch — no rendering script available in this environment; all HTML confirmed pre-JS/raw since the site is fully static Astro output, so raw fetch = what an AI crawler sees)

## GEO Health Score: 69/100

| Dimension | Weight | Score | Weighted |
|---|---|---|---|
| Citability | 25% | 55/100 | 13.75 |
| Structural Readability | 20% | 75/100 | 15.0 |
| Multi-Modal Content | 15% | 65/100 | 9.75 |
| Authority & Brand Signals | 20% | 60/100 | 12.0 |
| Technical Accessibility | 20% | 90/100 | 18.0 |
| **Total** | | | **68.5 → 69** |

## AI Crawler Access Status

| Crawler | robots.txt rule | Live fetch test |
|---|---|---|
| GPTBot | Allowed (wildcard) | 200 OK |
| OAI-SearchBot | Allowed (wildcard) | Not individually tested; covered by wildcard |
| ClaudeBot | Allowed (wildcard) | 200 OK |
| PerplexityBot | Allowed (wildcard) | 200 OK |
| Google-Extended | Allowed (wildcard) | 200 OK |
| CCBot / anthropic-ai (training-only) | Allowed (wildcard, not blocked) | Not tested |

`robots.txt` is simply:
```
User-agent: *
Allow: /
Sitemap: https://andrewthyip.com/sitemap.xml
```
No bot-specific rules exist at all — every crawler, search-oriented or training-only, gets the same blanket allow. Site is hosted on Vercel and served fully static (confirmed via `curl -I`: `Server: Vercel`, `X-Vercel-Cache: HIT`, no CSR shell) — raw HTML already contains full content, so there's no JS-rendering gap for any of these bots.

## llms.txt Status: Present, current, and useful

`https://andrewthyip.com/llms.txt` returns 200 and matches `public/llms.txt` in the repo exactly (verified live vs. local, byte-for-byte identical). Content is accurate against current site structure — it correctly reflects the recent homepage restructure (split-screen chooser routing to `/portfolio/` vs `/services/`), lists all 4 case studies with their headline metrics, testimonials, and bilingual `/ch/` paths. This is a genuinely well-maintained file, not boilerplate.

Gap: the file's "Content Licensing" section is prose only (`"Case study content may be cited with attribution..."`) with no backing machine-readable license. No RSL 1.0 file found (`/rsl.xml` → 404, `/license.xml` → 404, no `<link rel="license">` in `<head>`). See Finding 6.

---

## Critical

*(none — no crawler blocks, no noindex, no CSR gate found)*

---

## High

### 1. Key metrics are isolated as bare numbers with no citable sentence around them

**Evidence:** All 4 case studies (`/work/yocale/`, `/work/delta/`, `/work/ant/`, `/work/crowd-ease/`) present their headline stats via a dedicated stat-card component (3 instances per page: `case-highlight-stat-value` + `case-highlight-stat-caption`), not prose. Raw markup for Yocale's top stat:
```html
<div class="case-highlight-stat">
  <p class="case-highlight-stat-value">5.15%</p>
  <p class="case-highlight-stat-caption">Click-through rate</p>
</div>
```
There is no sentence anywhere on the page reading something like "Yocale's landing page redesign lifted click-through rate by 5.15%." The number and its label exist as two disconnected `<p>` tags with no subject, verb, cause, or timeframe. This pattern repeats identically for all 3 stat blocks on all 4 case-study pages (confirmed via `case-highlight-stat-value` count = 3 on each).

**Why it matters:** This is the single biggest citability gap on the site. When an LLM extracts a passage to answer "How much did Yocale's CTR improve?" or "What results did Andrew Yip's redesign for Yocale achieve?", the only extractable unit around the number is "5.15% / Click-through rate" — a fragment with no attribution, no causal claim, and no context to quote confidently. A full sentence is what gets cited in AI Overviews and ChatGPT search; an isolated number in a stat-card rarely does, because it can't stand alone as an answer.

**Recommendation:** Add one self-contained sentence per stat, either visually (as a caption line under/near the stat card) or as `sr-only`/off-screen text bound to the same stat, e.g.: *"Andrew's landing page and GTM design work for Yocale increased click-through rate by 5.15% and reduced bounce rate by 40%."* Keep the visual stat-card UI as-is (it's good for human scanning) — just add the prose sentence alongside it so the same claim exists in both a scannable and a citable form. Low effort, ~15 min per case study.

---

## Medium

### 2. Case-study prose is fragmented into passages well below the optimal 134–167-word citation length

**Evidence:** Extracted and measured every `<p>` on `/work/yocale/` (24 total paragraphs). The longest is 48 words ("Redesign to solve SEO issues…"); most run 12–37 words. None reach the 134–167-word range associated with highest AI-citation rates. Example — the entire "Overview" section is one 25-word sentence: *"Yocale is a cloud-based platform that helps service-based businesses — like salons and med spas — manage appointments, payments, and client relationships in one place."*

**Why it matters:** Short, scannable paragraphs are good human UX (consistent with the project's portfolio-case-study design language) but work against LLM passage retrieval, which favors self-contained ~150-word blocks that fully answer a likely query without needing surrounding context. Right now, every section on a case study needs 2–4 adjacent paragraphs stitched together to form one complete, citable answer — and AI extraction pipelines often grab only the single paragraph nearest a matched keyword.

**Recommendation:** For each major H2 (Overview, Challenge, Approach), add one consolidated ~150-word "answer paragraph" immediately under the heading that fully explains the what/why/result in one self-contained block, before the existing short scannable paragraphs continue the detail. This is additive — doesn't require removing the current fragmented style, just prepending a citable summary block per section. Prioritize Yocale and Delta Controls first (highest-value case studies per llms.txt).

### 3. Section headings are declarative, not question-based

**Evidence:** Full H2/H3 outline on `/work/yocale/`: Impact, Overview, Challenge → Missing Brand Identity, Approach → Build a system / Design for success, Visual Identity, Feature Launches, Landing Pages → Conversion Funnel / Localization, Web Development. Same pattern confirmed on the other 3 case studies and on `/about/`. None are phrased as questions.

**Why it matters:** Question-phrased headings ("What was the challenge with Yocale's brand identity?", "How did Andrew redesign Yocale's GTM system?") map far more directly to the natural-language queries users type into ChatGPT/Perplexity/Google AI Overviews, and LLMs preferentially surface content whose heading already mirrors the query intent.

**Recommendation:** Where it doesn't fight the existing design voice, reframe 2-3 headings per case study as questions (e.g., "Overview" → keep as-is for hero scanning, but "Challenge" → "What was Yocale's design problem?"). Can be done incrementally; don't need to convert every heading — even 1-2 question-based H2s per page meaningfully increases match surface.

### 4. No `datePublished`/`dateModified` in case-study structured data

**Evidence:** All 4 case studies use `@type: CreativeWork` JSON-LD with `name`, `description`, `url`, and `author`, but no date fields at all — confirmed absent via direct string search (`datePublished|dateModified` → no matches) on delta, ant, and crowd-ease pages.

**Why it matters:** Perplexity and Google AI Overviews weight recency/freshness signals when deciding which source to cite for a claim, especially for metric-driven claims like conversion-rate lifts that readers reasonably want to know are current. Without a date, the page gives AI engines no way to judge whether the "5.15% CTR lift" is from 2023 or 2026.

**Recommendation:** Add `"datePublished"` (project completion date) and, if pages get updated, `"dateModified"` to each case study's `CreativeWork` JSON-LD block in the relevant `work/*.astro` files. Low effort — dates likely already exist informally (Crowd Ease's card copy already states "Langara College 2023").

### 5. Homepage carries almost no extractable text

**Evidence:** Raw-fetched `/` and stripped scripts/styles: total visible text is ~79 words, consisting only of two CTA labels ("I'm hiring → /portfolio", "I need a website → /services") and a language toggle. All entity information on this URL lives exclusively in JSON-LD (`Person` schema with `name`, `jobTitle`, `sameAs`, `knowsAbout`) rather than in visible/citable prose.

**Why it matters:** The homepage is the canonical root URL and the one most likely to be crawled/indexed first and cited as `andrewthyip.com` generically (e.g., if someone asks "who is Andrew Yip"). Right now it functions purely as a router/gate with no self-contained answer content — everything useful for entity establishment sits one click deeper on `/about/` (708 words, solid) or is only reachable via `llms.txt`. This is a deliberate UX decision (the recent "split-screen homepage" commit) but it does mean the single most-likely-to-be-cited URL is currently the thinnest page on the site from an AI-citation standpoint.

**Recommendation:** No redesign needed — add a short (~1-2 sentence, ~40-60 word) `sr-only` or off-screen summary paragraph on the homepage restating the same Person-entity facts already in the JSON-LD (name, role, location, specialisms), so a text-extraction pipeline that doesn't parse JSON-LD still gets a citable one-paragraph "who is Andrew Yip" answer directly from the homepage's visible/extracted text, matching what `/about/` already does at greater length.

### 6. No RSL 1.0 (or equivalent machine-readable) licensing alongside the llms.txt content-licensing note

**Evidence:** `llms.txt` states "Case study content may be cited with attribution to Andrew Yip (andrewthyip.com)" but there is no `/rsl.xml`, no `<link rel="license">` in `<head>` on any tested page, and no RSL namespace anywhere in the HTML.

**Why it matters:** RSL 1.0 is the emerging machine-readable standard AI crawlers/aggregators check to determine usage/training permissions and attribution requirements programmatically, distinct from the human-readable llms.txt prose. Its absence doesn't block citation, but it's a gap versus current GEO best practice for sites that explicitly want to encourage (licensed) AI reuse.

**Recommendation:** Low priority given the site's small scale, but if maximizing AI-search visibility is a stated goal, publish a minimal RSL 1.0 file at `/rsl.xml` mirroring the llms.txt attribution terms, and reference it via `<link rel="license" href="https://andrewthyip.com/rsl.xml">` in the base layout `<head>`.

---

## Low

### 7. Hero `<h1>` duplicates its text via an `aria-hidden` visual span + `sr-only` span

**Evidence:** `/work/yocale/` (and presumably all case studies, same component) renders:
```html
<h1 class="case-hero-title">
  <span aria-hidden="true"><em class="case-hero-title-accent">Yocale</em>: Building a Design Growth System...</span>
  <span class="sr-only">Yocale: Building a Design Growth System...</span>
</h1>
```
This pattern is isolated to the H1 only (confirmed: only 1 `sr-only` occurrence on the page) — not used elsewhere in body copy, so it doesn't affect paragraph-level extraction.

**Why it matters:** This is a standard accessibility/animation pattern (the aria-hidden span is presumably split for a GSAP character-reveal animation) and is correctly built for screen readers. The risk is narrow: a text-extraction pipeline that does a naive HTML-to-text conversion without respecting `aria-hidden` (not all do) would see the H1 text twice in a row. Low impact since it's a single heading, not body content, but worth a mental note if the same char-split-for-animation technique is ever extended into paragraph text.

**Recommendation:** No change required given current limited scope. If this animation pattern is ever applied to body paragraphs in future work, keep the same aria-hidden/sr-only split so screen readers and any aria-aware extractor still get clean single-instance text.

### 8. Case-study video has no captions/transcript track

**Evidence:** `/work/yocale/` includes one `<video>` element; no `<track>` element found anywhere in the page (caption/transcript track entirely absent).

**Why it matters:** Multi-modal content (video walkthroughs) contributes nothing to text-based AI citation without a transcript — the video is effectively invisible to any AI crawler that can't process video directly. Image alt text on the same page is notably strong by contrast (48 `<img>` tags, the large majority with specific, descriptive alt text like *"Animated walkthrough of the Yocale homepage showcasing the booking management platform"* — a real strength, see Multi-Modal scoring note below).

**Recommendation:** Add a short caption track or an adjacent visible/`sr-only` text summary of what the video demonstrates (1-2 sentences is enough) so the walkthrough content becomes text-extractable, matching the quality already set by the image alt text on the same page.

---

## Brand Mention / Entity Analysis

- **On-site entity signals are solid:** `Person` JSON-LD on homepage and `/about/` (name, jobTitle, `sameAs` → LinkedIn, `alumniOf` → Langara College, `knowsAbout`), plus a 6-entry `ItemList`/`Review` schema on `/about/` with named reviewers and their real employers (Delta Controls Inc., IBM) — this is genuine "trust by transparency" per the project's own design principles, not placeholder testimonials.
- **Off-site brand-mention signals could not be verified programmatically** in this environment — search engines (Bing tested) return bot-challenge pages to automated fetches rather than results, and no generic web-search tool was available. Based only on what's discoverable from the site and `llms.txt` itself: the only external entity link is a single LinkedIn profile (`sameAs`). No YouTube, Reddit, or Wikipedia presence is referenced anywhere on the site or in `llms.txt`.
- Per the known correlation data (YouTube ~0.737, Reddit high, Wikipedia high, Domain Rating only ~0.266), this is the site's weakest lever for AI-citation likelihood, but it's also the hardest to move for an individual freelance portfolio (no realistic path to a Wikipedia entity; YouTube/Reddit presence would need to be built deliberately, e.g., a YouTube channel walking through case studies, or contributing genuinely to relevant subreddits under a consistent name).
- **This should be treated as a data gap in this audit, not a confirmed defect** — recommend a manual check (Google/Bing search for `"Andrew Yip" UX designer Vancouver`, site's LinkedIn engagement, any Dribbble/Behance presence) to close this out with real numbers.

---

## Platform-Specific Estimated Scores

*(Heuristic estimates based on known ranking-signal preferences per platform — not measured via live LLM queries; no DataForSEO or equivalent live-visibility tool was available in this environment. Treat as directional, not authoritative.)*

| Platform | Est. Score | Rationale |
|---|---|---|
| Google AI Overviews | 60/100 | Strong structured data + hreflang/canonical helps; held back by short passages and no question-based headings that AIO favors for direct-answer extraction |
| ChatGPT / OAI-SearchBot | 55/100 | Fully crawlable and well-organized via llms.txt, but fragmented paragraphs and isolated stat-cards limit clean quotable extraction |
| Perplexity | 58/100 | PerplexityBot explicitly allowed; benefits from clear source attribution language in llms.txt; hurt by missing datePublished/freshness signals |
| Bing Copilot | 65/100 | Best positioned of the four — rewards the site's strong technical SEO (valid sitemap, hreflang, canonical, structured data) more heavily than raw passage-length optimization |

---

## Top 5 Highest-Impact Changes (prioritized)

1. **Add a citable sentence around every stat-card metric** (Finding 1) — effort: ~1 hr total across 4 case studies. Highest impact: directly fixes the most common AI-citation failure mode (unquotable bare numbers) on the site's highest-value content.
2. **Add one ~150-word consolidated answer paragraph per major case-study section** (Finding 2) — effort: ~2-3 hrs for Yocale + Delta Controls (highest-priority case studies). Brings passage length into the optimal citation range without disrupting existing scannable design.
3. **Add datePublished/dateModified to CreativeWork schema on all 4 case studies** (Finding 4) — effort: ~20 min. Cheap, mechanical fix that materially helps Perplexity/Google AIO freshness scoring.
4. **Add a short visible/sr-only summary paragraph to the homepage** (Finding 5) — effort: ~30 min. Closes the gap on the single most-likely-cited URL on the domain.
5. **Reframe 2-3 headings per case study as questions** (Finding 3) — effort: ~30 min per case study. Improves match rate against natural-language AI search queries with minimal design disruption.

Lower priority but worth batching in: RSL 1.0 file (Finding 6), video caption/transcript (Finding 8). Finding 7 (H1 duplication) needs no action at current scope.
