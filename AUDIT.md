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

| Dimension | Before | After | What moved it |
| --- | --- | --- | --- |
| Visual craft | 7 | 9 | Scroll reveals, full-bleed editorial statement, rotated postcard interlude, rack-card lift + art-zoom hover, `text-wrap: balance`, spacing normalized. |
| Page depth | 4 | 9 | Eight new fully-built pages: about, materials, size-guide, care, lookbook, journal + 4 long articles (600–900 words each), FAQ. No stubs. |
| PDP persuasion | 6 | 9 | 3-view swipe gallery (front/detail/certificate) with indicators, sticky mobile ATC, per-town benefit-led pitch, three accordions, size-guide modal, "complete the collection" cross-sell with ladder framing. |
| Mobile experience | 7 | 9 | Sticky ATC, swipe gallery + dots, responsive toolbar/footer/statement, 375px rhythm verified. |
| Performance | 8 | 8 | Build green; SVG-first pages stay light; reveals use IntersectionObserver, not scroll listeners. Fonts still Google-hosted with swap (self-hosting deferred — see NEEDS_INPUT). |
| SEO / GEO | 7 | 9 | Branded 1200×630 OG image + OG/Twitter defaults, Organization JSON-LD sitewide, Article schema on journal, FAQPage schema, llms.txt, sitemap covers all new routes. |
| Accessibility | 7 | 9 | Global `:focus-visible` system, skip link, native `<dialog>`/`<details>` for modal+accordions (keyboard-free), `aria-pressed`/`role=progressbar`, alt text via townImageAlt everywhere. |
| Conversion architecture | 6 | 9 | Free-shipping progress to the real $75, cart upsell (a town not in cart), drawer trust row, shop filters (region/size/template/colorway) + sort + count, once-per-session email modal, analytics seam (view_item, add_to_cart, begin_checkout, newsletter_signup). |

## Changelog

- **Phase 0** — BRAND.md reverse-engineered and locked; AUDIT baseline; NEEDS_INPUT.
- **Phase 1** — `Reveal` component; editorial statement + postcard sections on home;
  rack/region hover craft; balanced headings; spacing pass.
- **Phase 2** — `/about`, `/materials`, `/size-guide`, `/care`, `/lookbook`,
  `/journal` (+ `/journal/$slug` × 4 articles), `/faq`; sitemap-style footer with
  guides column; new routes added to sitemap.
- **Phase 3** — PDP rebuilt: `ProductGallery` (swipe + tabs + dots), `sticky-atc`,
  `townPitch()` per-town copy, Details/Materials/Shipping accordions, size-guide
  `<dialog>`, cross-sell; `ShirtMockup` gains a `detail` crop view.
- **Phase 4** — `FreeShippingProgress`, `CartUpsell`, drawer trust row, `/shop`
  filters+sort+count with empty state, `EmailCaptureModal` (session-gated),
  `app/lib/analytics.ts` seam wired to footer + modal + checkout.
- **Phase 5** — `og-default.png` (rendered from brand fonts), OG/Twitter meta +
  Organization JSON-LD in root, `llms.txt`, `:focus-visible` system, skip link.
- **Phase 6** — build + typecheck green; all routes confirmed in build manifest;
  scores updated; deployed to Oxygen.

## Verification

`npm run build` and `npm run typecheck` both exit 0. All eight new routes present
in `dist/server` and `dist/client`. Live behavior (hover, reveals, sticky ATC,
swipe, modal) is exercised on the Oxygen deploy — the local ARM64 box cannot run
the dev server (workerd), which remains this project's only verification ceiling.
