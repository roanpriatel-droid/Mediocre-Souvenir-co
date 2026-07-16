import type {Route} from './+types/api.subscribe';
import {getSubmissionStore, isValidEmail} from '~/lib/submissions';

export async function action({request}: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const source = String(form.get('source') ?? 'unknown');

  if (!isValidEmail(email)) {
    return {ok: false as const, error: 'That email doesn’t look deliverable.'};
  }

  await getSubmissionStore().addSubscriber({
    email,
    source,
    submittedAt: new Date().toISOString(),
  });

  return {ok: true as const};
}

export async function loader() {
  throw new Response(null, {status: 404});
}
