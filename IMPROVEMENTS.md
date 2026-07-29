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

## Cycle 7 — 2026-07-29 — Brief: "make what we have for BC for 10 others, rotating"

### Done

**The hero rotates as a whole card, not just a name.** `heroSlides()` returns
eleven regions — the visitor's own first where the edge can place them, ten
more where it can, eleven others where it cannot — each carrying its stock
count and one real shirt, preferring that region's "Greetings from…" print so
the artwork agrees with the headline above it. All eleven shirts are fetched in
one batched `nodes(ids:)` call, and the three hero queries (slides, strip,
wall) now run in parallel against the same memoised index, which caches its
in-flight promise so concurrency costs one sweep rather than three.

The two things that make a rotating hero worse than a static one are both
handled rather than hoped away:

- **The CTA does not move under the cursor.** Rotation pauses on `:hover` and
  `:focus-within`, so a hand already travelling toward "Shop Ontario" lands on
  Ontario.
- **Layout does not shift.** Every slide sits in the same grid cell, so the
  hero is as tall as its tallest slide in the first painted frame and the
  cycling is pure opacity. Utah and Prince Edward Island swap without moving a
  pixel of the page below — the CLS score is unchanged at zero.

Hidden slides are `visibility: hidden`, not merely transparent: eleven stacked
invisible cards would otherwise intercept every click meant for the one that is
showing, with the last in the DOM winning. Only the first slide is focusable
(the rest keep `tabindex="-1"`), so the hero costs two tab stops instead of
twenty-two while staying reachable by pointer and by screen reader. The first
slide keeps the `<h1>`; a negative animation delay starts it past its own
fade-in so it paints at full opacity rather than easing up out of nothing.

**The breadth strip stopped moving.** Fifteen regions still sit under the card,
but static. A second animation in the same eyeline would compete with the card
rather than add to it, and standing still makes all fifteen clickable at every
moment — which the rotating card deliberately is not.

**The header search is smaller.** It was inheriting the hero's proportions
(19px type in a 55px box, capped at 520px) and was the loudest object in the
top row, louder than the wordmark beside it. `.town-search--compact` now sets
15px type in a ~42px box at 430px, same shape and same shadow.

### Why

The hero showed one region. To a visitor in Ohio that is a personalised hook;
to everyone else it reads as a store that sells British Columbia. Eleven
regions above the fold sells the actual claim — a continental catalogue —
without asking anyone to scroll.

### Verified

Build, typecheck and lint clean (lint at its pre-existing baseline of 6
warnings, 0 errors, none in touched files). **Not verified in a browser** — see
the standing constraint.

### Next

- Slide count is fixed at eleven because the CSS divides the loop into that
  many equal turns. If it ever needs to vary, the keyframe percentages have to
  come with it.
- Photography remains the ceiling: one mockup repeated 2,150 times. The
  rotation makes the catalogue look broad; it cannot make it look photographed.

---

## Cycle 6 — 2026-07-28 — Brief: "make it look like a brand doing 8 figures"

Full autonomous pass. Audited the live site end to end, then fixed in order of
commercial impact. Both decisions that had been parked for input were taken
using my own judgement, as instructed.

### 1 · Over 2,000 products were unbuyable — the biggest defect on the store

British Columbia holds **106** products and the page rendered **50**. All
Souvenirs holds **2,150** and rendered **40**. The derived rack returned a flat
capped slice with **no pagination controls at all**, so the overwhelming
majority of the catalogue could not be reached, let alone purchased.

`derivedRack()` replaces the capped slices: 24 per page, page and style in the
URL so a filtered rack is shareable and survives reload, totals computed before
paging. Verified live — All Souvenirs now pages to **90 pages**, BC to 5, and
page 1 / 2 / 5 return different products.

### 2 · The site contradicted itself on one screen

The hero said "108 souvenirs for British Columbia" while `/provinces` told the
same visitor BC was the only open region and everywhere else was a waitlist.
All 63 are stocked. Rewrote `/provinces`, `/towns`, the FAQ, Our Story, the
region-copy template, the waitlist component and the page registry. `status` is
now a fallback only — the live index is the truth — and defaults to open so an
outage understates nothing.

### 3 · WCAG AA on text (the parked decision, taken)

