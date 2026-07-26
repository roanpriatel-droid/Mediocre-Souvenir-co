import {Form, Link, useActionData, useNavigation} from 'react-router';
import type {Route} from './+types/contact';
import {Reveal} from '~/components/Reveal';
import {
  getSubmissionStore,
  isValidEmail,
  type MessageTopic,
} from '~/lib/submissions';
import {SUPPORT_EMAIL} from '~/lib/policies';
import {SITE_NAME} from '~/lib/seo';

/**
 * The front desk. Messages go through the same pluggable store as the town
 * waitlist (app/lib/submissions.ts) — swap that for a durable backend before
 * launch. The email address stays on the page regardless: a form that posts
 * into a log is not a promise anyone should have to rely on.
 */

export const meta: Route.MetaFunction = ({data}) => [
  {title: `Contact — The Front Desk | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'Write to Mediocre Souvenir Co. about an order, sizing, a town we got ' +
      'wrong, or anything else. Answered by a person within two business days.',
  },
  {tagName: 'link', rel: 'canonical', href: `${data?.origin ?? ''}/contact`},
];

const TOPICS: {value: MessageTopic; label: string}[] = [
  {value: 'order', label: 'An order I placed'},
  {value: 'sizing', label: 'Sizing or fit'},
  {value: 'town-correction', label: 'You got something wrong about my town'},
  {value: 'wholesale', label: 'Stocking these in a shop'},
  {value: 'other', label: 'Something else'},
];

const VALID_TOPICS = new Set<string>(TOPICS.map((topic) => topic.value));

type ActionData = {ok: true; name: string} | {ok: false; error: string};

export async function action({request}: Route.ActionArgs): Promise<ActionData> {
  const form = await request.formData();

  // Honeypot: a field no person sees and every naive bot fills in. Accept the
  // submission silently rather than tell the bot it failed.
  if (String(form.get('company') ?? '').trim()) {
    return {ok: true, name: 'Thanks'};
  }

  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const topicRaw = String(form.get('topic') ?? '').trim();
  const orderNumber = String(form.get('orderNumber') ?? '').trim();
  const message = String(form.get('message') ?? '').trim();

  if (!name) {
    return {ok: false, error: 'A name helps, even a first one.'};
  }
  if (!isValidEmail(email)) {
    return {
      ok: false,
      error: 'We need a working email, or the reply has nowhere to go.',
    };
  }
  if (message.length < 10) {
    return {
      ok: false,
      error: 'Tell us a little more than that and we can actually help.',
    };
  }

  await getSubmissionStore().addMessage({
    name,
    email,
    topic: (VALID_TOPICS.has(topicRaw) ? topicRaw : 'other') as MessageTopic,
    orderNumber: orderNumber || undefined,
    message,
    submittedAt: new Date().toISOString(),
  });

  return {ok: true, name};
}

export async function loader({request}: Route.LoaderArgs) {
  return {origin: new URL(request.url).origin};
}

export default function Contact() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submitting = navigation.state !== 'idle';

  if (actionData?.ok) {
    return (
      <div className="msc-narrow-page">
        <div className="msc-form-success">
          <div className="msc-stamp">
            Received
            <br />★ MSC ★
          </div>
          <h1>Filed, {actionData.name}.</h1>
          <p style={{maxWidth: '46ch'}}>
            Your message is at the front desk. A person reads it and replies
            within two business days — sooner if it is about an order already
            on its way.
          </p>
          <span className="msc-marker">thanks for visiting.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="msc-narrow-page">
      <span className="msc-kicker">The front desk</span>
      <h1>Contact.</h1>
      <p>
        Questions about an order, a town, or the general concept of
        commemorating places that never asked to be commemorated — write to us.
        We read everything, slowly and with care.
      </p>

      {/* The form is a motel comment card: perforated top, ruled fields, the
          management thanking you for your candour in advance. */}
      <Form method="post" className="msc-form comment-card">
        <div className="comment-card-head" aria-hidden="true">
          <span>GUEST COMMENT CARD</span>
          <span>NO. 1978-C</span>
        </div>
        <p className="comment-card-intro">
          Your candour helps us serve you at approximately the current level.
        </p>
        <div className="msc-form-row">
          <div>
            <label className="msc-label" htmlFor="name">
              Name
            </label>
            <input
              className="msc-input"
              id="name"
              name="name"
              required
              autoComplete="name"
              placeholder="First is plenty"
            />
          </div>
          <div>
            <label className="msc-label" htmlFor="email">
              Email
            </label>
            <input
              className="msc-input"
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@somewhere-unremarkable.ca"
            />
          </div>
        </div>

        <div className="msc-form-row">
          <div>
            <label className="msc-label" htmlFor="topic">
              What is this about?
            </label>
            <select className="msc-input" id="topic" name="topic" defaultValue="order">
              {TOPICS.map((topic) => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="msc-label" htmlFor="orderNumber">
              Order number (if there is one)
            </label>
            <input
              className="msc-input"
              id="orderNumber"
              name="orderNumber"
              placeholder="e.g. MSC-1042"
            />
          </div>
        </div>

        <div>
          <label className="msc-label" htmlFor="message">
            Message
          </label>
          <textarea
            className="msc-input msc-textarea"
            id="message"
            name="message"
            rows={6}
            required
            minLength={10}
            placeholder="Everything you want us to know."
          />
        </div>

        {/* Honeypot — hidden from people, irresistible to bots. */}
        <div className="msc-honeypot" aria-hidden="true">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" tabIndex={-1} autoComplete="off" />
        </div>

        {actionData && !actionData.ok && (
          <p role="alert" style={{color: 'var(--msc-brick)', fontWeight: 700}}>
            {actionData.error}
          </p>
        )}

        <button className="msc-button" type="submit" disabled={submitting}>
          {submitting ? 'Filing…' : 'Leave it at the desk'}
        </button>
        <p className="comment-card-foot" aria-hidden="true">
          Management reads every card. Management is one person.
        </p>
      </Form>

      <Reveal>
        <div className="contact-details">
          <div>
            <span className="msc-label">Email, if you prefer</span>
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{fontWeight: 700}}>
              {SUPPORT_EMAIL}
            </a>
          </div>
          <div>
            <span className="msc-label">Instagram</span>
            <a
              href="https://instagram.com/mediocresouvenirco"
              target="_blank"
              rel="noreferrer"
              style={{fontWeight: 700}}
            >
              @mediocresouvenirco
            </a>
          </div>
          <div>
            <span className="msc-label">Response time</span>
            <p>Within two business days. Genuine takes time.</p>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="contact-shortcuts">
          <p>
            Faster than waiting on us: the <Link to="/faq">FAQ</Link> covers
            shipping, returns, sizing, and the discount ladder.{' '}
            <Link to="/policies/refund-policy">Returns</Link> are 30 days, no
            interrogation. Want a town added? That goes through{' '}
            <Link to="/request-a-town">the waitlist</Link>, not this form —
            it is the only thing that decides what gets printed next.
          </p>
        </div>
      </Reveal>

      <span className="msc-marker">thanks for visiting.</span>
    </div>
  );
}
