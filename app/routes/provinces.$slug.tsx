import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/provinces.$slug';
import {useNonce} from '@shopify/hydrogen';
import {RackGrid} from '~/components/TownRackCard';
import {getProvince, getTownsByProvince} from '~/lib/catalog';
import {provinceDescription, provinceJsonLd, provinceTitle} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data?.province) return [{title: 'Not found'}];
  return [
    {title: provinceTitle(data.province, data.towns.length)},
    {
      name: 'description',
      content: provinceDescription(data.province, data.towns.length),
    },
    {
      tagName: 'link',
      rel: 'canonical',
      href: `${data.origin}/provinces/${data.province.slug}`,
    },
  ];
};

export async function loader({params, request}: Route.LoaderArgs) {
  const province = getProvince(params.slug ?? '');
  if (!province) throw new Response(null, {status: 404});
  return {
    province,
    towns: getTownsByProvince(province.slug),
    origin: new URL(request.url).origin,
  };
}

export default function ProvincePage() {
  const {province, towns, origin} = useLoaderData<typeof loader>();
  const nonce = useNonce();

  if (province.status !== 'open') {
    return (
      <div className="msc-narrow-page" style={{textAlign: 'center', alignItems: 'center'}}>
        <span className="msc-kicker">Not yet open</span>
        <h1>{province.name}</h1>
        <p>
          {province.status === 'next'
            ? `${province.name} is next on the route. The towns are being
               researched with the seriousness they were never afforded.`
            : `We will get to ${province.name}. Every region gets its turn,
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

  return (
    <div style={{paddingBottom: '88px'}}>
      <div className="province-header">
        <span className="msc-kicker">
          {province.name} · {towns.length} towns and counting
        </span>
        <h1>{province.name} souvenir t-shirts</h1>
        <p className="province-copy">
          Every {province.name} town on this rack is real, overlooked, and
          commemorated with the reverence a Hawaii gift shop would use —
          garment-dyed heavyweight tees, faded on purpose, printed with
          respect. From the coast to the interior, population 1,900 to
          technically-a-city: if it has a water tower and a story, it
          qualifies. New towns are added weekly; if yours is missing,{' '}
          <Link to="/request-your-town">request it</Link> and it moves up the
          list.
        </p>
      </div>
      <nav
        className="province-town-links msc-page"
        aria-label={`All ${province.name} towns`}
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
          __html: JSON.stringify(provinceJsonLd(province, towns, origin)),
        }}
      />
    </div>
  );
}
