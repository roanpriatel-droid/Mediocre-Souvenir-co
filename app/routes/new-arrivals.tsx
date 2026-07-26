import {redirect} from 'react-router';

/**
 * New Arrivals is a Shopify smart collection now, and the nav points at it.
 * One canonical URL beats two pages competing for the same query.
 */
export async function loader() {
  return redirect('/collections/new-arrivals', 301);
}
