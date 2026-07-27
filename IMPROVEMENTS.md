# IMPROVEMENTS.md

Audit trail for the autonomous improvement loop. One entry per cycle,
including reverts and dead ends. Newest first.

**Standing constraint on every entry:** the live production site
(`mediocre-souvenir-co-704573631e1c6205a79c.o2.myshopify.dev`) is a private
Oxygen preview and returns `302 → accounts.shopify.com` to anything
unauthenticated, and the store's own domain returns `401`. So "crawl the live
site" is not available here. Audits are performed against the code, the route
graph, and the real product data captured from `/api/storefront-status`
(5 products: Toledo OH, Pittsburgh PA, Detroit MI, Gary IN, Rockford IL).
Anything I could not measure is recorded as unmeasured rather than estimated.

---

## Cycle 3 — 2026-07-27 — Lens: accessibility

### Findings, ranked

Ran a WCAG contrast audit over every colour pair the stylesheet actually uses
(computed, not eyeballed). Four pairs failed AA; three turned out not to be
real defects:

| pair | ratio | verdict |
| --- | --- | --- |
| `brick` on `cream` | **4.09** | real — needs 4.5 for normal text |
| `brick` on `cream-deep` | **3.84** | real — same, worse on card stock |
| `sage` on `cream` | 2.46 | not real — sole usage was `.guest-book-stars`, dead CSS from a component deleted earlier |
| `mustard` on `cream` | 1.86 | not real — mustard text only ever sits on navy (4.95, passes) or asphalt; the one cream-adjacent use is decorative stars marked `aria-hidden` |

Everything else passes comfortably: asphalt on cream 14.09, navy on cream 9.20,
cream on navy 9.20, asphalt on mustard 7.59.

Also found the last two lint errors in the repo: `EmailCaptureModal` had a JSX
`onClick` on `<dialog>` for backdrop dismissal — the same non-interactive
element defect I fixed in the gallery, which makes the behaviour mouse-only.

### Done

- **Primary buy button to 19px bold / 56px min-height.** Cream on brick is
  4.09:1, which misses AA-normal (4.5) but clears AA-large (3.0), and WCAG
  counts ≥18.66px bold as large text. Sizing the control up brings the store's
  most important button into compliance **without touching a locked brand
  colour** — and a bigger buy button is correct on its own merits.
- Modal backdrop dismissal moved to a native listener. **Repo lint is now 0
  errors** (down from 2), 6 warnings.
- Removed the dead sage rule.

### Blocked on you — brand-level, per the rails

