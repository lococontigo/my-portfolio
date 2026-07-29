# SXO Analysis: andrewthyip.com

**Site type:** Bilingual (EN / zh-Hant) personal portfolio + freelance-services site for Andrew Yip, UX/UI designer & developer, Vancouver BC. Two funnels from the homepage: `/portfolio/` ("I'm hiring") and `/services/` ("I need a website").

**Pages analyzed:** `/` (home), `/portfolio/`, `/services/`, `/about/`, `/services/about/`, `/contact/`, `/services/contact/`, `/services/work/`, `/work/yocale/` (sample case study). Fetched via `render_page.py --mode auto` + `parse_html.py`.

---

## HEADLINE FINDING: Andrew's own site does not surface for his own name

This is the primary, highest-severity finding and should be fixed before any on-page funnel optimization.

Across every query tested — including his own name — `andrewthyip.com` did not appear in organic results:

| Query | Top results | andrewthyip.com present? |
|---|---|---|
| "Andrew Yip UX designer Vancouver" | LinkedIn (`ca.linkedin.com/in/andrewthyip`), The Manifest, HelloDarwin, Clutch, Workhoppers | **No** |
| `"Andrew Yip" designer portfolio andrewthyip` | LinkedIn, unrelated Andrew Yips (game designer, installation artist, electrical engineer) | **No** |
| "andrewthyip.com portfolio Vancouver designer" | LinkedIn, competing local designer portfolios | Site appeared only via a **legacy, dead URL** (see below) |
| "UX/UI designer Vancouver portfolio" | Individual competitor portfolios (Jarell Alvarez, Richard Jiang, Amy Ju), agency directories, job boards | No |
| "web design services Vancouver freelance" | Cloud Creations, AJ Web Design, Tiffany Mark, Design with Daria, Upwork/Toptal marketplaces | No |

**Evidence of decay:** the one query that did surface the domain returned `https://andrewthyip.com/ant-rentals-media-branding/` — a URL from a prior information architecture. Fetching it directly confirms:

```
Status: 404 | mode=raw | is_spa=False
"The page you're looking for can't be found. Return to Homepage"
```

The current IA serves that case study at `/work/ant/` instead, but there is no 301 redirect from the old URL. Anyone who clicks Andrew's own indexed search result today lands on a 404.

**Impact:** for a personal-brand query, Google is currently treating LinkedIn (and unrelated namesakes) as more authoritative than Andrew's own domain, and the one legacy foothold it has indexed is broken. This is a page-type-adjacent SXO problem — it isn't that the wrong page type is showing, it's that *no page* is showing, and the homepage that should anchor brand queries (`/`) has no name-bearing, indexable identity content (see below).

---

## 1. SERP Landscape

### Cluster A — "I'm hiring" / recruiter intent ("UX/UI designer Vancouver portfolio")
- **Dominant page type:** Fragmented (~40% confidence). Individual freelancer/designer portfolios (Service-Page-like: hero + case studies + contact) compete alongside agency directories (Clutch, DesignRush, TechBehemoths — Comparison/listicle type) and job boards (Indeed, Glassdoor, ZipRecruiter — different intent entirely, signals Google reads this query as ambiguous between "hire a person" and "find a job").
- **Content depth norm:** Competing individual portfolios (Richard Jiang, Jarell Alvarez, Amy Ju) lead with a named bio, project narratives, and a visible path to contact/hire.
- **Schema expectation:** Person schema is common; some directory results carry AggregateRating/Review schema.
- **SERP features:** No AI Overview or featured snippet observed for this query via WebSearch (see Limitations — feature detection is approximate without DataForSEO).

### Cluster B — "I need a website" / freelance-client intent ("web design services Vancouver freelance")
- **Dominant page type:** **Service Page (~55% consensus).** Cloud Creations, AJ Web Design, Tiffany Mark, Design with Daria all present process + testimonials + contact CTA. Remaining ~45% is Comparison/Directory type (Upwork, Toptal, Workhoppers, Twine).
- **Content depth norm:** Rich — process explanation, named case studies, testimonials, and (frequently, per summarized results) visible cost expectations ("$75–$200/hr" pattern appears in aggregated freelance-hiring content).
- **Media expectations:** Screenshots of past client sites are standard.

