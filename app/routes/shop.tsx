import {redirect} from 'react-router';

/**
 * /shop was a town index built from the local catalog, from when the catalog
 * was the only product source. With the real store live it rendered generative
 * artwork as though it were merchandise, competing with the actual products.
 * All Souvenirs is the catalog now.
 */
export async function loader() {
  return redirect('/collections/all-souvenirs', 301);
}
