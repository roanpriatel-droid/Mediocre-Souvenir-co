# Site Audit — Mediocre Souvenir Co.

**Date:** 2026-07-17 · **Stack:** Shopify Hydrogen (React Router 7) on Oxygen ·
**Data:** local catalog (`app/lib/catalog/`) + mock.shop stand-in variant for cart ·
**Verification ceiling locally:** `npm run build` + `npm run typecheck` (workerd
cannot run on this ARM64 machine; live checks happen on the Oxygen deploy).

## Site map (before)

Routes: `/` · `/shop` · `/new-arrivals` · `/provinces` (+`/provinces/$slug`) ·
`/states/$slug` (+ redirect index) · `/products/$handle` (40 BC towns) ·
`/request-your-town` · `/contact` · `/cart` · `/api/subscribe` · `/sitemap.xml` ·
skeleton leftovers (account, blogs, collections, policies, search) · `$` 404.

Components: Brand marks, ShirtMockup (3 templates), TownSearch, RegionBrowse,
RegionLanding, TownRackCard, CollectLadder, Strips (announcement/marquee/trust),
SocialProof empty states, EmailCapture, cart suite, Aside drawer.

## Scores — before

| Dimension | Score | Gap |
| --- | --- | --- |
| Visual craft | 7 | Sections are on-brand but metronomic (rule + grid, repeat). No editorial rhythm, no typographic statements, no reveals, flat card hovers. |
| Page depth | 4 | No about, materials, size guide, care, journal, FAQ, or lookbook. The world-building — the brand's whole engine — lives only in microcopy. |
| PDP persuasion | 6 | Single art view, templated blurb missing, no accordions, no sticky ATC, size-guide absent, cross-sell is one row. |
| Mobile experience | 7 | Responsive and legible, but no sticky ATC, no swipe gallery, marquee/heroes untested on 375px rhythm. |
| Performance | 8 | SVG-first pages are light; fonts via Google with swap; no image CDN weight. Bundle carries some skeleton dead code. |
| SEO / GEO | 7 | Strong templated product/region SEO + JSON-LD + sitemap. Missing: OG/Twitter cards, Organization schema, FAQ schema, llms.txt, article content. |
| Accessibility | 7 | Semantic headings, labels, aria on search/asides. Missing: visible focus system, keyboard-audited modal/accordions, contrast audit of sage/mustard text uses. |
| Conversion architecture | 6 | Ladder + hints exist. No free-shipping progress, no cart upsell, no filters/sort, no email modal, analytics only partial (Hydrogen defaults). |

## Fix list (ships in phases)

- **P1 Visual:** scroll reveals (opacity/translate ≤400ms, reduced-motion safe);
  editorial statement + postcard interludes on home; rack-card hover lift +
  art zoom; heading `text-wrap: balance`; spacing normalization pass.
- **P2 Depth:** /lookbook (BC road-trip scrolling story, shoppable),
  /about, /materials (GSM, construction), /size-guide (CC1717 tables + fit),
  /care, /journal + 4 seeded 600+ word articles with Article schema,
  /faq (accordion + FAQPage schema), full sitemap footer.
- **P3 PDP:** 3-view gallery (front / print detail / certificate) with mobile
  swipe + indicators; sticky ATC bar; benefit-led templated description in
  voice; Details & Fit / Materials & Care / Shipping & Returns accordions;
  size-guide modal; "Collect the set" cross-sell (province + overlooked mix).
- **P4 Conversion:** cart free-shipping progress to the real $75 threshold;
  cart upsell slot (one town not in cart); trust row in drawer; shop filters
  (province, tier, style, colorway) + sort + count; delayed email modal
  (once per session, honest 10% incentive); `newsletter_signup` and custom
  events through one analytics helper.
- **P5 SEO/GEO/a11y/perf:** OG/Twitter meta helper on all routes;
  Organization JSON-LD; llms.txt; focus-visible system; accordion/modal
  keyboard audit; alt-text audit; contrast fixes where sage fails on cream.

## Deviations from the prompt (framework/data realities)

- No photography exists — the generative SVG shirt system is the product
  imagery. "Image swap on hover" becomes a print-detail zoom; lookbook is
  art-directed type + SVG, not photo editorial. Flagged in NEEDS_INPUT.md.
- Reviews/UGC stay empty-state by design (trust rule). No review widget.
- Filtering is client-side over the local catalog (no Shopify collection
  filters until the real store swap).
- Low-stock/shipping-time indicators: not shown — no real inventory data
  exists yet (print-on-demand; the honest "printed to order, 5–10 days"
  line is used instead).

## Scores — after

_Updated in Phase 6._

## Changelog

_Updated per phase._
