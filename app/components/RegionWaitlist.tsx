import {useEffect} from 'react';
import {Link, useFetcher} from 'react-router';
import {MSCMonogram} from '~/components/Brand';
import {trackEvent} from '~/lib/analytics';
import {waitlistPrompt} from '~/lib/region-copy';
import type {Region} from '~/lib/catalog';

/**
 * The waitlist state — what an unopened region collection actually is.
 *
 * Before the collections existed, a region we had not reached was a dead grey
 * tile that went nowhere. Now every one of the 62 unopened regions is a page
 * with a job: explain the queue in voice, and capture an email tagged with the
 * region so the print order is decided by demand rather than by us guessing.
 *
 * The signup posts to /api/subscribe with `region`, which is stored as a tag
 * on the subscriber (app/lib/submissions.ts).
 */
export function RegionWaitlist({region}: {region: Region}) {
  const fetcher = useFetcher<{ok: boolean; error?: string}>();
  const done = fetcher.data?.ok;

  useEffect(() => {
    if (done) {
      trackEvent('waitlist_signup', {region: region.slug});
    }
  }, [done, region.slug]);

  return (
    <section className="region-waitlist" aria-labelledby="waitlist-heading">
      <div className="region-waitlist-stamp" aria-hidden="true">
        <MSCMonogram size={56} />
      </div>

      <span className="msc-kicker">
        {region.status === 'next' ? 'Next on the route' : 'In due time'}
      </span>

      <h2 id="waitlist-heading">{waitlistPrompt(region)}</h2>

      <p className="region-waitlist-sub">
        No shirts here yet. We work one region at a time and the list decides
        the order — enough people from {region.name} and it stops being a
        someday.
      </p>

      {done ? (
        <p className="region-waitlist-done">
          noted. {region.name} moves up the list.
        </p>
      ) : (
        <fetcher.Form
          className="region-waitlist-form"
          method="post"
          action="/api/subscribe"
        >
          <label className="msc-label" htmlFor={`waitlist-${region.slug}`}>
            Email
          </label>
          <div className="region-waitlist-field">
            <input
              className="msc-input"
              id={`waitlist-${region.slug}`}
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
          <input type="hidden" name="region" value={region.slug} />
          <input type="hidden" name="regionName" value={region.name} />
          <input type="hidden" name="source" value={`waitlist:${region.slug}`} />
        </fetcher.Form>
      )}

      {fetcher.data?.error && !done ? (
        <p className="region-waitlist-fineprint">{fetcher.data.error}</p>
      ) : (
        <p className="region-waitlist-fineprint">
          One email, on the day it opens. Nothing else. We are not organised
          enough to spam you.
        </p>
      )}

      <div className="region-waitlist-actions">
        <Link className="msc-button msc-button--ghost" to="/collections/now-open">
          See what is open
        </Link>
        <Link
          className="msc-button msc-button--ghost"
          to={`/request-your-town?provinceState=${encodeURIComponent(region.name)}`}
        >
          Name your town
        </Link>
      </div>
    </section>
  );
}
