import {redirect} from 'react-router';

/** Renamed to Request A Town. Old links keep working. */
export async function loader({request}: {request: Request}) {
  const qs = new URL(request.url).search;
  return redirect(`/request-a-town${qs}`, 301);
}
