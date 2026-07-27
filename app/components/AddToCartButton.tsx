import {useEffect, useState} from 'react';
import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';

/**
 * The primary purchase control.
 *
 * This used to render a bare `<button type="submit">` with no class at all, so
 * the most important element in the store fell back to whatever ambient CSS
 * happened to reach it. On product cards and the mobile sticky bar that was a
 * descendant selector; in the PDP buy column there was nothing at all, and the
 * main Add to Cart rendered as an unstyled browser default button.
 *
 * It now carries its own class, defaulting to the brand button, and reports
 * what it is doing: pending while the line posts, then a brief confirmation.
 * A control that gives no feedback gets pressed again — a real source of
 * duplicate lines and of people deciding the site is broken.
 */
export function AddToCartButton({
  analytics,
  children,
  className = 'msc-button msc-button--buy',
  disabled,
  lines,
  onClick,
  pendingLabel = 'Adding…',
  successLabel = 'Added to your souvenirs',
}: {
  analytics?: unknown;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  pendingLabel?: React.ReactNode;
  successLabel?: React.ReactNode;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <AddToCartInner
          analytics={analytics}
          className={className}
          disabled={disabled}
          fetcher={fetcher}
          onClick={onClick}
          pendingLabel={pendingLabel}
          successLabel={successLabel}
        >
          {children}
        </AddToCartInner>
      )}
    </CartForm>
  );
}

function AddToCartInner({
  analytics,
  children,
  className,
  disabled,
  fetcher,
  onClick,
  pendingLabel,
  successLabel,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  className: string;
  disabled?: boolean;
  fetcher: FetcherWithComponents<any>;
  onClick?: () => void;
  pendingLabel: React.ReactNode;
  successLabel: React.ReactNode;
}) {
  const pending = fetcher.state !== 'idle';
  const [justAdded, setJustAdded] = useState(false);

  // Confirm briefly, then return to the idle label so the control is always
  // ready for the next add.
  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return;
    setJustAdded(true);
    const timer = setTimeout(() => setJustAdded(false), 2200);
    return () => clearTimeout(timer);
  }, [fetcher.state, fetcher.data]);

  return (
    <>
      <input name="analytics" type="hidden" value={JSON.stringify(analytics)} />
      <button
        className={className}
        type="submit"
        onClick={onClick}
        disabled={disabled ?? pending}
        data-pending={pending || undefined}
        data-added={justAdded || undefined}
      >
        {pending ? pendingLabel : justAdded ? successLabel : children}
      </button>
      {/* Announce the outcome — a screen reader cannot see a label change on a
          control that has already lost focus to the cart drawer. */}
      <span className="sr-only" role="status" aria-live="polite">
        {pending ? 'Adding to cart' : justAdded ? 'Added to cart' : ''}
      </span>
    </>
  );
}
