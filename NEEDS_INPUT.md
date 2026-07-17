# Needs real-world input

Things the site is honest about instead of faking. Provide these and the
placeholders/omissions resolve.

1. **Photography** — flat-lay/model shots per colorway. Until then the
   generative SVG mockups are the product imagery everywhere (grid, PDP,
   lookbook, OG images use type-based cards).
2. **Final logo SVGs** — `app/components/Brand.tsx` placeholders are drawn
   to the brand doc but should be replaced by the committed assets.
3. **Comfort Colors 1717 measurements** — size-guide table uses CC's
   published spec (verify against your Printify provider before launch).
4. **Shipping reality** — $75 free-shipping thresholds and "5–10 business
   days" printed-to-order window are the promises in the UI; confirm with
   Printify routing before launch.
5. **Real review/UGC content** — guest book and Spotted in the Wild are
   structurally ready, honestly empty.
6. **Contact email + Instagram** — placeholders: hello@mediocresouvenir.co,
   @mediocresouvenirco.
7. **Town facts** — populations / est. years / known-for lines are
   researched approximations; verify per town before printing certificates.
8. **Email marketing backend** — submissions store is in-memory + Oxygen
   logs (see `app/lib/submissions.ts`); wire Klaviyo/Shopify before relying
   on the 10% welcome offer.
9. **Analytics destination** — `app/lib/analytics.ts` pushes events to
   `window.dataLayer` (view_item, add_to_cart, begin_checkout,
   newsletter_signup). Connect GTM / a pixel to consume them.
10. **Self-hosted fonts (perf)** — Alfa Slab One / Archivo Narrow /
    Permanent Marker still load from Google Fonts with `display=swap`.
    Self-host the WOFF2s to shave the third-party connection off LCP.
11. **Per-article OG images** — journal + product pages currently share the
    default OG card. Bespoke per-town/per-article cards would lift social
    click-through (the OG renderer in git history can be templated).
