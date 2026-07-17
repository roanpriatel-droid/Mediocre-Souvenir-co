import {useId} from 'react';
import {localeFor, type Colorway, type TownProduct} from '~/lib/catalog/types';
import {townImageAlt} from '~/lib/seo';

/**
 * Generative product art: a garment-dyed tee rendered per town from the three
 * shirt templates in the brand doc (Classic Varsity / Retro Postcard /
 * Faded Slogan). Stands in for photography until real Printify mockups land —
 * and doubles as the print spec for them.
 */

const PALETTE = {
  cream: '#F1E9D6',
  creamDeep: '#EDE2C8',
  brick: '#B8503A',
  navy: '#2A3D52',
  mustard: '#D4A64A',
  asphalt: '#1C1C1C',
  sage: '#8B9B7A',
};

const SHIRT_FILL: Record<Colorway, string> = {
  ivory: PALETTE.cream,
  butter: PALETTE.mustard,
  'blue-jean': PALETTE.navy,
  brick: PALETTE.brick,
  sage: PALETTE.sage,
};

/** Ink pairs chosen for contrast on light vs dark blanks. */
function inksFor(colorway: Colorway) {
  const dark = colorway === 'blue-jean' || colorway === 'brick';
  return dark
    ? {primary: PALETTE.cream, secondary: PALETTE.mustard}
    : {primary: PALETTE.navy, secondary: PALETTE.brick};
}

function arcFontSize(name: string): number {
  const len = name.length;
  if (len <= 6) return 30;
  if (len <= 9) return 24;
  if (len <= 12) return 19;
  return 15;
}

