import {redirect} from 'react-router';

/** The Journal is Postcards From Nowhere now. One canonical URL. */
export async function loader() {
  return redirect('/postcards', 301);
}
