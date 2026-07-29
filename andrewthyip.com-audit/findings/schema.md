# Structured Data (JSON-LD) Audit — andrewthyip.com

Audited: 2026-07-27 (live production, fetched directly via `curl -sL` — no rendering script available in this environment; site is Astro static/SSR so raw HTML = rendered HTML, confirmed no client-injected JSON-LD)
Site: bilingual EN (default, `/`) / zh-Hant (`/ch/`), 12 URL pairs checked (24 pages total)

## Category summary

| Check | Status | Notes |
|---|---|---|
| JSON syntax validity | Pass | All 40 `<script type="application/ld+json">` blocks across 24 pages parse cleanly (validated with `JSON.parse`) |
| `@context` correctness | Pass | Every block uses `"https://schema.org"` (no `http`, no shorthand) |
| Deprecated types (HowTo, FAQPage, SpecialAnnouncement, CourseInfo, EstimatedSalary, LearningVideo) | Pass | None present anywhere on the site |
| Format (JSON-LD vs Microdata/RDFa) | Pass | JSON-LD used exclusively; no `itemscope`/`itemprop`/`vocab=` remnants found |
| URLs absolute | Pass | Every `url`/`item`/`@id`-equivalent value checked is a full `https://andrewthyip.com/...` URL |
| Self-serving review markup | **Fail** | `Review`/`ItemList` testimonials about the site owner's own service, on the site owner's own site — against Google's review-snippet eligibility guidelines |
| Entity consolidation (`@id`, coherent Person/ProfessionalService graph) | **Fail** | No `@id` anywhere; `ProfessionalService` never fully defined; `Person` payload is inconsistent page-to-page |
| `inLanguage` on zh-Hant pages | Pass, with gaps | Value `zh-Hant` is correct (matches `<html lang>`, `hreflang`, and `og:locale` root code) on the blocks that have it, but it's inconsistently applied (see Medium/Low findings) |
| Rich-result opportunities used | Partial | `ContactPage`, `BreadcrumbList`, `WebPage`, `Person`, `CreativeWork` all present; `AggregateRating`, `WebSite`, listing-page `ItemList` of case studies are missing |

**Schema score: 62/100** — JSON-LD is syntactically clean, uses correct format/context, and avoids every deprecated type, but the testimonial `Review` markup carries real policy risk, and the absence of any `@id` graph means Google/AI has no reliable way to resolve "Andrew Yip the Person" and "Andrew Yip's freelance service" into one coherent entity across 12 page pairs.

---

## High