export function ShirtMockup({
  town,
  className,
  view = 'front',
}: {
  town: TownProduct;
  className?: string;
  /** 'front' = full tee; 'detail' = cropped in on the chest print */
  view?: 'front' | 'detail';
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const fill = SHIRT_FILL[town.colorway];
  const ink = inksFor(town.colorway);

  return (
    <svg
      viewBox={view === 'detail' ? '80 66 150 130' : '0 0 300 280'}
      role="img"
      aria-label={
        view === 'detail'
          ? `${townImageAlt(town)} — print detail`
          : townImageAlt(town)
      }
      className={className}
    >
      {/* the blank — Comfort Colors 1717 silhouette */}
      <path
        d="M150,28 C138,28 126,32 117,39 L58,68 L80,122 L106,110 L106,258 L194,258 L194,110 L224,122 L246,68 L183,39 C174,32 162,28 150,28 Z"
        fill={fill}
        stroke={PALETTE.asphalt}
        strokeWidth="3"
      />
      <path
        d="M117,39 C123,54 135,62 150,62 C165,62 177,54 183,39"
        fill="none"
        stroke={PALETTE.asphalt}
        strokeWidth="3"
      />
      <path
        d="M112,252 L188,252"
        stroke={PALETTE.asphalt}
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.5"
      />
      {town.style === 'classic-varsity' && (
        <ClassicVarsity town={town} ink={ink} id={id} />
      )}
      {town.style === 'retro-postcard' && <RetroPostcard town={town} ink={ink} />}
      {town.style === 'faded-slogan' && <FadedSlogan town={town} ink={ink} />}
    </svg>
  );
}

type Ink = {primary: string; secondary: string};

/** Style A — arched town name, landmark, province, est. year. The default. */
function ClassicVarsity({town, ink, id}: {town: TownProduct; ink: Ink; id: string}) {
  const name = town.city.toUpperCase();
  return (
    <g transform="translate(88,84)">
      <defs>
        <path id={`${id}-arc`} d="M 12,74 A 53,53 0 0 1 112,74" />
        <path id={`${id}-arcB`} d="M 21,75 A 43,43 0 0 0 105,75" />
      </defs>
      <text fontFamily="'Alfa Slab One',serif" fontSize={arcFontSize(name) * 0.63} letterSpacing="1.8" fill={ink.primary}>
        <textPath href={`#${id}-arc`} startOffset="50%" textAnchor="middle">
          {name}
        </textPath>
      </text>
      {/* water tower where a mountain should be */}
      <g
        stroke={ink.secondary}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(62,66) scale(0.26) translate(-210,-180)"
      >
        <path d="M182,130 L238,130 L228,110 L192,110 Z" />
        <rect x="182" y="130" width="56" height="42" />
        <path d="M186,172 L172,248 M234,172 L248,248 M178,214 L242,214" />
      </g>
      <text
        x="62"
        y="93"
        textAnchor="middle"
        fontFamily="'Archivo Narrow',sans-serif"
        fontWeight="700"
        fontSize="9.5"
        letterSpacing="2.5"
        fill={ink.primary}
      >
        {town.provinceState.toUpperCase()}
      </text>
      <text fontFamily="'Archivo Narrow',sans-serif" fontWeight="700" fontSize="8.5" letterSpacing="2" fill={ink.secondary}>
        <textPath href={`#${id}-arcB`} startOffset="50%" textAnchor="middle">
          {`★ EST. ${town.estYear} ★`}
        </textPath>
      </text>
    </g>
  );
}

/** Style B — “greetings from…” over a souvenir stripe. */
function RetroPostcard({town, ink}: {town: TownProduct; ink: Ink}) {
  const name = town.city.toUpperCase();
  const half = Math.ceil(name.length / 2);
  const nameSize = name.length <= 8 ? 15 : name.length <= 12 ? 12 : 9.5;
  return (
    <g transform="translate(150,90)" textAnchor="middle">
      <text
        y="8"
        fontFamily="'Permanent Marker',cursive"
        fontSize="12"
        fill={ink.primary}
        transform="rotate(-3)"
      >
        greetings from
      </text>
      <text y="28" fontFamily="'Alfa Slab One',serif" fontSize={nameSize} letterSpacing="0.5">
        <tspan fill={ink.secondary}>{name.slice(0, half)}</tspan>
        <tspan fill={ink.primary}>{name.slice(half)}</tspan>
      </text>
      {/* souvenir stripe */}
      <g transform="translate(-48,36)">
        <rect width="30" height="5" fill={ink.secondary} />
        <rect x="30" width="10" height="5" fill="none" />
        <rect x="40" width="26" height="5" fill={ink.primary} />
        <rect x="76" width="20" height="5" fill={ink.secondary} />
      </g>
      <text
        y="56"
        fontFamily="'Archivo Narrow',sans-serif"
        fontWeight="700"
        fontSize="8"
        letterSpacing="1.5"
        fill={ink.primary}
      >
        {town.provinceState.toUpperCase()}
      </text>
      <text
        y="67"
        fontFamily="'Archivo Narrow',sans-serif"
        fontWeight="700"
        fontSize="7.5"
        letterSpacing="1.2"
        fill={ink.primary}
        opacity="0.85"
      >
        {`POP. ${town.population.toLocaleString(localeFor(town.country))} · ${town.knownFor.toUpperCase()}`}
      </text>
    </g>
  );
}

/** Style C — one deadpan line at 88% ink, two hundred washes in. */
function FadedSlogan({town, ink}: {town: TownProduct; ink: Ink}) {
  const s = town.slogan ?? {
    lead: 'I was in',
    big: town.city.toUpperCase(),
    tail: town.provinceState,
  };
  const bigSize = s.big.length <= 8 ? 22 : s.big.length <= 12 ? 17 : 13;
  return (
    <g transform="translate(150,100)" textAnchor="middle" opacity="0.88">
      <text
        y="0"
        fontFamily="'Archivo Narrow',sans-serif"
        fontWeight="700"
        fontSize="10"
        letterSpacing="3"
        fill={ink.primary}
      >
        {s.lead.toUpperCase()}
      </text>
      <text y="24" fontFamily="'Alfa Slab One',serif" fontSize={bigSize} fill={ink.secondary}>
        {s.big}
      </text>
      <text
        y="40"
        fontFamily="'Archivo Narrow',sans-serif"
        fontWeight="700"
        fontSize="10"
        letterSpacing="2"
        fill={ink.primary}
      >
        {s.tail.toUpperCase()}
      </text>
      {s.marker ? (
        <text
          y="58"
          fontFamily="'Permanent Marker',cursive"
          fontSize="11"
          fill={ink.secondary}
          transform="rotate(-2)"
        >
          {s.marker}
        </text>
      ) : null}
    </g>
  );
}
