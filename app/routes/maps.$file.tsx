import type {Route} from './+types/maps.$file';
import {regionMapSvg} from '~/lib/region-map.server';

/**
 * /maps/on.svg: the pre-drawn background of a region page's map. Served as
 * its own long-cached file so the outlines stay out of the page HTML.
 */
export function loader({params}: Route.LoaderArgs) {
  const match = /^([a-z]{2})\.svg$/i.exec(params.file ?? '');
  const svg = match ? regionMapSvg(match[1]) : null;
  if (!svg) return new Response('Not found', {status: 404});
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
    },
  });
}
