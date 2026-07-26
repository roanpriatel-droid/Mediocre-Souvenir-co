import {useEffect} from 'react';
import {useFetcher} from 'react-router';
import {trackEvent} from '~/lib/analytics';

/**
 * "Postcards from us." Email capture, posts to /api/subscribe.
 * `source` records where the signup came from — it reaches both the analytics
 * event and the stored subscriber, so the two never disagree.
 */
export function EmailCapture({source = 'postcards-footer'}: {source?: string}) {
  const fetcher = useFetcher<{ok: boolean; error?: string}>();
  const done = fetcher.data?.ok;

  useEffect(() => {
    if (done) {
      trackEvent('newsletter_signup', {source});
      try {
        localStorage.setItem('msc-subscribed', '1');
      } catch {
        // fine
      }
    }
  }, [done, source]);

  return (
    <section className="email-capture">
      {/* "Postcards from us" is the fixed brand string (BRAND.md); the
          headline carries the newer line. */}
      <div className="msc-kicker">Postcards from us</div>
      <h2>Postcards from nowhere, occasionally.</h2>
      <p className="email-capture-sub">
        Mail when a region opens or a town lands. Written the way a postcard
        should be: briefly, and from somewhere you have never been.
      </p>
      {done ? (
        <p className="email-capture-done">
          noted. we&rsquo;ll write when there&rsquo;s something to say.
        </p>
      ) : (
        <fetcher.Form
          className="email-capture-form"
          method="post"
          action="/api/subscribe"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="you@somewhere-unremarkable.ca"
            aria-label="Email address"
          />
          <input type="hidden" name="source" value={source} />
          <button type="submit" disabled={fetcher.state !== 'idle'}>
            {fetcher.state === 'idle' ? 'Sign me up' : 'One sec…'}
          </button>
        </fetcher.Form>
      )}
      {fetcher.data?.error && !done ? (
        <p className="email-capture-fineprint">{fetcher.data.error}</p>
      ) : (
        <p className="email-capture-fineprint">
          Unsubscribe anytime. We understand.
        </p>
      )}
    </section>
  );
}
