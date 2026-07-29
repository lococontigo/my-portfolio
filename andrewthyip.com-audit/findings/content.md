# Content Quality Audit — andrewthyip.com

Method: live fetch of rendered HTML for all in-scope EN pages and their `/ch/` counterparts via `curl` (Astro output is fully static, no client-side content injection observed except the split-gate homepage's own inline script). Body text extracted from `<main>`, JSON-LD/meta parsed directly, word counts computed per-language (Latin whitespace-split for EN, CJK character count for ZH). Full raw HTML and extraction script are in the session scratchpad if re-verification is needed.

## Content Quality Score: 62 / 100

## E-E-A-T Breakdown

| Factor | Weight | Score | Notes |
|---|---|---|---|
| Experience | 20% | 80/100 | Strong first-hand narrative on `/about/` ("When I joined, an existing WordPress site was already in place…"), personal facts, a visible project timeline, and process-level detail in case studies. |
| Expertise | 25% | 70/100 | Real tool/skill stack, measurable technical outcomes tied to named methods (GTM, technical SEO, design systems). No credentials/certifications beyond one postgrad program name-drop, and no author-bio block repeated on the case-study pages themselves (credential signal lives only in global `Person` JSON-LD). |
| Authoritativeness | 25% | 60/100 | Six real, named testimonials with title + company (incl. Delta Controls Inc., IBM) — genuinely strong social proof, rare for a freelance portfolio. Weak beyond that: no press mentions, no external citations/backlinks surfaced, only one award reference ("Capstone Award" on Crowd Ease, not elaborated or linked). |
| Trustworthiness | 30% | 50/100 | HTTPS, real name throughout, named testimonials. But: contact form routes to a personal Gmail address, not a branded domain email; no phone number or physical address anywhere; no privacy policy or terms page linked site-wide despite a contact form collecting name/email/company/phone/message. |
| **Weighted overall** | | **64/100** | |

## AI Citation Readiness Score: 65 / 100

Strengths: case studies are dense with quotable, specific stats (36.7% traffic increase, 15% engagement lift, 5.15% CTR, 40% bounce-rate reduction, >1k monthly visitors) attached to named clients — exactly the kind of fact AI answer engines like to lift. `Person`, `CreativeWork`, `BreadcrumbList`, `ItemList`, and `ContactPage` JSON-LD are present and clean.

Weaknesses: the homepage — the URL most likely to be crawled/cited as the canonical entity page — carries almost zero extractable text (see Finding 1). No `datePublished`/`dateModified` in any `CreativeWork` schema, so an AI system has no freshness signal to cite. Quotable facts are buried deep in case-study body copy rather than surfaced near the top or in the index/hub pages that link to them.

---

## Findings

### 1. Homepage carries almost no indexable/citable content
**Severity:** High

**Evidence:** `https://andrewthyip.com/` (and `/ch/`) renders as a two-panel "split-gate" with exactly two short headlines and two CTA links — no other body copy:
```html
<h1 class="split-headline">I'm hiring</h1>
<span class="split-cta">andrewthyip.com/portfolio →</span>
...
<h2 class="split-headline">I need a website</h2>
<span class="split-cta">andrewthyip.com/services →</span>
```
Extracted body text: **11 words (EN)**, **~9 CJK characters (ZH)**. The Homepage minimum per QRG topical-coverage guidance is 500 words. Entity information (name, role, skills) exists only inside `Person`/`WebPage` JSON-LD — it is not present as visible, crawlable text on the page a user or crawler actually reads. This is a deliberate UX decision (confirmed by recent commit "Add split-screen homepage, relocate portfolio to /portfolio/"), but it leaves the site's root URL — the URL most likely to be treated as the canonical entity page by Google and AI answer engines — with no topical substance to rank or cite.

**Recommendation:** Keep the split-gate interaction, but add a small amount of always-visible supporting copy (e.g., a one-line positioning statement, name + role + location, or a footer strip) so the root URL has enough on-page text to independently signal who Andrew is and what the two paths lead to — not just two four-word headlines. At minimum, mirror the `Person` JSON-LD's key facts (name, role, location, skills) into visible text near the split panels.

### 2. `/about/` and `/services/about/` are byte-identical duplicate pages (both locales)
**Severity:** High

**Evidence:** Extracted body text for `en-about.html` and `en-services-about.html` is **identical, character-for-character** (4,227 chars, 681 words each). Same for the Chinese pair `ch-about.html` / `ch-services-about.html` (3,032 chars each). Both URLs have distinct, self-referencing `<link rel="canonical">` tags (`/about/` and `/services/about/` respectively — neither points to the other), and **both are explicitly listed in `sitemap.xml`**:
```
<loc>https://andrewthyip.com/about/</loc>
<loc>https://andrewthyip.com/services/about/</loc>
```
This tells Google to index two separate, fully identical pages with no canonical signal resolving them to one. It splits link equity/ranking signals for what is otherwise a strong E-E-A-T page (real testimonials, named companies, first-hand narrative).

**Recommendation:** Pick one canonical URL for the About content (likely `/about/`, since it's the shorter/more natural URL) and either (a) redirect `/services/about/` to it with a 301, or (b) if both must exist for site-structure/nav reasons, add `<link rel="canonical" href="https://andrewthyip.com/about/">` to the `/services/about/` variant so search engines consolidate signals onto one URL. Apply the same fix to the `/ch/` pair.

### 3. `/contact/` and `/services/contact/` are byte-identical duplicate pages (both locales)
**Severity:** High

**Evidence:** Same pattern as Finding 2 — `en-contact.html` and `en-services-contact.html` extracted body text is identical (258 chars, 45 words), as is `ch-contact.html` / `ch-services-contact.html` (99 chars each). Both self-canonicalize and both appear in `sitemap.xml`.

**Recommendation:** Same fix pattern as Finding 2: consolidate to a single canonical contact URL (`/contact/`) with a 301 from `/services/contact/`, or add a cross-referencing canonical tag if the duplicate route must stay live for navigation purposes.

### 4. `/portfolio/` and `/services/work/` are near-duplicate hub pages
**Severity:** Medium

**Evidence:** Both pages list the same four case studies with **verbatim-identical project descriptions** ("Yocale is an all-in-one business management and client scheduling software designed for appointment-based businesses." etc. appears word-for-word on both). They differ only in the intro sentence and page framing (`/portfolio/`: "Designer & Developer — I'm Andrew…"; `/services/work/`: "My Work — A selection of projects…"). ~85%+ content overlap, both listed in `sitemap.xml` with distinct self-canonicals.

**Recommendation:** Lower priority than Findings 2–3 since the framing differs, but still worth resolving: either canonicalize `/services/work/` to `/portfolio/`, or differentiate the project blurbs so each page serves a distinct search intent (portfolio = personal showcase tone; services/work = client-outcome/sales tone with different copy, not copy-pasted cards).

### 5. Case study "Ant Rentals" is significantly thinner than its sibling case studies
**Severity:** Medium

**Evidence:** Word counts across the four case studies (EN):
| Case study | Word count |
|---|---|
| Crowd Ease | 857 |
| Delta Controls | 607 |
| Yocale | 510 |
| **Ant Rentals** | **188** |

Unlike Delta/Yocale/Crowd Ease, the Ant Rentals page has no numbered "Overview"/"Problem" section, no team/timeline breakdown of process phases, and a much shallower "Approach" section (three short paragraphs vs. multi-part problem→solution structures elsewhere). It still carries real metrics (>1k monthly visitors, 80% engagement lift, 40% bounce-rate reduction) but lacks the narrative depth that makes the other three case studies strong E-E-A-T assets.

**Recommendation:** Bring Ant Rentals up to parity with the other three case studies — add an explicit Problem/Solution breakdown, name any stakeholders involved (as Delta Controls' page does with "Team: Marketing Director, Graphic Designer, Back-end Developer"), and expand the Approach section with the same level of process detail.

### 6. No freshness/date signals on case studies
**Severity:** Medium

**Evidence:** None of the four `CreativeWork` JSON-LD blocks include `datePublished` or `dateModified`:
```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "Ant Rentals: Building a Brand for Digital Presence",
  "description": "...",
  "url": "https://andrewthyip.com/work/ant/",
  "author": { "@type": "Person", "name": "Andrew Yip", "url": "https://andrewthyip.com" }
}
```
There is also no visible "published" or "last updated" date on the page itself — only an in-copy "Duration: 2023–2024" style range that's part of the narrative, not a structured freshness signal. Google's Sept 2025 QRG places explicit weight on freshness/update signals for trust, and AI answer engines use `datePublished`/`dateModified` to judge whether a cited fact is current.

**Recommendation:** Add `datePublished` (project completion date) and `dateModified` (last content edit) to each `CreativeWork` schema block, and consider a small visible "Completed [year]" or "Last updated [date]" label on each case study.

### 7. Contact/trust signals below expectation for a freelance services business
**Severity:** Medium

**Evidence:**
- Contact form and mailto link point to `andrewthyip@gmail.com` — a personal Gmail address, not a branded domain email (e.g. `hello@andrewthyip.com`), despite the site owning the `andrewthyip.com` domain.
- No phone number found on any page.
- No physical address/service-area detail beyond "Vancouver, BC" in prose copy.
- No privacy policy or terms-of-service page linked anywhere in the footer or nav, despite `/contact/` collecting name, email, company, phone, and message.

**Recommendation:** Set up and display a branded email address on the domain, add a brief privacy note (even a short one, given the small footprint of data collected) linked from the contact form and footer, and consider stating service area/timezone explicitly for trust with prospective clients evaluating a freelancer.

### 8. `/services/` page is below the Service Page word-count floor
**Severity:** Low

**Evidence:** `/services/` extracts to 682 words (EN); QRG guidance for service pages is a topical-coverage floor of ~800 words. The Chinese counterpart is proportionally similar (637 CJK characters). Not a large shortfall, and word count itself isn't a ranking factor — flagged only because the page's stated purpose (persuading a prospective client to hire Andrew) would likely benefit from more comprehensive coverage of process, pricing expectations, or FAQ-style objection handling, which are currently thin or absent.

**Recommendation:** Consider adding a lightweight FAQ block (e.g., typical timeline, pricing range, process steps) — this both closes the topical-coverage gap and adds natural FAQ-schema opportunity for AI citation.

### 9. Images with missing or empty `alt` attributes
**Severity:** Low

**Evidence:** Counted directly from fetched HTML:
| Page | Total `<img>` | No `alt` attr | Empty `alt=""` |
|---|---|---|---|
| `/work/ant/` | 48 | 8 | 6 |
| `/work/crowd-ease/` | 44 | 12 | 0 |
| `/work/yocale/` | 48 | 0 | 6 |
| `/services/` | 39 | 0 | 12 |

Empty `alt=""` is correct for purely decorative images, but should be verified case-by-case — several of these appear to be case-study screenshots/process images, which should carry descriptive alt text both for accessibility and because image alt text is a meaningful signal for image search and AI multimodal citation.

**Recommendation:** Audit the flagged images; add descriptive `alt` text to any that convey case-study content (UI screenshots, before/after comparisons, diagrams), and reserve `alt=""` strictly for decorative fills/backgrounds.

### 10. (Informational, no action likely needed) Duplicated H1 text via aria-hidden + sr-only pattern
**Severity:** Low / Informational

**Evidence:** Case-study H1s use a legitimate accessible pattern for animated headline text:
```html
<h1 class="case-hero-title">
  <span aria-hidden="true"><em>Ant Rentals</em>: Building a Brand for Digital Presence</span>
  <span class="sr-only">Ant Rentals: Building a Brand for Digital Presence</span>
</h1>
```
This is correct for screen readers (the animated/split span is hidden from AT, the `sr-only` twin is what's announced) and Googlebot's rendered-text extraction understands `aria-hidden`/`sr-only` conventions. However, simpler boilerplate-stripping tools used by some AI crawlers do plain HTML-to-text extraction without full CSS/ARIA awareness, and may see the headline duplicated. Not worth changing the accessibility pattern for this; flagging only as a minor, low-confidence AI-citation note.

**Recommendation:** No change recommended to the accessibility pattern itself. If AI-crawler duplication is later confirmed as a real problem (e.g., via server log analysis of AI bot user agents), consider adding the page's canonical title once via a `<meta>`-level signal rather than altering the accessible markup.

---

## What's working well (do not change)

- **Testimonials are genuinely strong E-E-A-T material**: six named reviewers with job titles and real companies (Delta Controls Inc., IBM), not generic/anonymous quotes. This is a real differentiator versus typical freelance portfolios.
- **Case studies (Delta, Yocale, Crowd Ease) have real depth and real metrics** tied to specific client names — strong AI-citation-ready content.
- **Hreflang implementation is correct and reciprocal** across every page pair checked (`en` / `zh-Hant` / `x-default` all present and pointing to the right URLs) — no hreflang errors found.
- **JSON-LD coverage is broad and mostly well-formed** (`Person`, `WebPage`, `ContactPage`, `CreativeWork`, `BreadcrumbList`, `ItemList` all present on the appropriate page types).