### Cluster C — Personal brand ("Andrew Yip" + variants)
- **Dominant type:** LinkedIn profile + third-party agency/freelancer directories (Manifest, HelloDarwin, Workhoppers). No personal-portfolio-owned domain (i.e., `andrewthyip.com`) appears.
- **Implication:** the SERP consensus for his own name is currently "third-party profile," not "personal site" — the opposite of what a healthy personal-brand SERP looks like.

---

## 2. Page-Type Alignment

| Page | Target page type (taxonomy) | SERP expects | Verdict | Severity |
|---|---|---|---|---|
| `/` (home) | Degenerate — a bare two-tile "gate," not a real content type (no value-prop copy, no name in H1, no trust signal) | Landing Page / personal-identity hub anchoring brand queries | **MISMATCH** | **CRITICAL** — this is the page that should win brand queries, and it has 17 words of body copy, no mention of "Andrew Yip" in any heading, and zero schema-visible narrative |
| `/portfolio/` | Landing Page / thin Service-Page hybrid (hero + 4 case-study cards) | Service Page (recruiter-facing competitor portfolios blend bio + process + proof) | **MISMATCH** | MEDIUM — right shape, missing testimonials, process narrative, and any resume/"open to work" signal |
| `/services/` | Service Page (offerings, "How It's Gonna Work" process, testimonials, CTA) | Service Page | **ALIGNED** | — closest-matching page on the site to what its SERP cluster rewards |
| `/about/` & `/services/about/` | Bio/testimonial page, served identically at two URLs | N/A (internal duplication issue) | **MISMATCH (duplication)** | HIGH — byte-identical 679-word body (same H1 "About Andrew," same testimonial ItemList, same H2s), differing only in `<title>`/meta description; a real opportunity to serve the recruiter one narrative and the client another is being wasted |
| `/contact/` & `/services/contact/` | ContactPage | N/A | **MISMATCH (duplication)** | LOW-MEDIUM — identical 47-word form page/schema at two URLs, no field/copy differentiation by persona |

---

## 3. User Stories (derived from SERP + page signals)

1. **As a Recruiter (Awareness)**, I want to quickly confirm Andrew is a real, credentialed UX/UI designer in Vancouver, because I'm scanning many candidates, but I'm blocked by the homepage gate showing no name, credentials, or narrative before I click — and searching "Andrew Yip UX designer Vancouver" surfaces only LinkedIn, never `andrewthyip.com`.
   *(Source: home H1 "I'm hiring" on a 17-word page; WebSearch for his name returning zero results from the target domain)*

2. **As a Small-Business Owner (Consideration)**, I want proof a freelancer can be trusted with my website budget, because the "web design services Vancouver freelance" SERP is dominated by process-driven Service Pages with testimonials, but if I land on `/portfolio/` instead of `/services/` I find zero testimonials and no process explanation.
   *(Source: SERP dominant type = Service Page w/ testimonials; `/portfolio/` gap analysis below — 0 testimonials on-page)*

3. **As a Comparison Shopper (Decision)**, I want a clear sense of cost or engagement scope, because aggregated freelance-hiring content in this space anchors expectations around hourly/monthly ranges, but `/services/` names a "Full Package" tier with no price or scope indicator anywhere on the page.
   *(Source: WebSearch summary for "hire freelance web developer small business Vancouver" surfacing cost-expectation content; `/services/` H3 "Full Package" with no adjacent price)*

4. **As someone who found an old link to Andrew's work (re-engagement)**, I want to view the ANT Rentals case study Google indexed, because `andrewthyip.com/ant-rentals-media-branding/` still ranks, but I'm blocked by a live 404 with no redirect to the current `/work/ant/` location.
   *(Source: confirmed 404 status code fetched directly)*