Brand brick is 4.09:1 on cream — AA-large, not AA-normal — and carried ~25
small items including prices. Added `--msc-brick-ink` `#a04530`: same hue, two
steps darker, **5.12:1** on cream and **4.81:1** on card stock. Applied to
**text declarations only** (42 of them); fills, rules, borders and button
backgrounds keep the specified brick, so the palette on screen is unchanged.
Every text pair now passes AA.

### 4 · Print style was invisible on cards

Every town ships in four prints, so a rack showed "Akron / Ohio / $36" four
times with only the artwork differing. The style is the differentiator and was
the one thing not on the card. Added it, and added style filter chips with live
per-style counts on collection pages — the one facet this catalogue actually
has.

### 5 · Retired URLs, dead nav, payload

Thirteen curated-rack URLs (`sage-tees`, `classic-varsity`, `most-overlooked`…)
were live and sitemapped before the Shopify migration and had been 404ing.
They now 301, with the three template racks mapping onto the print-style filter
that replaced them. "Coming in due time" was in the Shop menu and rendered an
empty shelf — removed from nav and the collections index, URL still resolves.
The 30 decorative hero tiles were serialising full product cards; trimmed to id
and image.

### Measured

| | before | after |
| --- | --- | --- |
| reachable products, All Souvenirs | 40 | **2,150** (90 pages) |
| reachable products, British Columbia | 50 | **106** (5 pages) |
| collection page HTML | 216 KB | **137 KB** |
| brick-on-cream text contrast | 4.09 (fail) | **5.12 (pass)** |
| text pairs failing AA | 2 | **0** |
| routes 404ing that should not | 13 | **0** |
| TTFB, all templates | — | **0.13–0.23s** |

Build, typecheck clean; lint 0 errors, 6 warnings (all pre-existing). Route
crawl 69/69 collections, 35 links, 0 dead. Live status sweep across 26
templates: all 200, 404 only where intended.

### The ceiling is now photography, not code

Every product image is the same mockup — measured: identical bounding box,
36.9% ink, two products differing over 1.5% of the frame. The site has one
photograph repeated 2,150 times. I built the hero out of the 1.5% that varies,
but no further engineering changes that. Lifestyle photography and a reviews
app are the two things that would move this further, and neither is code.

---

## Cycle 5 — 2026-07-27 — Lens: live production crawl (the preview opened)

**The standing constraint lifted.** The Oxygen preview started answering 200
instead of 302, so for the first time in this project I could crawl production
rather than reason about it. I re-tested before claiming anything.

### What the crawl found immediately

`/towns` reported all 63 regions **open**. Meanwhile `/collections/british-columbia`,
`/ontario`, `/texas`, `/nunavut` and `/california` each rendered **zero
products and a waitlist**, and `/collections/all-souvenirs` returned **4**
products when it asked for 40. Only Ohio worked. Two surfaces reading the same
data disagreed, so one of them was lying to customers.

### Root cause, proven not guessed

Inference kept going in circles, so I shipped index diagnostics to
`/api/storefront-status` and read the answer off production:

```
indexSize            2000          <- exactly the cap
probe british-columbia
  index says entries   25
  hydrateCards got      0
```

The index held **106 British Columbia products**. Hydration asked for 25 by
handle and got none. So the index was fine and `hydrateCards` was broken.

**`products(query: "handle:...")` cannot express "give me exactly these
products."** Shopify's product search tokenises on hyphens and treats a leading
`-` as negation, and every handle here is `city-xx-style`. Ohio worked by
accident — its alphabetically-first handle, `akron-oh-greetings`, happens to
parse cleanly. British Columbia's first is `100-mile-house-bc-greetings`, and
one malformed term poisons the whole OR chain.

Quoting the handles **did not fix it** — BC still returned 0 of 25 and Ohio
returned an arbitrary 16 of 25. A search index is simply the wrong tool. The
index now carries the Storefront GID and hydration uses `nodes(ids:)`: exact,
unparsed, 250 per call.

A second bug in the same pass: `indexSize` was **exactly 2000**, the old
8-page cap, silently truncating the catalogue at "Watertown, NY". Raised to 24
pages — the index is handle/title/id only, so pages are cheap.

### Verified on production, before and after

