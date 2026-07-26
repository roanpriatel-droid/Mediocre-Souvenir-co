import {redirect} from 'react-router';

/** Any Shopify blog handle lands on the Journal index. See blogs._index.tsx. */
export async function loader() {
  return redirect('/journal', 301);
}
