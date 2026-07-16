import {useFetcher} from 'react-router';

/** "Postcards from us." Email capture, posts to /api/subscribe. */
export function EmailCapture() {
  const fetcher = useFetcher<{ok: boolean; error?: string}>();
  const done = fetcher.data?.ok;

  return (
    <section className="email-capture">
      <div className="msc-kicker">Postcards from us</div>
      <h2>10% off your first souvenir.</h2>
      <p className="email-capture-sub">
        Occasional mail about new towns. Written the way a postcard should be:
        briefly.
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
          <input type="hidden" name="source" value="postcards-footer" />
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