5. **As a Traditional-Chinese-speaking visitor (Awareness)**, I want to browse in my own language given Andrew's bilingual HK/Vancouver story, because every page correctly declares an `hreflang="zh-Hant"` alternate at `/ch/...`, but I can't confirm from this audit whether the `/ch/` funnel avoids the same thinness/duplication problems found in English (flagged as a limitation, not verified first-hand).
   *(Source: hreflang alternates present on every parsed page; homepage includes a visible 中文 toggle)*

Stories span awareness (1, 5), consideration (2), and decision (3) stages, plus a re-engagement/technical-decay case (4).

---

## 4. Gap Analysis — SXO Gap Score (separate from SEO Health Score)

Scored per page since the site intentionally forks into two funnels; homepage is scored as the shared entry point.

| Dimension (max) | `/` Home | `/portfolio/` | `/services/` |
|---|---|---|---|
| Page Type (15) | 2 — no classifiable content type; H1 doesn't name Andrew | 9 — reads as portfolio/landing hybrid, matches competitor shape loosely | 13 — strong Service Page match vs. SERP consensus |
| Content Depth (15) | 1 — 17 words total | 6 — 141 words on-page (real depth is one click away in case studies at ~500 words each) | 12 — 687 words across 5 sections |
| UX Signals (15) | 6 — binary choice is clear, but zero context before committing to a funnel | 10 — clear hero + repeated "Say hello →" CTA; no resume/CV or "open to work" badge here | 11 — clear sectioning and repeated CTA; no pricing/scope signal |
| Schema (15) | 8 — Person + WebPage present and correct, but no ProfessionalService/Breadcrumb | 6 — Person schema only; no ItemList tying the 4 case studies together at the hub level | 10 — WebPage w/ nested Person "about"; missing Service/Review schema (testimonials live on `/about/`, not schema-linked here) |
| Media (15) | 3 — zero images | 11 — logo strip + 4 project mockups w/ descriptive alt text | 13 — 30+ contextual screenshots, well-described alt text |
| Authority (15) | 2 — no testimonials, no credentials visible | 5 — client logos present (Delta Controls, Yocale, RKW, ANT, Blu Bathworks) but no testimonial quotes on-page | 13 — "What People Say About Me" testimonials + named client logos |
| Freshness (10) | 4 | 4 | 4 |
| **Total** | **26/100** | **51/100** | **76/100** |

Freshness scored uniformly low (4/10) across the site: `publication_date` resolves to a generic `2026-01-01` build date with no visible "last updated" or dated case-study signal anywhere, and one confirmed legacy URL (`/ant-rentals-media-branding/`) is still indexed and 404ing — evidence of unmanaged content decay.

---

## 5. Persona Scores

| Persona | Relevance | Clarity | Trust | Action | Total | Rating |
|---|---|---|---|---|---|---|
| Personal-Brand Searcher ("Andrew Yip") | 0/25 | 0/25 | 3/25 | 5/25 | **8/100** | Critical Mismatch |
| Recruiter / Hiring Manager | 18/25 | 17/25 | 13/25 | 14/25 | **62/100** | Good, notable gaps |
| Comparison Shopper / Budget-Conscious Buyer | 14/25 | 12/25 | 18/25 | 12/25 | **56/100** | Needs Work |
| Bilingual HK-Vancouver Visitor (zh-Hant) | 15/25 | 12/25 | 12/25 | 12/25 | **51/100** | Needs Work (partially assessed — see Limitations) |
| Small-Business Owner (freelance client) | 22/25 | 16/25 | 21/25 | 15/25 | **74/100** | Good |