`--msc-brick` (#B8503A) is the primary accent and measures **4.09:1 on cream**.
That is a pass for large text and a fail for normal text, so roughly 25 small
uses — `.msc-kicker` at 13px, `.rack-card-meta` at 11.5px, `.collection-card-more`
at 12.5px, `.cart-upsell-price` at 12px, the `.msc-button` base at 15px — sit
just under AA. The margin is small (4.09 vs 4.5) but it is systematic.

Three ways out, all brand-level, so I have not taken any of them:

1. **Darken brick for text only.** A `--msc-brick-ink` around #A8452F reaches
   4.5 and is visually near-indistinguishable at small sizes. Palette for fills
   and rules stays exactly as specified. Smallest change, keeps the accent.
2. **Reserve brick for large text and rules; use navy (9.20) for small text.**
   No new colour, but it visibly cools a lot of small type.
3. **Accept it** and document the store as AA-large. Defensible for a
   deliberately faded 1970s palette, but it is a real barrier for low-vision
   shoppers, and the small brick text includes prices and stock notices.

My recommendation is (1). Tell me which and I will do it in one pass.

### Verified

Build, typecheck clean. Lint 0 errors. Route crawl 69/69, 0 dead. Region parser
7/7, structured data 30/30. Contrast figures are computed from the hex values
in `app.css`, so they are exact, not estimated.

### Next

- Edge cases lens: long product titles in cards and the sticky bar, empty
  collections, OOS variants, a region with one product.
- Six duplicate CSS rules still outstanding.

---

## Cycle 2 — 2026-07-27 — Lens: performance

### Findings, ranked

1. **The whole catalogue was being swept on the blocking path of every primary
   page.** Because no region collection is published, `loadRegionStatus` falls
   through to `regionStatusFromProducts` → `loadDerivedCatalog` →
   `loadAllProducts`: up to **8 sequential** Storefront queries of 250 *full*
   product cards each. Every one of the four navigation pages — `/`, `/towns`,
   `/provinces`, `/collections` — `await`s that before returning a byte. The PDP
   paid the same price to render a four-item "More from" row, and so did every
   region and country rack.
2. **No memoisation.** Each helper re-entered the sweep independently, so a
   single request could pay for it more than once.
3. A failed sweep would have been cached as an empty result.

### Done

Split the derived catalogue into two tiers:

- **Index** (`handle` + `title` only) — everything region grouping and
  open/closed status actually need. Memoised per isolate for 5 minutes on top
  of the Storefront cache, and *not* memoised when it comes back empty.
- **Card hydration** — one batched `products(query: "handle:a OR …")` for only
  the products about to be rendered.

Measured against the real Toledo product node:

| | before | after |
| --- | --- | --- |
| per-product payload | 783 B | 61 B (12.8× smaller) |
| nav page, blocking | 7 queries, **1223 KB** | 7 queries, **95 KB** |
| PDP "More from" row | 7 queries, 1223 KB | 7 + 1 batched, 98 KB |
| region rack | 7 queries, 1223 KB | 7 + 1 batched, 126 KB |

**92% smaller on the blocking path**, and repeat pages inside a live isolate
pay nothing at all.

### Why

TTFB on the four pages that carry all the navigation is the single biggest
lever available in code right now, and it was being spent fetching image URLs,
price ranges and variant ids in order to answer a yes/no question about whether
a region has stock.

### Verified

Build, typecheck, lint (holds at baseline 8), route crawl 69/69 collections and
0 dead links, region-parser suite 7/7, structured-data suite 30/30. Payload
figures are computed from the real product shape, not estimated. **Wall-clock
TTFB is unmeasured** — the preview is gated, see the standing constraint.

### Next

- Accessibility lens: nothing has audited focus order, the cart drawer's focus
  trap, or colour contrast on the mustard-on-cream combinations.
- The `MAX_PAGES = 8` cap means a catalogue beyond 2,000 products silently
  stops being indexed. It warns now; it should paginate properly or move to
  collections once they are published.
- Six remaining duplicate CSS rules (carried from cycle 1).

---

## Cycle 1 — 2026-07-27 — Lens: conversion

### Findings, ranked

1. **The primary Add to Cart button had no styling at all.** `AddToCartButton`
   rendered a bare `<button type="submit">` with no `className`. Two ambient
   descendant selectors happened to reach it — `.sticky-atc button[type=submit]`
   and `.rack-cell button[type=submit]` — so the mobile bar and the quick-add
   looked right. The PDP buy column had no such rule, meaning **the single
   highest-intent control in the store rendered as an unstyled browser default
   button**. Highest impact by a wide margin.
2. **No feedback on add.** The control disabled itself while posting but the
   label never changed and nothing was announced. Shoppers who get no
   acknowledgement press again — duplicate lines, and a site that reads broken.
3. **Discount and gift-card fields sat above the checkout button** in the cart
   summary, both permanently open. Baymard's checkout research is explicit that
   an open, empty promo field makes shoppers without a code feel they are
   overpaying and sends a measurable share off-site coupon hunting. Our ladder
   discounts are automatic, so almost nobody needs the field.
4. **Duplicate CSS rules for one class, systemic.** Found `.rack-card-art-empty`
   defined twice. A wider audit found six more (`.footer-inner`, `.hero`,
   `.msc-section`, `.rack-card`, `.region-card`, `.skeleton-line`). This is the
   exact failure that silently crushed the nav bar last week.

### Done

- `AddToCartButton` takes a `className`, defaulting to `msc-button
  msc-button--buy`: full width, 52px min height (clears the 44px tap target
  with margin), 16px type. Every usage is now styled by intent instead of by
  whatever selector happens to reach it.
- Pending state (`Adding…`) and a 2.2s confirmation (`Added to your souvenirs`,
  mustard so it does not read as another red button to press), plus an
  `aria-live` status for screen readers, which cannot see a label change on a
  control that has lost focus to the cart drawer.
- Cart summary reordered: subtotal → free-shipping progress → ladder hint →
  **checkout** → codes folded behind a `Have a code?` disclosure with the note
  "Most of our discounts apply themselves."
- Collapsed the overlapping button selectors and removed the dead
  `.rack-card-art-empty` duplicate.

### Why

Finding 1 is not a judgement call — an unstyled default button on the PDP is
below the floor for any store. 2 and 3 are researched rather than assumed
([Baymard on checkout apply-buttons and promo
fields](https://baymard.com/blog/checkout-usability-apply-buttons)).

### Verified

Build, typecheck and lint clean (lint holds at its pre-existing baseline of 8
problems, 2 errors, both in `EmailCaptureModal`, untouched here). Route crawl
unchanged: 69/69 collections, 35 links, 0 dead. **Not verified in a browser** —
see the standing constraint.

### Next

- Performance: the derived-catalogue fallback sweeps up to 8 sequential
  Storefront pages of 250 products on region/country/all-souvenirs cold cache.
  That is the main shopping path and is likely the worst TTFB on the site.
- Visual polish: `.rack-card` carries `border-radius: 8px` while every other
  surface in the system is square-edged. BRAND.md calls for hard edges and "no
  modern polish", so this looks like drift rather than intent — worth
  confirming against the brand doc before changing.
- Code health: six remaining duplicate CSS rules.