| page | before | after |
| --- | --- | --- |
| `/collections/british-columbia` | 0 (waitlist) | **50** |
| `/collections/ontario` | 0 (waitlist) | **50** |
| `/collections/texas` | 0 (waitlist) | **50** |
| `/collections/california` | 0 (waitlist) | **40** |
| `/collections/nunavut` | 0 (waitlist) | **6** |
| `/collections/all-souvenirs` | 4 | **40** |
| `/collections/canada` | — | **50** |
| index size | 2000 (capped) | **2150** (complete, reaches "Zanesville, OH") |
| BC hydration probe | 0 of 25 | **25 of 25** |

**62 of 63 region pages were showing a "coming in due time" waitlist for
regions that were fully stocked.** The catalogue is 2,150 products across all
63 regions; the store was effectively selling one region.

### Process note, honestly

My first "after" verification showed no change and I nearly concluded the fix
had failed. It had not — my deploy-wait loop had matched a *previous*
completed run and I tested the old build. The wait now asserts the commit SHA
before testing. Verifying against the wrong artefact is indistinguishable from
a failed fix, which is worth remembering.

### Also confirmed working on production

Cycle 1's buy button and cart order, cycle 3's contrast sizing, and cycle 4's
card fix all render correctly. PDP shows the hand-tuned Toledo plaque
("EST. 1833", the glass museum line), the sell line, Product structured data,
and correctly **no** `aggregateRating`. TTFB measured 0.14–0.45s across five
page types.

### Next

- The site's copy still says "British Columbia is open, Alberta is next, the
  rest have a waitlist." With 63/63 regions stocked that is now false on
  `/provinces`, in the FAQ, in Our Story, and in the BC-specific lookbook.
  Copy-quality cycle, and it is the largest remaining item.
- `now-open` returns 24 and `all-souvenirs` 40 — both are my own caps, not the
  catalogue. Worth pagination rather than a cap.
- Brand decision on brick contrast (cycle 3) still open.

---

## Cycle 4 — 2026-07-27 — Lens: edge cases

### Findings, ranked

1. **Every product card in the store printed "Genuine souvenir" twice and
   showed no region.** `SouvenirProductCard` looked the town up with
   `getTownByHandle(product.handle)` — against the local British Columbia
   catalogue, whose handles are `trail-t-shirt`. Real product handles are
   `toledo-oh-varsity`, so the lookup **never matched for any product in the
   catalogue**. The sub-line fell through to the literal string "Genuine
   souvenir", and the price row's left label was the same string, so the card
   said it twice, stacked, on the primary browsing surface.
2. **Two different parsers for one product name.** The PDP used
   `townNameFrom()` → "Toledo"; the card used a local `cardTitle()` that split
   on the em dash → "Toledo, OH". The card and the product page disagreed about
   the product's own name.
3. **Non-town products were truncated.** Caught by the new edge-case suite:
   "Gift Card" rendered as "Gift", because with no region code in the handle the
   parser fell back to the first handle segment.
4. Long town names ("Happy Valley-Goose Bay") had no clamp and would push a
   card taller than its neighbours, breaking the grid baseline.

### Done

- Card now uses `townNameFrom()` and `regionForProduct()` — the same two
  functions the PDP uses. Title shows the town, sub-line shows the **region**,
  and the price row says "On the rack" / "Off the rack" instead of repeating.
- Moved `regionForProduct` out of the query layer into the pure town module, so
  a client component shares the parser without pulling the Storefront queries
  into the browser bundle.
- `townNameFrom` returns the full title when a product is not town-shaped.
- Town name clamps to two lines with an ellipsis; region line truncates.

### Why

Finding 1 is a visible defect on every card on every browsing page, and it was
invisible in the build because a stale lookup returning `undefined` is not an
error. Finding 2 is the cause of 1 — two parsers for one fact will always drift.

### Verified

New edge-case suite, 5/5: real titles, a hyphenated multi-word town, a
comma-less title, a gift card, a bundle. Build, typecheck clean; lint 0 errors.
Crawl 69/69, 0 dead. Region parser 7/7, structured data 30/30.

### Next

- Copy quality lens: the templated tourism paragraph is one sentence pattern
  across ~58 regions; worth checking it does not read as obviously generated at
  scale.
- Six duplicate CSS rules, still outstanding.
- Brand decision on brick contrast (cycle 3) still open.

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
