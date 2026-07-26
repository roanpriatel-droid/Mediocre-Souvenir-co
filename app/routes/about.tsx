import {redirect} from 'react-router';

/** One story page. /about was the older of the two. */
export async function loader() {
  return redirect('/our-story', 301);
}
