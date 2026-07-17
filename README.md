# Hydrogen template: Skeleton

Hydrogen is Shopify’s stack for headless commerce. Hydrogen is designed to dovetail with [React Router](https://reactrouter.com/), the modern multi-strategy router for React. This template contains a **minimal setup** of components, queries and tooling to get started with Hydrogen.

[Check out Hydrogen docs](https://shopify.dev/custom-storefronts/hydrogen)
[Get familiar with React Router](https://reactrouter.com/start/framework/routing)

## What's included

- React Router
- Hydrogen
- Oxygen
- Vite
- Shopify CLI
- ESLint
- Prettier
- GraphQL generator
- TypeScript and JavaScript flavors
- Minimal setup of components and routes

## Getting started

**Requirements:**

- Node.js version 22.x or 24.x

```bash
npm create @shopify/hydrogen@latest
```

## Building for production

```bash
npm run build
```

## Local development

```bash
npm run dev
```

## Setup for using Customer Account API (`/account` section)

Follow step 1 and 2 of <https://shopify.dev/docs/custom-storefronts/building-with-the-customer-account-api/hydrogen#step-1-set-up-a-public-domain-for-local-development>

## LAUNCH TODO (real store, before go-live)

- [ ] Link the real Shopify store: `npx shopify hydrogen link` + `npx shopify hydrogen env pull`
- [ ] Swap the purchasable stand-in: see “The swap point” in `app/lib/catalog/index.ts` — map each town to its Printify-synced product (Comfort Colors 1717, not Bella+Canvas)
- [ ] Configure the **automatic discount** in Shopify admin: 2+ items → 15%, 3+ → 20%, mix-and-match, no code. The collect-ladder UI promises this; checkout must honor it.
- [ ] **Shopify Markets**: CAD base market + US market at currency parity ($36 CAD / $36 USD — fixed price list, not auto-conversion). JSON-LD already advertises both offers.
- [ ] Free-shipping thresholds: $75 CAD (Canada) and $75 USD (US) — the announcement bar promises one clean "$75" in both markets
- [ ] Printify: route US orders to US print partners so the 5–10 day delivery window holds cross-border
- [ ] Swap `app/lib/submissions.ts` in-memory store for a durable backend (Klaviyo / Shopify customer tags / KV) — town requests and Postcards signups currently persist only in Oxygen logs
- [ ] Replace placeholder logo SVGs in `app/components/Brand.tsx` with the committed brand assets
- [ ] Verify Certificate of Souvenir facts (population, est. year, known-for) per town before printing
- [ ] Set real contact email + Instagram handles (placeholders: hello@mediocresouvenir.co, @mediocresouvenirco)
