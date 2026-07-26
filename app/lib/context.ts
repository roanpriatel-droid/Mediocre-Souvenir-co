import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

// Define the additional context object
const additionalContext = {
  // Additional context for custom properties, CMS clients, 3P SDKs, etc.
  // These will be available as both context.propertyName and context.get(propertyContext)
  // Example of complex objects that could be added:
  // cms: await createCMSClient(env),
  // reviews: await createReviewsClient(env),
} as const;

// Automatically augment HydrogenAdditionalContext with the additional context type
type AdditionalContextType = typeof additionalContext;

declare global {
  interface HydrogenAdditionalContext extends AdditionalContextType {}

  // Augment HydrogenCustomCartFragment with the codegen'd cart fragment type so
  // that context.cart.get() and all cart mutations return the extended cart type.
  interface HydrogenCustomCartFragment extends CartApiQueryFragment {}
}

/**
 * Buyer market, and why this is not hardcoded.
 *
 * Every Storefront query in this app carries `@inContext(country: $country)`,
 * which scopes results to that market's *catalog*. The Hydrogen skeleton ships
 * `country: 'US'`, and with a Canada-first store whose products are published
 * to the Canadian market that returns **zero products for every collection** —
 * the collections resolve, they just come back empty. That is indistinguishable
 * from "we have not opened this region yet", so the whole site fell back to
 * placeholder artwork and "in due time" while 1,600 real products sat there.
 *
 * Oxygen sets `oxygen-buyer-country` from the edge location. We trust it when
 * present and default to CA — the store's home market — rather than US.
 */
function detectI18n(request: Request): {language: 'EN'; country: 'CA' | 'US'} {
  const header = request.headers.get('oxygen-buyer-country')?.toUpperCase();
  return {
    language: 'EN',
    country: header === 'US' ? 'US' : 'CA',
  };
}

/**
 * Creates Hydrogen context for React Router 7.9.x
 * Returns HydrogenRouterContextProvider with hybrid access patterns
 * */
export async function createHydrogenRouterContext(
  request: Request,
  env: Env,
  executionContext: ExecutionContext,
) {
  /**
   * Open a cache instance in the worker and a custom session instance.
   */
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const [cache, session] = await Promise.all([
    caches.open('hydrogen'),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  const hydrogenContext = createHydrogenContext(
    {
      env,
      request,
      cache,
      waitUntil,
      session,
      i18n: detectI18n(request),
      cart: {
        queryFragment: CART_QUERY_FRAGMENT,
      },
    },
    additionalContext,
  );

  return hydrogenContext;
}