### Weakest Persona: Personal-Brand Searcher (8/100)
**Top issue:** The domain does not appear at all for "Andrew Yip" queries — LinkedIn and unrelated namesakes own the SERP — and the homepage that should anchor brand identity carries no name, bio, or trust signal (just two funnel tiles).
**Recommended fix:** Give the homepage real indexable identity content — a name-bearing H1 ("Andrew Yip — UX/UI Designer & Developer"), a one-paragraph bio, and visible credential/trust markers — *before* the "I'm hiring / I need a website" fork, not instead of it. Pair with a 301 redirect for the dead `/ant-rentals-media-branding/` URL so any residual brand-query traffic doesn't land on a 404.

### Systemic Issues
- **Trust dimension is the weakest link outside the brand-search persona**: `/portfolio/` has zero testimonials despite `/about/` holding six strong, named quotes one click away.
- **Action dimension caps out around 12–15/25 for every persona except the client funnel**: no resume/CV download, no "open to work" badge on `/portfolio/` itself, no pricing/scope signal on `/services/`.
- **Content duplication**: `/about/` ≡ `/services/about/` and `/contact/` ≡ `/services/contact/` are byte-identical aside from `<title>`/meta description — a missed chance to answer each persona's distinct questions, and a genuine technical-SEO duplicate-content risk.

### Priority Actions
1. **Fix brand-query invisibility (weakest persona, foundational):** add name-anchored identity content to the homepage above the funnel fork; 301-redirect `/ant-rentals-media-branding/` → `/work/ant/`.
2. **Close the Trust gap on `/portfolio/`:** pull 1–2 testimonial quotes onto the page itself; add a visible "Open for New Opportunity" status (already exists on `/about/` per site copy) and a resume/CV link for the recruiter persona's Action score.
3. **De-duplicate `/about/` vs. `/services/about/` and `/contact/` vs. `/services/contact/`:** either genuinely differentiate copy per persona (recruiter-flavored About vs. client-flavored About; recruiter-flavored contact fields like "role/notice period" vs. client fields like "budget/timeline") or canonicalize one URL to the other.
4. **Add pricing/scope signal to `/services/`:** a "packages start at $X" or typical-project-range line addresses the Comparison Shopper's Clarity/Action gaps and matches SERP norms in this space.
5. **Verify the `/ch/` funnel independently** — hreflang declares it but this audit did not deep-crawl it (see Limitations).

---

## Cross-Skill References
- Duplicate `/about/`↔`/services/about/` and `/contact/`↔`/services/contact/` content → `/seo page` for page-level audit and canonicalization guidance; `/seo technical` to confirm no duplicate-content indexing penalty.
- Missing ProfessionalService/Service/Review schema on `/services/` and `/portfolio/` → `/seo schema` for generation.
- Broken legacy URL still indexed → `/seo technical` for a full redirect/orphan-URL sweep beyond the one instance found here.
- E-E-A-T thinness on `/portfolio/` (no testimonials, no dated case studies) → `/seo content` for a deeper E-E-A-T audit.
- "Vancouver" local intent in both funnel queries, no LocalBusiness/NAP schema found anywhere on-site → `/seo local` to assess whether a Google Business Profile would help the freelance-client funnel.

---

## Limitations
- SERP analysis used WebSearch, not DataForSEO — People Also Ask boxes, ads, featured-snippet formats, and true ranking positions could not be directly observed; page-type classification of competitors is based on titles/snippets/summaries only, and "SERP consensus %" figures are estimates, not precise counts.
- "Does not rank" for brand/portfolio/services queries is inferred from absence across the top ~10 WebSearch results on 6 distinct queries — this is a strong signal but not equivalent to Google Search Console impression/position data.
- The `/ch/` (Traditional Chinese) funnel was confirmed to exist via hreflang tags and a homepage language toggle, but its pages were not individually fetched/parsed in this audit — Persona 4 (bilingual visitor) scoring reflects that gap.
- No access to Google Search Console, analytics, or backlink data — authority/link-equity signals (e.g., why LinkedIn outranks the owned domain for the brand query) are inferred from public SERP behavior only.
- Local-pack/Google Business Profile presence for "Vancouver" queries was not independently verified.

---

Offer: Generate a PDF report? Use `/seo google report`
