import {Form, useActionData, useNavigation, useSearchParams} from 'react-router';
import type {Route} from './+types/request-your-town';
import {getSubmissionStore, isValidEmail} from '~/lib/submissions';
import {SITE_NAME} from '~/lib/seo';

/**
 * The demand-signal engine. Submissions go through the pluggable store in
 * app/lib/submissions.ts — swap that for a durable backend before launch.
 */

export const meta: Route.MetaFunction = () => [
  {title: `Request Your Town — Join the Waitlist | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'Tell us your hometown and join its waitlist. Enough requests and it ' +
      'gets the commemorative souvenir t-shirt it has quietly deserved all ' +
      'along.',
  },
];

type ActionData =
  | {ok: true; town: string}
  | {ok: false; error: string};

export async function action({request}: Route.ActionArgs): Promise<ActionData> {
  const form = await request.formData();
  const town = String(form.get('town') ?? '').trim();
  const provinceState = String(form.get('provinceState') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const note = String(form.get('note') ?? '').trim();

  if (!town || !provinceState) {
    return {ok: false, error: 'A town needs a name and a province. It has both — tell us.'};
  }
  if (!isValidEmail(email)) {
    return {ok: false, error: 'We need a working email to tell you when your town is up.'};
  }

  await getSubmissionStore().addTownRequest({
    town,
    provinceState,
    email,
    note: note || undefined,
    submittedAt: new Date().toISOString(),
  });

  return {ok: true, town};
}

export default function RequestYourTown() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submitting = navigation.state !== 'idle';
  // A search that found nothing links here with ?town= — carry it over rather
  // than making someone type their own town twice.
  const [searchParams] = useSearchParams();
  const prefilledTown = searchParams.get('town') ?? '';

  if (actionData?.ok) {
    return (
      <div className="msc-narrow-page">
        <div className="msc-form-success">
          <div className="msc-stamp">
            Received
            <br />★ MSC ★
          </div>
          <h1>{actionData.town} is on the list.</h1>
          <p style={{maxWidth: '46ch'}}>
            Your town has been formally noted. When enough neighbours do the
            same, {actionData.town} gets the garment. We&rsquo;ll write to you
            when it does — briefly, like a postcard.
          </p>
          <span className="msc-marker">thanks for visiting.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="msc-narrow-page">
      <span className="msc-kicker">The waitlist</span>
      <h1>Request your town.</h1>
      <p>
        Every town is somebody&rsquo;s hometown, and most of them never got a
        souvenir. Tell us yours. Requests decide which towns get printed next
        — this is the whole system, there is no other system.
      </p>
      <Form method="post" className="msc-form">
        <div className="msc-form-row">
          <div>
            <label className="msc-label" htmlFor="town">
              Town
            </label>
            <input
              className="msc-input"
              id="town"
              name="town"
              required
              defaultValue={prefilledTown}
              placeholder="e.g. Moose Jaw"
            />
          </div>
          <div>
            <label className="msc-label" htmlFor="provinceState">
              Province / State
            </label>
            <input
              className="msc-input"
              id="provinceState"
              name="provinceState"
              required
              placeholder="e.g. Saskatchewan"
            />
          </div>
        </div>
        <div>
          <label className="msc-label" htmlFor="email">
            Email — so we can tell you when it&rsquo;s up
          </label>
          <input
            className="msc-input"
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@somewhere-unremarkable.ca"
          />
        </div>
        <div>
          <label className="msc-label" htmlFor="note">
            What is it known for? (optional, but it helps the artwork)
          </label>
          <input
            className="msc-input"
            id="note"
            name="note"
            placeholder="e.g. the giant moose statue"
          />
        </div>
        {actionData && !actionData.ok && (
          <p style={{color: 'var(--msc-brick)', fontWeight: 700}}>
            {actionData.error}
          </p>
        )}
        <button className="msc-button" type="submit" disabled={submitting}>
          {submitting ? 'Filing…' : 'Join the waitlist'}
        </button>
      </Form>
    </div>
  );
}
