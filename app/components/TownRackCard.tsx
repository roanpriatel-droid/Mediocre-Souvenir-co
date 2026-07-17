import {Link} from 'react-router';
import {DISPLAY_PRICE, TIER_LABELS, type TownProduct} from '~/lib/catalog';
import {ShirtMockup} from '~/components/ShirtMockup';

/** A product card styled like a souvenir rack tag, punch hole included. */
export function TownRackCard({town}: {town: TownProduct}) {
  return (
    <Link
      className="rack-card"
      to={`/products/${town.handle}`}
      prefetch="intent"
    >
      <ShirtMockup town={town} className="rack-card-art" />
      <div className="rack-card-town">{town.city}</div>
      <div className="rack-card-meta">
        {town.provinceState} · {TIER_LABELS[town.populationTier]}
      </div>
      <div className="rack-card-price">
        <span>Genuine souvenir</span>
        <strong>{DISPLAY_PRICE}</strong>
      </div>
    </Link>
  );
}

export function RackGrid({towns}: {towns: TownProduct[]}) {
  return (
    <div className="rack-grid">
      {towns.map((town) => (
        <TownRackCard key={town.handle} town={town} />
      ))}
    </div>
  );
}
