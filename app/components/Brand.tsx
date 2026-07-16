import {useId} from 'react';

/**
 * Placeholder logo marks drawn to the brand identity doc (Doc. No. 1978-B).
 * These get replaced by the committed SVG assets when they land — keep the
 * component APIs, swap the internals.
 */

const NAVY = '#2A3D52';
const BRICK = '#B8503A';
const CREAM = '#F1E9D6';
const MUSTARD = '#D4A64A';

/** Circular badge emblem — primary logo. Water tower where a mountain should be. */
export function BadgeLogo({
  size = 200,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 420 420"
      role="img"
      aria-label="Mediocre Souvenir Co. badge — genuine merch for overlooked places"
      className={className}
    >
      <defs>
        <path id={`${id}-arcTop`} d="M 66,282 A 165,165 0 1 1 354,282" />
        <path id={`${id}-arcBot`} d="M 76,210 A 134,134 0 1 0 344,210" />
      </defs>
      <circle cx="210" cy="210" r="202" fill="none" stroke={NAVY} strokeWidth="7" />
      <circle
        cx="210"
        cy="210"
        r="190"
        fill="none"
        stroke={NAVY}
        strokeWidth="2"
        strokeDasharray="2 6"
      />
      <text
        fontFamily="'Alfa Slab One',serif"
        fontSize="30"
        letterSpacing="3"
        fill={NAVY}
      >
        <textPath href={`#${id}-arcTop`} startOffset="50%" textAnchor="middle">
          MEDIOCRE SOUVENIR CO.
        </textPath>
      </text>
      <text
        fontFamily="'Archivo Narrow',sans-serif"
        fontWeight="700"
        fontSize="16"
        letterSpacing="3.5"
        fill={BRICK}
      >
        <textPath href={`#${id}-arcBot`} startOffset="50%" textAnchor="middle">
          GENUINE MERCH FOR OVERLOOKED PLACES
        </textPath>
      </text>
      <g fill={BRICK}>
        <path d="M52,210 l8,-8 8,8 -8,8 z" />
        <path d="M352,210 l8,-8 8,8 -8,8 z" />
      </g>
      <circle cx="210" cy="210" r="120" fill="none" stroke={NAVY} strokeWidth="3" />
      {/* municipal water tower */}
      <g
        stroke={NAVY}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M182,130 L238,130 L228,110 L192,110 Z" fill={BRICK} strokeWidth="5" />
        <rect x="182" y="130" width="56" height="42" fill={CREAM} />
        <path d="M182,152 L238,152" strokeWidth="3" />
        <path d="M186,172 L172,248 M234,172 L248,248 M178,214 L242,214 M182,192 L230,244 M238,192 L190,244" />
        <path d="M210,172 L210,196" strokeWidth="4" />
        <path d="M150,250 L270,250" strokeWidth="4" />
      </g>
      <text
        x="210"
        y="285"
        textAnchor="middle"
        fontFamily="'Archivo Narrow',sans-serif"
        fontWeight="700"
        fontSize="17"
        letterSpacing="3"
        fill={NAVY}
      >
        EST. 2026
      </text>
      <text
        x="210"
        y="306"
        textAnchor="middle"
        fontFamily="'Archivo Narrow',sans-serif"
        fontWeight="500"
        fontSize="12"
        letterSpacing="2.5"
        fill={BRICK}
      >
        NORTH AMERICA
      </text>
    </svg>
  );
}

/** MSC monogram — avatars, small placements. Inverted on navy by default. */
export function MSCMonogram({
  size = 44,
  onDark = false,
  className,
}: {
  size?: number;
  onDark?: boolean;
  className?: string;
}) {
  const ring = onDark ? CREAM : NAVY;
  const accent = onDark ? MUSTARD : BRICK;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 420 420"
      role="img"
      aria-label="MSC monogram"
      className={className}
    >
      <circle cx="210" cy="210" r="196" fill="none" stroke={ring} strokeWidth="14" />
      <circle
        cx="210"
        cy="210"
        r="150"
        fill="none"
        stroke={accent}
        strokeWidth="4"
        strokeDasharray="3 9"
      />
      <text
        x="210"
        y="238"
        textAnchor="middle"
        fontFamily="'Alfa Slab One',serif"
        fontSize="96"
        fill={ring}
      >
        MSC
      </text>
      <text
        x="210"
        y="292"
        textAnchor="middle"
        fontFamily="'Archivo Narrow',sans-serif"
        fontWeight="700"
        fontSize="26"
        letterSpacing="7"
        fill={accent}
      >
        EST. 2026
      </text>
    </svg>
  );
}
