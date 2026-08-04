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

### Two things that are not what they look like

1. **Checkout uses a mock.shop stand-in.** Every town tee checks out against
   one mock variant with the real product carried in cart line attributes
   (Town / Size / Colorway). See *“The swap point”* in
   `app/lib/catalog/index.ts`.
2. **Policies are local-first.** `app/lib/policies.ts` is the source of truth
   because mock.shop serves no policy documents. `/policies/:handle` prefers
   the Shopify copy automatically once a real store has it filled in.

## Setup for the Customer Account API (`/account`)

Follow steps 1 and 2 of the
[Hydrogen customer account guide](https://shopify.dev/docs/custom-storefronts/building-with-the-customer-account-api/hydrogen#step-1-set-up-a-public-domain-for-local-development).

## LAUNCH TODO (real store, before go-live)

- [ ] Link the real Shopify store: `npx shopify hydrogen link` + `npx shopify hydrogen env pull`
- [ ] Swap the purchasable stand-in: see “The swap point” in `app/lib/catalog/index.ts` — map each town to its Printify-synced product (Comfort Colors 1717, not Bella+Canvas)
- [ ] **Have the policies reviewed by a lawyer.** `app/lib/policies.ts` is written to match how the store actually operates, but it is not legal advice. Paste the reviewed copy into Shopify admin → Settings → Policies and the routes pick it up automatically.
- [ ] Configure the **automatic discount** in Shopify admin: 2+ items → 15%, 3+ → 20%, mix-and-match, no code. The collect-ladder UI promises this; checkout must honor it.
- [ ] **Shopify Markets**: CAD base market + US market at currency parity ($36 CAD / $36 USD — fixed price list, not auto-conversion). JSON-LD already advertises both offers.
- [ ] Free-shipping thresholds: $75 CAD (Canada) and $75 USD (US) — the announcement bar promises one clean "$75" in both markets
- [ ] Printify: route US orders to US print partners so the 5–10 day delivery window holds cross-border
- [ ] Swap `app/lib/submissions.ts` in-memory store for a durable backend (Klaviyo / Shopify customer tags / KV) — town requests, Postcards signups, and contact messages currently persist only in Oxygen logs
- [ ] Replace placeholder logo SVGs in `app/components/Brand.tsx` with the committed brand assets
- [ ] Verify Certificate of Souvenir facts (population, est. year, known-for) per town before printing
- [ ] Set real Instagram handle (placeholder: @mediocresouvenirco). Contact email is
      mediocresouvenir@stratosync.solutions — live, Microsoft 365 MX.
