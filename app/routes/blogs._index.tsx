import {redirect} from 'react-router';

/**
 * The Journal is our blog, and it lives in app/lib/journal.ts rather than in
 * Shopify's blog objects — the writing cross-links into the catalog, so it
 * belongs beside it. /blogs/* stays routable because Shopify stores publish
 * those URLs by convention and inbound links assume them.
 */
export async function loader() {
  return redirect('/journal', 301);
}
