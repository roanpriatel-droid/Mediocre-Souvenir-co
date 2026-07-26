import {redirect} from 'react-router';

/**
 * /collections/all is the Shopify convention for "every product". Ours is
 * /shop, which carries the filters, the sort, and the town search — so this
 * URL forwards rather than maintaining a second full-catalog page.
 */
export async function loader() {
  return redirect('/shop', 301);
}
