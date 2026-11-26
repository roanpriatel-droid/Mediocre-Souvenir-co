/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  interface Env {
    /** Google Analytics 4 measurement ID (G-XXXXXXX). Unset: GA4 stays off. */
    PUBLIC_GA4_ID?: string;
    /** Meta pixel ID. Unset: the pixel stays off. */
    PUBLIC_META_PIXEL_ID?: string;
  }
}
