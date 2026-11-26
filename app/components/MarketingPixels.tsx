import {useEffect} from 'react';
import {useAnalytics} from '@shopify/hydrogen';

/**
 * Google Analytics 4 and the Meta pixel, switched on by setting
 * PUBLIC_GA4_ID (G-XXXXXXX) and PUBLIC_META_PIXEL_ID in the Oxygen
 * environment. Neither script loads until Shopify's customer-privacy check
 * says this visitor may be tracked, so the cookie banner is respected in the
 * regions that require one. With no IDs set, this renders nothing and loads
 * nothing.
 */
export function MarketingPixels({
  ga4Id,
  metaPixelId,
}: {
  ga4Id?: string | null;
  metaPixelId?: string | null;
}) {
  const {subscribe, register, canTrack} = useAnalytics();
  const {ready} = register('MarketingPixels');

  useEffect(() => {
    if (!ga4Id && !metaPixelId) {
      ready();
      return;
    }

    subscribe('page_viewed', (data) => {
      if (!canTrack()) return;
      if (ga4Id) {
        loadGa4(ga4Id);
        gtag('event', 'page_view', {page_location: data.url});
      }
      if (metaPixelId) {
        loadMeta(metaPixelId);
        fbq('track', 'PageView');
      }
    });

    subscribe('product_viewed', (data) => {
      if (!canTrack()) return;
      const product = data.products?.[0];
      if (!product) return;
      const price = Number(product.price ?? 0);
      if (ga4Id) {
        gtag('event', 'view_item', {
          currency: data.shop?.currency,
          value: price,
          items: [
            {
              item_id: product.id,
              item_name: product.title,
              item_variant: product.variantTitle,
              price,
            },
          ],
        });
      }
      if (metaPixelId) {
        fbq('track', 'ViewContent', {
          content_ids: [product.id],
          content_name: product.title,
          content_type: 'product',
          currency: data.shop?.currency,
          value: price,
        });
      }
    });

    subscribe('product_added_to_cart', (data) => {
      if (!canTrack()) return;
      const line = data.currentLine;
      if (!line) return;
      const price = Number(line.cost?.totalAmount?.amount ?? 0);
      const currency = line.cost?.totalAmount?.currencyCode;
      if (ga4Id) {
        gtag('event', 'add_to_cart', {
          currency,
          value: price,
          items: [
            {
              item_id: line.merchandise.product.id,
              item_name: line.merchandise.product.title,
              item_variant: line.merchandise.title,
              quantity: line.quantity,
            },
          ],
        });
      }
      if (metaPixelId) {
        fbq('track', 'AddToCart', {
          content_ids: [line.merchandise.product.id],
          content_type: 'product',
          currency,
          value: price,
        });
      }
    });

    ready();
    // Subscriptions are registered once per page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

type Fn = (...args: unknown[]) => void;
interface PixelWindow {
  dataLayer?: unknown[];
  gtag?: Fn;
  fbq?: Fn & {queue?: unknown[]; loaded?: boolean; version?: string};
  _fbq?: unknown;
}
const win = () => window as unknown as PixelWindow;

function gtag(...args: unknown[]) {
  win().gtag?.(...args);
}

function fbq(...args: unknown[]) {
  win().fbq?.(...args);
}

function addScript(src: string) {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function loadGa4(id: string) {
  const w = win();
  if (w.gtag) return;
  w.dataLayer = w.dataLayer ?? [];
  w.gtag = function gtagShim() {
    // GA4 expects the arguments object itself, not an array.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  gtag('js', new Date());
  // Page views are sent by hand on every route change.
  gtag('config', id, {send_page_view: false});
  addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
}

function loadMeta(id: string) {
  const w = win();
  if (w.fbq) return;
  // Meta's standard bootstrap: calls queue up until fbevents.js arrives and
  // takes over through callMethod.
  type Fbq = Fn & {
    callMethod?: Fn;
    queue: unknown[];
    push?: Fbq;
    loaded: boolean;
    version: string;
  };
  const shim = function fbqShim(...args: unknown[]) {
    if (shim.callMethod) shim.callMethod(...args);
    else shim.queue.push(args);
  } as Fbq;
  shim.queue = [];
  shim.push = shim;
  shim.loaded = true;
  shim.version = '2.0';
  w.fbq = shim;
  w._fbq = shim;
  addScript('https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', id);
}
