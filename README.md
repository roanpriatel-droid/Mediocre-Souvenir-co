# Mediocre Souvenir Co.

Shopify Hydrogen storefront for **Mediocre Souvenir Co.** — genuine
faux-vintage souvenir t-shirts for overlooked towns across Canada and the US.

Read [`BRAND.md`](./BRAND.md) before changing anything visual. It is the law,
and every design decision passes one test: *would a sincere 1978 gift shop in
this town have done it this way?*

- [`AUDIT.md`](./AUDIT.md) — scored review of the build
- [`NEEDS_INPUT.md`](./NEEDS_INPUT.md) — what the site is honestly missing

## Stack

React Router 7 · Hydrogen · Oxygen · Vite · TypeScript. Node 22 or 24.

## Commands

```bash
npm run build       # production build — the check that matters here
npm run typecheck   # react-router typegen && tsc --noEmit
npm run lint
npm run dev         # see the warning below
```

> **`npm run dev` and `npm run preview` do not run on the ARM64 dev box.**
> workerd cannot start under its 39-bit virtual address space. Verify locally
> with `npm run build` + `npm run typecheck`; the live preview path is Oxygen,
> which auto-deploys on push to `main` (see `.github/workflows`). For
> interactive local work, use Codespaces or any x86 machine.

## Architecture

The catalog is the product. Every SKU is a real town, and the whole
navigation, SEO, and merchandising layer is derived from town records — so a
town added to a data file becomes a complete, SEO-ready landing page with no
manual work.

| Path | What lives there |
| --- | --- |
| `app/lib/catalog/` | Towns, regions, curated collections, the domain model |
| `app/lib/catalog/data.*.ts` | One data file per region (BC today) |
| `app/lib/seo.ts` | Title/description/JSON-LD templates keyed off town fields |
| `app/lib/policies.ts` | Store policies, locally authored |
| `app/lib/site-pages.ts` | Every non-catalog page — feeds search *and* the sitemap |
| `app/lib/journal.ts` | The Journal — editorial, cross-linked into the catalog |
| `app/lib/submissions.ts` | Pluggable store for waitlist, signups, and messages |
| `app/lib/analytics.ts` | Event seam — pushes to `window.dataLayer` |

### Routes

- **Catalog** — `/shop` (filters + sort), `/products/:handle`,
  `/provinces/:slug`, `/states/:slug`, `/new-arrivals`
- **Collections** — `/collections` and `/collections/:handle`, derived from
  catalog fields (template, colorway, town size, most overlooked).
  `/collections/all` → `/shop`
- **Search** — `/search`, server-side over the local catalog: towns, regions,
  collections, guides, and journal articles
- **Editorial** — `/about`, `/lookbook`, `/journal`, `/journal/:slug`
- **Guides** — `/materials`, `/size-guide`, `/care`, `/faq`
- **Fine print** — `/policies` and `/policies/:handle` (shipping, refund,
  privacy, terms, accessibility)
- **Conversion** — `/request-your-town`, `/contact`, `/cart`, `/account/*`

Shopify's conventional URL shapes stay routable and redirect to their local
equivalent: `/blogs/*` → `/journal`, `/pages/:handle` → the real page,
`/collections/all` → `/shop`.

### How the store is wired

- **Products** come from Printify (shop "Mediocre souvenir co", Comfort Colors
  1717, printed by Dimona Tee in Dania Beach, FL) and are published into
  Shopify by Printify. Title format `Town, ST — Style` is load-bearing: the
  handle (`town-st-style`) and the site's region and style parsing both come
  from it. Printify owns variants, images and cost; Shopify owns vendor, SEO,
  alt text, customs codes and channel publishing.
- **Tags** drive every collection: `region:<slug>`, `country:ca|us`,
  `style:<varsity|greetings|i-heart|tour>`, plus `Souvenir Tee`.
- **Collections**: 72 smart collections, all tag rules: one per region
  (handle = `Region.slug`), `all-souvenirs`, `now-open`, `new-arrivals`,
  `canada`, `united-states`, and the four print styles. Each carries a
  `custom.product_count` metafield the region grid reads.
- **Policies**: shipping, refund, terms and contact are pushed from
  `app/lib/policies.ts`; `/policies/:handle` prefers the Shopify copy. The
  privacy policy is Shopify's automatically-managed one.
- **Submissions**: contact messages, town requests and Postcards signups are
  written as metaobjects (`msc_contact_message`, `msc_town_request`,
  `msc_subscriber`); signups also become email-subscribed customers, tagged
  `postcards`, `source:*`, `region:*`. See `app/lib/submissions.ts`.

## Store configuration (live)

| Area | Setting |
| --- | --- |
| Price | $36 on every variant |
| Collect ladder | Automatic: "Collect two: 15% off" (2+), "Collect three or more: 20% off" (3+); best one applies, no stacking |
| Welcome offer | Code `POSTCARDS10`: 10%, once per customer, does not stack with the ladder |
| Shipping, CA & US | Market shipping option, USD: $6.95, free at $60+ |
| Shipping, rest of world | Market shipping option, USD, value tiers that map to shirt count: $10 for one, +$4 per additional. Tiers assume every shirt is $36; revisit them if prices change. |
| Shipping profiles | Checkout reads the markets' shipping options, not delivery profiles. Printify publishes with its shipping template off, and any Printify profile is removed so its pass-through rates never reach checkout. |
| Markets | Canada, United States, International (235 countries) |

## Oxygen environment variables

Set in Shopify admin → Hydrogen → the storefront → Storefront settings →
Environment variables:

- `SHOPIFY_ADMIN_CLIENT_ID`, `SHOPIFY_ADMIN_CLIENT_SECRET`: the Dev
  Dashboard app's credentials. Without them, form submissions are only logged.
  The app mints and refreshes its own 24-hour Admin token.

## Still needs a person

- [ ] **Store currency → USD** (Settings → General → Store defaults). The store
      was created in CAD; every price on the site says USD. Only possible
      before the first order.
- [ ] Payments, domain, and order-notification email copy (admin-only).
- [ ] Shopify Email → Automations → "Welcome new subscriber": include
      `POSTCARDS10`. The signup modal promises it arrives with the first email.
- [ ] Have the policies reviewed by a lawyer.
- [ ] Store contact email in Settings → General is still a personal address;
      the site's support address is `mediocresouvenir@stratosync.solutions`.
- [ ] Replace placeholder logo SVGs in `app/components/Brand.tsx`.
