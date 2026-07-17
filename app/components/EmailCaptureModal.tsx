import {useEffect, useRef} from 'react';
import {useFetcher} from 'react-router';
import {trackEvent} from '~/lib/analytics';
import {MSCMonogram} from '~/components/Brand';

const PROMPTED_KEY = 'msc-postcards-prompted';
const SUBSCRIBED_KEY = 'msc-subscribed';
const DELAY_MS = 16_000;

/**
 * Delayed email capture — fires once per session, never for subscribers,
 * easy to dismiss (Escape, backdrop, button — native <dialog> handles the
 * keyboard). Incentive is the real 10% welcome offer.
 */
export function EmailCaptureModal() {
  const ref = useRef<HTMLDialogElement>(null);
  const fetcher = useFetcher<{ok: boolean; error?: string}>();
  const done = fetcher.data?.ok;

  useEffect(() => {
    try {
      if (
        sessionStorage.getItem(PROMPTED_KEY) ||
        localStorage.getItem(SUBSCRIBED_KEY)
      ) {
        return;
      }
    } catch {
      return; // storage unavailable — never nag
    }
    const timer = setTimeout(() => {
      sessionStorage.setItem(PROMPTED_KEY, '1');
      ref.current?.showModal();
      trackEvent('email_modal_shown');
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (done) {
      try {
        localStorage.setItem(SUBSCRIBED_KEY, '1');
      } catch {
        // fine
      }
      trackEvent('newsletter_signup', {source: 'modal'});
      const t = setTimeout(() => ref.current?.close(), 2200);
      return () => clearTimeout(t);
    }
  }, [done]);

  const dismiss = () => {
    trackEvent('email_modal_dismissed');
    ref.current?.close();
  };

  return (
    <dialog
      className="msc-modal email-modal"
      ref={ref}
      aria-label="Postcards from us"
      onClick={(e) => {
        if (e.target === ref.current) dismiss(); // backdrop click
      }}
    >
      <div className="email-modal-inner">
        <MSCMonogram size={64} />
        <p className="msc-kicker">Postcards from us</p>
        <h3 style={{fontSize: '24px'}}>10% off your first souvenir.</h3>
        {done ? (
          <p className="msc-marker" style={{fontSize: '18px'}}>
            noted. we&rsquo;ll write when there&rsquo;s something to say.
          </p>
        ) : (
          <>
            <p style={{maxWidth: '38ch'}}>
              Occasional mail about new towns, written briefly, the way a
              postcard should be. The discount arrives with the first one.
            </p>
            <fetcher.Form
              className="email-capture-form email-modal-form"
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
              <input type="hidden" name="source" value="postcards-modal" />
              <button type="submit" disabled={fetcher.state !== 'idle'}>
                {fetcher.state === 'idle' ? 'Sign me up' : 'One sec…'}
              </button>
            </fetcher.Form>
            {fetcher.data?.error && <p>{fetcher.data.error}</p>}
            <button
              type="button"
              className="email-modal-dismiss"
              onClick={dismiss}
            >
              No thanks — just browsing the towns
            </button>
          </>
        )}
      </div>
    </dialog>
  );
}
