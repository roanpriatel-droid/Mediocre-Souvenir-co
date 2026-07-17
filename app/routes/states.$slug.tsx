import {useLoaderData} from 'react-router';
import type {Route} from './+types/states.$slug';
import {RegionLanding} from '~/components/RegionLanding';
import {getRegion, getTownsByRegion} from '~/lib/catalog';
import {regionDescription, regionTitle} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data?.region) return [{title: 'Not found'}];
  return [
    {title: regionTitle(data.region, data.towns.length)},
    {
      name: 'description',
      content: regionDescription(data.region, data.towns.length),
    },
    {
      tagName: 'link',
      rel: 'canonical',
      href: `${data.origin}/states/${data.region.slug}`,
    },
  ];
};

export async function loader({params, request}: Route.LoaderArgs) {
  const region = getRegion(params.slug ?? '', 'state');
  if (!region) throw new Response(null, {status: 404});
  return {
    region,
    towns: getTownsByRegion(region.slug),
    origin: new URL(request.url).origin,
  };
}

export default function StatePage() {
  const {region, towns, origin} = useLoaderData<typeof loader>();
  return <RegionLanding region={region} towns={towns} origin={origin} />;
}
