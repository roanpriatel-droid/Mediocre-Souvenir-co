import {redirect} from 'react-router';

/** The region hub lives at /provinces — one canonical browse page. */
export async function loader() {
  return redirect('/provinces', 301);
}
