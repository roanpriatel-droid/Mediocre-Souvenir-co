import {useEffect} from 'react';
import {useFetcher} from 'react-router';
import {trackEvent} from '~/lib/analytics';

/**
 * Notify-me for a sold-out product.
 *
 * Posts through the same submission store as every other capture, tagged with
 * the product handle and its region, so "back in stock" can be sent to exactly
 * the people who wanted that town rather than the whole list.
 */
export function NotifyMe({
  handle,
  town,
  regionSlug,
  regionName,
}: {
  handle: string;
  town: string;
  regionSlug?: string;
  regionName?: string;
}) {
  const fetcher = useFetcher<{ok: boolean; error?: string}>();
  const done = fetcher.data?.ok;

  useEffect(() => {
    if (done) trackEvent('waitlist_signup', {product: handle, town});
  }, [done, handle, town]);

  if (done) {
    return (
      <p className="pdp-notify-done">
        Noted. We will write when {town} is back, and not before.
      </p>
    );
  }

  return (
    <fetcher.Form className="pdp-notify" method="post" action="/api/subscribe">
      <label className="msc-label" htmlFor={`notify-${handle}`}>
        Tell me when {town} is back
      </label>
      <div className="pdp-notify-field">
        <input
          className="msc-input"
          id={`notify-${handle}`}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@somewhere-unremarkable.com"
        />
        <button
          className="msc-button"
          type="submit"
          disabled={fetcher.state !== 'idle'}
        >
          {fetcher.state === 'idle' ? 'Notify me' : 'One sec…'}
        </button>
      </div>
      <input type="hidden" name="source" value={`back-in-stock:${handle}`} />
      {regionSlug && <input type="hidden" name="region" value={regionSlug} />}
      {regionName && <input type="hidden" name="regionName" value={regionName} />}
      {fetcher.data?.error && (
        <p className="pdp-notify-error" role="alert">
          {fetcher.data.error}
        </p>
      )}
    </fetcher.Form>
  );
}
