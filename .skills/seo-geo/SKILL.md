---
name: seo-geo
description: SEO and Generative Engine Optimization playbook for metadata, Open Graph, canonicals/hreflang, robots/sitemap, JSON-LD, semantic content structure, and AI-citation readiness. Use when working on discoverability, ranking, meta tags, structured data, or content meant to be quoted by AI answer engines.
paths:
  - '**/sitemap*.{ts,tsx,js,jsx,xml}'
  - '**/robots*.{ts,tsx,js,jsx,txt}'
  - '**/layout.{tsx,jsx,vue,svelte}'
  - '**/*seo*'
  - '**/*metadata*'
  - '**/llms.txt'
---

# SEO + GEO

GEO here means Generative Engine Optimization (AI answer engines / overviews), not geographic SEO.

## Workflow

1. Identify the indexable surface (route/URL) and the success condition (crawl, rank, share card, or AI citation).
2. Find existing metadata helpers, layout `metadata` exports, and JSON-LD patterns; reuse them.
3. Apply the smallest SEO + GEO change for the request.
4. Run the SEO checklist, then the GEO checklist, for the touched surface.
5. Route every new or changed user-facing meta/copy string through `locale-translator` — keys in all active locales, no hard-coded copy.
6. Verify in source or rendered HTML: title, description, canonical (if needed), and any JSON-LD.
7. Note what you checked and any remaining gaps in the task summary.

## SEO checklist

- [ ] Unique, accurate document title (not keyword-stuffed)
- [ ] Meta description matches page intent; distinct per URL when indexable
- [ ] Open Graph / Twitter tags present when the surface is shareable
- [ ] Canonical set when duplicates or parameterized URLs exist
- [ ] `hreflang` / locale alternates when multi-locale indexable pages exist
- [ ] robots / sitemap guidance correct (do not block what should rank; do not index thin duplicates)
- [ ] One clear H1; heading hierarchy is logical
- [ ] Meaningful images have alt text (via locale keys when user-facing)
- [ ] Internal links use clear, descriptive anchors where added
- [ ] No new thin/duplicate indexable pages without a reason
- [ ] Core Web Vitals touched only when the request is ranking/performance-relevant — no drive-by perf rewrites

## GEO checklist

- [ ] Brand / product / entity facts stated clearly and consistently
- [ ] Question-shaped headings have a direct answer nearby (quotable, non-ambiguous)
- [ ] FAQ / HowTo / Organization (or equivalent) JSON-LD only when it matches visible content and local patterns
- [ ] Claims do not contradict other pages or locales
- [ ] Avoid thin, hedged, or contradictory statements that confuse citation
- [ ] AI-crawler / `llms.txt` changes only if the project already has that pattern — do not invent infra

## Locale checklist

- [ ] No hard-coded user-facing titles, descriptions, or OG copy in the diff
- [ ] New/changed keys exist in every active locale (`en`, `th`, …)
- [ ] Placeholders / ICU tokens preserved
- [ ] Locale parity test run when keys changed (or `Locale: N/A` with reason)

## Verification

For metadata or structured-data changes:

1. Inspect the affected route's source or rendered `<head>` / JSON-LD.
2. Confirm title, description, and any canonical/OG tags match intent.
3. Confirm JSON-LD (if any) parses and aligns with visible content.
4. Note pass/fail in the task summary.

## Handoffs

- Layout / component wiring → `frontend`
- Server-rendered or API meta pipelines → `backend`
- Copy/keys → `locale-translator`
- Multi-layer sequencing → `senior-software-staff`
- Rendered-output verification → `tester`
