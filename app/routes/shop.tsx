import {useSearchParams} from 'react-router';
import type {Route} from './+types/shop';
import {RackGrid} from '~/components/TownRackCard';
import {TownSearch} from '~/components/TownSearch';
import {
  COLORWAY_LABELS,
  getAllTowns,
  getOpenRegions,
  TIER_LABELS,
  type Colorway,
  type PopulationTier,
  type ShirtStyle,
} from '~/lib/catalog';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = () => [
  {title: `Shop All Towns — Vintage Souvenir T-Shirts | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'The whole rack: faux-vintage souvenir t-shirts for every overlooked ' +
      'town we cover. Garment-dyed heavyweight tees, $36 each — collect 2 ' +
      'and save 15%.',
  },
];

const STYLE_LABELS: Record<ShirtStyle, string> = {
  'classic-varsity': 'Classic Varsity',
  'retro-postcard': 'Retro Postcard',
  'faded-slogan': 'Faded Slogan',
};

const SORTS = {
  'a-z': 'A to Z',
  newest: 'New arrivals first',
  'pop-asc': 'Smallest town first',
  'pop-desc': 'Largest town first',
} as const;

export async function loader(_args: Route.LoaderArgs) {
  return {towns: getAllTowns(), regions: getOpenRegions()};
}

export default function Shop({loaderData}: Route.ComponentProps) {
  const {towns, regions} = loaderData;
  const [params, setParams] = useSearchParams();

  const region = params.get('region') ?? '';
  const tier = params.get('tier') ?? '';
  const style = params.get('style') ?? '';
  const colorway = params.get('colorway') ?? '';
  const sort = params.get('sort') ?? 'a-z';

  const setFilter = (key: string, value: string) => {
    setParams(
      (prev) => {
        if (value) prev.set(key, value);
        else prev.delete(key);
        return prev;
      },
      {preventScrollReset: true, replace: true},
    );
  };

  let filtered = towns.filter(
    (t) =>
      (!region || t.provinceSlug === region) &&
      (!tier || t.populationTier === tier) &&
      (!style || t.style === style) &&
      (!colorway || t.colorway === colorway),
  );

  filtered = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'newest':
        return Number(b.newArrival ?? false) - Number(a.newArrival ?? false) ||
          a.city.localeCompare(b.city);
      case 'pop-asc':
        return a.population - b.population;
      case 'pop-desc':
        return b.population - a.population;
      default:
        return a.city.localeCompare(b.city);
    }
  });

  const anyFilter = Boolean(region || tier || style || colorway);

  return (
    <div className="msc-page" style={{paddingBottom: '88px'}}>
      <div className="province-header">
        <span className="msc-kicker">The whole rack</span>
        <h1>Shop all towns</h1>
        <p className="province-copy">
          Every town here is real, overlooked, and commemorated with the
          reverence it quietly deserves. Filed the way a real gift shop would
          file them.
        </p>
        <TownSearch />
      </div>

      <div className="shop-toolbar" role="group" aria-label="Filter and sort">
        <label>
          <span className="msc-label">Region</span>
          <select
            className="msc-input"
            value={region}
            onChange={(e) => setFilter('region', e.target.value)}
          >
            <option value="">All regions</option>
            {regions.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="msc-label">Town size</span>
          <select
            className="msc-input"
            value={tier}
            onChange={(e) => setFilter('tier', e.target.value)}
          >
            <option value="">Any size</option>
            {(Object.keys(TIER_LABELS) as PopulationTier[]).map((t) => (
              <option key={t} value={t}>
                {TIER_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="msc-label">Template</span>
          <select
            className="msc-input"
            value={style}
            onChange={(e) => setFilter('style', e.target.value)}
          >
            <option value="">All templates</option>
            {(Object.keys(STYLE_LABELS) as ShirtStyle[]).map((s) => (
              <option key={s} value={s}>
                {STYLE_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="msc-label">Colorway</span>
          <select
            className="msc-input"
            value={colorway}
            onChange={(e) => setFilter('colorway', e.target.value)}
          >
            <option value="">All colorways</option>
            {(Object.keys(COLORWAY_LABELS) as Colorway[]).map((c) => (
              <option key={c} value={c}>
                {COLORWAY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="msc-label">Sort</span>
          <select
            className="msc-input"
            value={sort}
            onChange={(e) => setFilter('sort', e.target.value)}
          >
            {Object.entries(SORTS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="shop-count">
        <span className="msc-kicker msc-kicker--navy">
          {filtered.length} of {towns.length} towns
        </span>
        {anyFilter && (
          <button
            type="button"
            className="product-size-guide-link"
            onClick={() => setParams({}, {replace: true})}
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <RackGrid towns={filtered} />
      ) : (
        <div className="guest-book-empty">
          <h3>No towns match that combination.</h3>
          <p>
            Which is itself very on-brand, but try loosening a filter — or{' '}
            <a href="/request-your-town">request the town you wanted</a>.
          </p>
        </div>
      )}
    </div>
  );
}
