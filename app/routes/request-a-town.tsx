import {Form, useActionData, useNavigation, useSearchParams} from 'react-router';
import type {Route} from './+types/request-a-town';
import {getSubmissionStore, isValidEmail} from '~/lib/submissions';
import {getRegion, REGIONS} from '~/lib/catalog';
import {SITE_NAME} from '~/lib/seo';

/**
 * The demand-signal engine. Submissions go through the pluggable store in
 * app/lib/submissions.ts — swap that for a durable backend before launch.
 */

export const meta: Route.MetaFunction = ({data}) => [
  {title: `Request A Town — Nominate Your Mediocre Hometown | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'Tell us your hometown and join its waitlist. Enough requests and it ' +
      'gets the commemorative souvenir t-shirt it has quietly deserved all ' +
      'along.',
  },
  {tagName: 'link', rel: 'canonical', href: `${data?.origin ?? ''}/request-a-town`},
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

  const submittedAt = new Date().toISOString();
  const store = getSubmissionStore();

  // Two things happen here, and both matter. The request is the product
  // pipeline — it decides what gets printed next. The subscriber record is the
  // engagement side: the same person, on the list, tagged with the town and
  // region they asked for, so "your town is open" can actually be sent.
  const region = getRegion(slugify(provinceState)) ?? findRegionByName(provinceState);

  await Promise.all([
    store.addTownRequest({
      town,
      provinceState,
      email,
      note: note || undefined,
      submittedAt,
    }),
    store.addSubscriber({
      email,
      source: 'request-a-town',
      region: region?.slug,
      regionName: region?.name ?? provinceState,
      town,
      tags: [
        'newsletter',
        'waitlist',
        `town:${slugify(town)}`,
        ...(region
          ? [`region:${region.slug}`, `country:${region.country === 'Canada' ? 'ca' : 'us'}`]
          : []),
      ],
      submittedAt,
    }),
  ]);

  return {ok: true, town};
}

export async function loader({request}: Route.LoaderArgs) {
  return {origin: new URL(request.url).origin};
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
      <h1>Request a town.</h1>
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

/** "New Brunswick" -> "new-brunswick", so a typed province can match a slug. */
function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Fall back to matching on name or two-letter abbreviation. */
function findRegionByName(value: string) {
  const needle = value.trim().toLowerCase();
  return REGIONS.find(
    (region) =>
      region.name.toLowerCase() === needle ||
      region.abbrev.toLowerCase() === needle,
  );
}
