import type {Route} from './+types/api.subscribe';
import {getSubmissionStore, isValidEmail} from '~/lib/submissions';
import {getRegion} from '~/lib/catalog';

/**
 * Email capture endpoint, shared by the footer signup, the modal, and the 62
 * region waitlists. A `region` field is validated against the region registry
 * and stored as a tag, so the waitlist can be segmented by province or state
 * when it is wired to a real ESP.
 */
export async function action({request, context}: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const source = String(form.get('source') ?? 'unknown');
  const regionSlug = String(form.get('region') ?? '').trim();

  if (!isValidEmail(email)) {
    return {ok: false as const, error: 'That email doesn’t look deliverable.'};
  }

  // Only trust a region we actually publish — the field arrives from a form.
  const region = regionSlug ? getRegion(regionSlug) : undefined;

  const tags = ['newsletter'];
  if (region) {
    tags.push(`region:${region.slug}`, `country:${
      region.country === 'Canada' ? 'ca' : 'us'
    }`, 'waitlist');
  }

  await getSubmissionStore(context.env).addSubscriber({
    email,
    source,
    region: region?.slug,
    regionName: region?.name,
    tags,
    submittedAt: new Date().toISOString(),
  });

  return {ok: true as const};
}

export async function loader() {
  throw new Response(null, {status: 404});
}
