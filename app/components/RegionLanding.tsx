import {Link} from 'react-router';
import {useNonce} from '@shopify/hydrogen';
import {RackGrid} from '~/components/TownRackCard';
import type {Region, TownProduct} from '~/lib/catalog';
import {regionJsonLd} from '~/lib/seo';

/**
 * Shared renderer for province and state landing pages — the routes at
 * /provinces/$slug and /states/$slug are thin wrappers around this.
 */
export function RegionLanding({
  region,
  towns,
  origin,
}: {
  region: Region;
  towns: TownProduct[];
  origin: string;
}) {
  const nonce = useNonce();

  if (region.status !== 'open') {
    return (
      <div
        className="msc-narrow-page"
        style={{textAlign: 'center', alignItems: 'center'}}
      >
        <span className="msc-kicker">Not yet open</span>
        <h1>{region.name}</h1>
        <p>
          {region.status === 'next'
            ? `${region.name} is next on the route. The towns are being
               researched with the seriousness they were never afforded.`
            : `We will get to ${region.name}. Every region gets its turn,
               and none of them get skipped.`}
        </p>
        <p>
          Want your town bumped up the list? That is literally what the
          waitlist is for.
        </p>
        <Link className="msc-button" to="/request-your-town">
          Request your town
        </Link>
      </div>
    );
  }

  const regionNoun = region.kind === 'state' ? 'state' : 'province';

  return (
    <div style={{paddingBottom: '88px'}}>
      <div className="province-header">
        <span className="msc-kicker">
          {region.name} · {towns.length} towns and counting
        </span>
        <h1>{region.name} souvenir t-shirts</h1>
        <p className="province-copy">
          Every {region.name} town on this rack is real, overlooked, and
          commemorated with the reverence a Hawaii gift shop would use —
          garment-dyed heavyweight tees, faded on purpose, printed with
          respect. Population 1,900 to technically-a-city: if it has a water
          tower and a story, it qualifies. New towns are added weekly; if the
          {` ${regionNoun}`}&rsquo;s finest is missing,{' '}
          <Link to="/request-your-town">request it</Link> and it moves up the
          list.
        </p>
      </div>
      <nav
        className="province-town-links msc-page"
        aria-label={`All ${region.name} towns`}
      >
        {towns.map((town) => (
          <Link key={town.handle} to={`/products/${town.handle}`}>
            {town.city}
          </Link>
        ))}
      </nav>
      <div className="msc-page">
        <RackGrid towns={towns} />
      </div>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(regionJsonLd(region, towns, origin)),
        }}
      />
    </div>
  );
}
