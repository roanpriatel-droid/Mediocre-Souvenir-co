import {useEffect, useRef, useState} from 'react';

/**
 * Scroll-triggered reveal: opacity/translate only, ≤400ms, and inert when
 * the user prefers reduced motion (CSS turns the transition off — content
 * is always visible without JS, since the hidden state is only applied
 * after mount).
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
}: {
  children: React.ReactNode;
  delay?: 0 | 1 | 2 | 3;
  as?: 'div' | 'section' | 'li' | 'span';
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<'initial' | 'hidden' | 'shown'>('initial');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('shown');
          io.disconnect();
        }
      },
      {rootMargin: '0px 0px -8% 0px', threshold: 0.05},
    );
    // start hidden only once we know we can un-hide
    setState('hidden');
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // @ts-expect-error ref type varies with Tag; all are HTMLElements
      ref={ref}
      className={`reveal reveal--${state} reveal-delay-${delay} ${className}`}
    >
      {children}
    </Tag>
  );
}
