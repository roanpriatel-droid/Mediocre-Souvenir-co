import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      // Falling back to the store domain matters: with this unset, Hydrogen's
      // Analytics.Provider throws "consent.checkoutDomain is required" on
      // every page, which was disabling customer-privacy consent and all
      // Shopify analytics site-wide.
      checkoutDomain:
        context.env.PUBLIC_CHECKOUT_DOMAIN ?? context.env.PUBLIC_STORE_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    /*
     * Without an explicit img-src, images fall back to default-src — which is
     * 'self' plus the Shopify CDNs and does NOT include `data:`. The paper
     * grain behind every surface on this site (--worn-noise) is an inline SVG
     * data URI, so the brand's core texture was being blocked by our own
     * policy on every page, silently, since launch.
     */
    imgSrc: [
      "'self'",
      'data:',
      'https://cdn.shopify.com',
      'https://shopify.com',
    ],
    // Brand fonts (Alfa Slab One / Archivo Narrow / Permanent Marker) load from Google Fonts
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://cdn.shopify.com',
      'https://fonts.googleapis.com',
    ],
    fontSrc: ["'self'", 'https://cdn.shopify.com', 'https://fonts.gstatic.com'],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