### 1. Testimonial `Review`/`ItemList` markup is self-serving and won't produce rich results
**Evidence:** On `/about`, `/services/about`, `/ch/about`, and `/ch/services/about`, an identical block appears:
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Testimonials for Andrew Yip",
  "itemListElement": [
    {
      "@type": "ListItem", "position": 1,
      "item": {
        "@type": "Review",
        "reviewBody": "I found Andrew's understanding of user experience design...",
        "author": { "@type": "Person", "name": "Allan Lanzador", ... },
        "itemReviewed": { "@type": "ProfessionalService", "name": "Andrew Yip — UX/UI Design & Development", "url": "https://andrewthyip.com" }
      }
    }
    // ...6 reviews total, identical on all 4 pages
  ]
}
```
**Why it matters:** Google's review-snippet guidelines explicitly disallow self-serving reviews — markup is not eligible for rich results when the reviews are about the same entity that controls the page publishing the markup (a business/individual marking up testimonials about themselves on their own site), regardless of whether the underlying quotes are genuine third-party praise (these read as real LinkedIn recommendations, which is good for trust, but that doesn't change the eligibility rule — eligibility is about *who is publishing the review, and about what*, not just content authenticity). Practically: this markup will never generate a star-rating rich result no matter how it's tuned, and there's no `AggregateRating` present even if it were eligible (see Finding 2). Because the exact same 6-review payload is duplicated across 4 canonical URLs, this also 4x's the exposure of a markup pattern search engines are known to distrust.
**Recommendation:** Two acceptable paths — pick one:
- **Remove the `Review`/`ItemList` schema types** but keep the testimonials as plain visible HTML (no structured data). This preserves the trust signal for human visitors and for AI/LLM crawlers reading page text (which don't care about schema eligibility rules), while eliminating the guideline-violation risk entirely.
- **If structured data is still wanted for AI/GEO citation purposes**, retype the block as a generic `CreativeWork`/`Quotation`-style list rather than `Review`+`itemReviewed`, since `Review` specifically carries the self-serving-eligibility restriction — a plain list of quotes attributed to named people doesn't.
- Either way, consolidate into a single canonical source (see Finding 4) instead of duplicating the same payload on 4 URLs.

---

## Medium

### 2. No `AggregateRating` — moot while Finding 1 stands, but worth noting for completeness
**Evidence:** `grep -rl "aggregateRating"` across all 24 fetched pages returns zero matches.
**Why it matters:** Even setting aside the self-serving-review issue, Google's rich result for ratings/reviews generally requires an `AggregateRating` (or at minimum a clear rating value) alongside individual `Review` items — a bare list of `Review` objects with no aggregate summary is a weaker/less complete pattern regardless of eligibility.
**Recommendation:** No action needed if Finding 1's recommendation (drop `Review` typing) is adopted. If reviews are kept as `Review` type for some other reason, this becomes moot without also fixing the self-serving issue first — do not add `AggregateRating` to try to "complete" a pattern that still fails eligibility.

### 3. `ProfessionalService` is never defined as a real entity — only a bare, repeated stub
**Evidence:** The only appearance of `"@type": "ProfessionalService"` anywhere on the site is this 3-property stub, copy-pasted 6 times per page (once per review) across 4 pages — 24 times total, byte-identical each time:
```json
{ "@type": "ProfessionalService", "name": "Andrew Yip — UX/UI Design & Development", "url": "https://andrewthyip.com" }
```
No `address`, `telephone`, `areaServed`, `logo`, `sameAs`, or `founder`/`employee` link back to the `Person` entity exists anywhere. There is also no `Organization`/`WebSite` entity anywhere on the site (`grep -rl '"@type": "WebSite"'` → no matches).
**Why it matters:** This directly answers the brief's question — there is currently **no coherent Person/ProfessionalService entity tying pages together.** The "service" Andrew offers (per `/services/*`) and the "person" Andrew Yip (per `/about`, `/index`) are never connected in the graph; a knowledge-graph consumer (Google or an LLM) sees an unlinked, incomplete stub every time, not a real business entity.
**Recommendation:** Define `ProfessionalService` once, in full, and link it to `Person` bidirectionally via `@id` references (see the "Generated JSON-LD" section below for a ready-to-use graph).

### 4. No `@id` used anywhere — `Person` entity is duplicated with inconsistent properties
**Evidence:** `grep -rl '"@id"'` across all 24 pages → zero matches. The `Person` block itself varies page to page with no shared identifier:
- Homepage / `/portfolio` / `/services` / `/services/work`: minimal — `name`, `jobTitle`, `url`, `sameAs`, `knowsAbout` (no `image`, no `alumniOf`)
- `/about` / `/services/about`: fuller — adds `image` and `alumniOf: EducationalOrganization (Langara College)`
- `/contact` / `/services/contact`: different subset again — adds `email`, drops `knowsAbout`/`image`/`alumniOf`
- Every `CreativeWork` case-study page's `author` field: minimal — just `name` + `url`, no `sameAs`/`jobTitle`
**Why it matters:** None of these are technically wrong in isolation, but without a shared `@id` (e.g. `https://andrewthyip.com/#person`), Google/an LLM has to infer — rather than be told — that all ~10 of these differently-shaped `Person` mentions refer to the same individual. This is the exact "coherent entity" gap called out in the audit brief.
**Recommendation:** Adopt one canonical `Person` node with `@id`, and reference it via `{"@id": "https://andrewthyip.com/#person"}` everywhere else instead of repeating an inline object with a shifting property set. See the "Generated JSON-LD" section below.

### 5. Identical `ItemList`/`Review` payload duplicated verbatim across 4 canonical URLs
**Evidence:** `/about`, `/services/about`, `/ch/about`, and `/ch/services/about` are four *distinct* canonical URLs (`<link rel="canonical">` differs on each, confirmed via curl) that nonetheless ship byte-identical `Person` + `ItemList`/`Review` JSON-LD (same 6 reviews, same English review text and English `itemReviewed.name` even on the two zh-Hant pages — see Finding 7).
**Why it matters:** Beyond amplifying Finding 1's exposure 4x, this is a maintenance hazard — updating a testimonial requires editing the same block in 4 separate `.astro` files (`about.astro`, `services/about.astro`, `ch/about.astro`, `ch/services/about.astro`) with no single source of truth, which is how the pages will drift out of sync over time.
**Recommendation:** Extract the testimonials data structure into a single shared data file/const and import it into all 4 pages, so there's one source of truth even if the pages remain separate templates. Pair with Finding 1's fix (retype away from `Review`) rather than just deduplicating the risky pattern.

### 6. `/portfolio` has no page-level `WebPage`/`CollectionPage` schema, and no `ItemList` of its 4 case studies
**Evidence:** `/portfolio` (and `/ch/portfolio`) ships exactly one JSON-LD block — the minimal `Person` object also used on the homepage. There is nothing describing the *page itself* (no `name`/`description`/`url` matching the page's actual `<title>`, "UX/UI Designer & Developer · Andrew YIP") and nothing marking up the 4 case studies (`ant`, `crowd-ease`, `delta`, `yocale`) that the page visibly lists.
**Why it matters:** Every other top-level page (`/`, `/services`, `/services/about`, `/services/work`, `/contact`) declares a `WebPage`/`ContactPage` describing itself; `/portfolio` is the outlier with no page-identity schema at all. An `ItemList` of the case studies would also give Google/AI a direct, structured enumeration of Andrew's work instead of requiring it to be inferred from the rendered grid.
**Recommendation:** Add a `CollectionPage` (a `WebPage` subtype for listing pages) with a `mainEntity`/`hasPart` `ItemList` whose items are `{"@id": "..."}` references to each case study's `CreativeWork` node — see the "Generated JSON-LD" section.

---

## Low

### 7. Testimonial content is untranslated and inconsistently language-tagged on zh-Hant pages
**Evidence:** On `/ch/about` and `/ch/services/about`, the sibling `Person` block correctly declares `"inLanguage": "zh-Hant"`, but the `ItemList`/`Review` block that follows it on the same page has **no `inLanguage` property at all**, and every string inside it — `reviewBody`, author `jobTitle`/`worksFor`, and `itemReviewed.name` ("Andrew Yip — UX/UI Design & Development") — is still in English, unchanged from the EN pages.
**Why it matters:** A zh-Hant page asserting `inLanguage: "zh-Hant"` on some blocks while an untagged sibling block on the same page contains only English content is an internal inconsistency that undermines the language signal for the whole page, not just that block.
**Recommendation:** Either translate the testimonial content for the zh-Hant pages, or explicitly mark that block `"inLanguage": "en"` to accurately reflect its actual language (correct per-block tagging is better than a page-wide assumption once a page mixes languages). This is Low severity only because it rides on Finding 1 — if the `Review` markup is removed per Finding 1, this finding is moot.

### 8. `BreadcrumbList` never carries `inLanguage`, even on zh-Hant pages with visibly translated breadcrumb labels
**Evidence:** `/ch/work/ant`'s `BreadcrumbList` correctly translates `"name": "首頁"` for the Home crumb, but the block itself has no `inLanguage` property — unlike the `CreativeWork` block immediately following it on the same page, which does declare `"inLanguage": "zh-Hant"`.
**Recommendation:** Add `"inLanguage": "zh-Hant"` to `BreadcrumbList` blocks on `/ch/*` pages for consistency with the other schema types on the same page. Cosmetic/consistency-only — `BreadcrumbList` has no rich-result dependency on this field.

### 9. English-locale pages never declare `inLanguage` at all
**Evidence:** `inLanguage` appears on zero JSON-LD blocks across all EN pages (`/`, `/about`, `/contact`, `/portfolio`, `/services`, `/services/*`, `/work/*`) — it is exclusively a zh-Hant-page property in the current implementation.
**Why it matters:** Not wrong (the field is optional and `inLanguage` defaults are reasonably inferred from `<html lang="en">`), but on a bilingual site where the Chinese pages self-declare language explicitly, leaving English pages silent is an asymmetric pattern that's easy to forget as more locales or content types are added later.
**Recommendation:** Add `"inLanguage": "en"` to EN-page JSON-LD for parity, now that the codebase already has the pattern established on the `/ch/` side.

---

## Info / Passing

### 10. No deprecated schema types found — clean
Confirmed absent site-wide: `HowTo`, `FAQPage`, `SpecialAnnouncement`, `CourseInfo`, `EstimatedSalary`, `LearningVideo`. No action needed.

### 11. `CreativeWork` case-study markup is valid but minimal
**Evidence:** All 4 case studies (`ant`, `crowd-ease`, `delta`, `yocale`, × 2 locales) use an identical, consistent shape:
```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "...",
  "description": "...",
  "url": "https://andrewthyip.com/work/ant/",
  "author": { "@type": "Person", "name": "Andrew Yip", "url": "https://andrewthyip.com" }
}
```
**Why it matters:** `CreativeWork` has no dedicated Google rich-result feature, so this isn't a rich-result gap — but `image`, `datePublished`/`dateModified`, and `keywords` would all strengthen how confidently an LLM/AI crawler can cite and summarize each case study (per the project's GEO goals), and linking `author` via `@id` would tie it into the unified Person graph (Finding 4).
**Recommendation:** Low-priority enhancement — add `image` (case-study hero image), `keywords` (e.g. `["UX design", "SaaS", "design systems"]` per project), and swap the inline `author` object for an `@id` reference once Finding 4 is implemented.

### 12. Format and technical hygiene are all correct
No Microdata/RDFa remnants, `@context` always `https://schema.org`, all URLs absolute, no placeholder text found in any block, JSON syntactically valid everywhere tested. These are genuine passes and don't need further action.

---

## Generated JSON-LD — recommended unified graph

The core structural fix (Findings 3 + 4 + 6) is to stop repeating inline `Person`/`ProfessionalService` objects and instead publish one `@graph` with stable `@id`s, referenced everywhere else. Suggested canonical graph — place on the homepage (or a shared partial included site-wide) and reference by `@id` on every other page:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://andrewthyip.com/#person",
      "name": "Andrew Yip",
      "jobTitle": "UX/UI Designer & Developer",
      "url": "https://andrewthyip.com/",
      "image": "https://andrewthyip.com/images/andrew-yip-designer-photo.webp",
      "email": "mailto:andrewthyip@gmail.com",
      "sameAs": ["https://www.linkedin.com/in/andrewthyip/"],
      "knowsAbout": ["UX Design", "UI Design", "Web Development", "Design Systems"],
      "alumniOf": { "@type": "EducationalOrganization", "name": "Langara College" },
      "worksFor": { "@id": "https://andrewthyip.com/#service" }
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://andrewthyip.com/#service",
      "name": "Andrew Yip — UX/UI Design & Development",
      "url": "https://andrewthyip.com/",
      "founder": { "@id": "https://andrewthyip.com/#person" },
      "areaServed": "Vancouver, BC, Canada",
      "sameAs": ["https://www.linkedin.com/in/andrewthyip/"]
    }
  ]
}
```

Then, on every other page, replace the inline `Person` stub with a reference:
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Services · Andrew YIP",
  "url": "https://andrewthyip.com/services/",
  "about": { "@id": "https://andrewthyip.com/#person" }
}
```

And for `/portfolio`, add a `CollectionPage` with an `ItemList` of the case studies (referencing each `CreativeWork` by `@id` once Finding 11's `@id`s are added to the case-study pages):
```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "UX/UI Designer & Developer · Andrew YIP",
  "url": "https://andrewthyip.com/portfolio/",
  "about": { "@id": "https://andrewthyip.com/#person" },
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "url": "https://andrewthyip.com/work/ant/" },
      { "@type": "ListItem", "position": 2, "url": "https://andrewthyip.com/work/crowd-ease/" },
      { "@type": "ListItem", "position": 3, "url": "https://andrewthyip.com/work/delta/" },
      { "@type": "ListItem", "position": 4, "url": "https://andrewthyip.com/work/yocale/" }
    ]
  }
}
```

**Note:** `@graph`/`@id` patterns need to actually resolve — i.e. the `#person` and `#service` nodes must be reachable from every page that references them (Google resolves `@id` within the same page's JSON-LD graph, not across page loads). The practical implementation is to inline the full `@graph` block (or at minimum the `Person` node) on every page via a shared Astro component/partial, while other pages' *own* blocks use the short `{"@id": "..."}` reference form for `about`/`author`/`worksFor` — this still requires the full node to be defined somewhere in that same page's JSON-LD, not just linked by URL fragment. Confirm this in Google's Rich Results Test per page before shipping broadly.

---

## Pages checked

| URL (EN) | Schema types present | URL (zh-Hant) | Schema types present |
|---|---|---|---|
| `/` | WebPage, Person | `/ch/` | WebPage, Person |
| `/about` | Person, ItemList/Review | `/ch/about` | Person, ItemList/Review |
| `/contact` | ContactPage | `/ch/contact` | ContactPage |
| `/portfolio` | Person | `/ch/portfolio` | Person |
| `/services` | WebPage | `/ch/services` | WebPage |
| `/services/about` | Person, ItemList/Review | `/ch/services/about` | Person, ItemList/Review |
| `/services/contact` | ContactPage | `/ch/services/contact` | ContactPage |
| `/services/work` | WebPage | `/ch/services/work` | WebPage |
| `/work/ant` | BreadcrumbList, CreativeWork | `/ch/work/ant` | BreadcrumbList, CreativeWork |
| `/work/crowd-ease` | BreadcrumbList, CreativeWork | `/ch/work/crowd-ease` | BreadcrumbList, CreativeWork |
| `/work/delta` | BreadcrumbList, CreativeWork | `/ch/work/delta` | BreadcrumbList, CreativeWork |
| `/work/yocale` | BreadcrumbList, CreativeWork | `/ch/work/yocale` | BreadcrumbList, CreativeWork |
