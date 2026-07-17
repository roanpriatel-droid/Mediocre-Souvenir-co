/**
 * One thin seam for custom analytics events. Hydrogen's <Analytics.*>
 * components already publish product_viewed / cart events; this covers the
 * rest (newsletter_signup, begin_checkout, …) via a dataLayer push that any
 * tag manager or pixel can subscribe to. Swap or extend here, nowhere else.
 */
export function trackEvent(
  event:
    | 'newsletter_signup'
    | 'begin_checkout'
    | 'town_request_submitted'
    | 'email_modal_shown'
    | 'email_modal_dismissed',
  payload: Record<string, unknown> = {},
): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as {dataLayer?: Record<string, unknown>[]};
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({event, ...payload});
}
