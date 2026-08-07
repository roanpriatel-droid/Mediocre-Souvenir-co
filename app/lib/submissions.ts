/**
 * Pluggable submission storage for the two demand-signal engines:
 * town requests (the waitlist) and Postcards From Us (email capture).
 *
 * Oxygen workers have no writable filesystem, so the default store keeps an
 * in-memory list per isolate AND logs a structured line — Oxygen log drains
 * capture every submission even if the isolate recycles. Swap `makeStore`
 * for a durable backend (Shopify customer tags + metafields, Klaviyo, or a
 * KV/D1 binding) before real launch; every consumer goes through this
 * interface, so nothing else changes.
 */

export interface TownRequest {
  town: string;
  provinceState: string;
  email: string;
  note?: string;
  submittedAt: string;
}

export interface Subscriber {
  email: string;
  source: string;
  /** Region slug when the signup came from a region waitlist. */
  region?: string;
  regionName?: string;
  /** The specific town nominated, when the signup came from Request A Town. */
  town?: string;
  /**
   * Tags to apply at the ESP — `region:ontario`, `country:ca`, `waitlist`.
   * Shopify customer tags and Klaviyo lists both take this shape directly.
   */
  tags?: string[];
  submittedAt: string;
}

/** Subjects on the contact form — routed by whoever reads the inbox. */
export type MessageTopic =
  | 'order'
  | 'sizing'
  | 'town-correction'
  | 'wholesale'
  | 'other';

export interface ContactMessage {
  name: string;
  email: string;
  topic: MessageTopic;
  /** Order number, when the topic is an existing order. */
  orderNumber?: string;
  message: string;
  submittedAt: string;
}

export interface SubmissionStore {
  addTownRequest(request: TownRequest): Promise<void>;
  addSubscriber(subscriber: Subscriber): Promise<void>;
  addMessage(message: ContactMessage): Promise<void>;
  listTownRequests(): Promise<TownRequest[]>;
}

function makeStore(): SubmissionStore {
  const townRequests: TownRequest[] = [];
  const subscribers: Subscriber[] = [];
  const messages: ContactMessage[] = [];
  return {
    addTownRequest(request) {
      townRequests.push(request);
      console.log(`[msc:town-request] ${JSON.stringify(request)}`);
      return Promise.resolve();
    },
    addSubscriber(subscriber) {
      subscribers.push(subscriber);
      console.log(`[msc:subscriber] ${JSON.stringify(subscriber)}`);
      return Promise.resolve();
    },
    addMessage(message) {
      messages.push(message);
      console.log(`[msc:message] ${JSON.stringify(message)}`);
      return Promise.resolve();
    },
    listTownRequests() {
      return Promise.resolve(townRequests);
    },
  };
}

/**
 * Durable store: one metaobject per submission, readable in Shopify admin
 * under Content → Metaobjects. Definitions (msc_contact_message,
 * msc_town_request, msc_subscriber) already exist on the shop.
 *
 * The Admin API needs a token the Storefront API cannot provide, so this
 * only engages when PRIVATE_ADMIN_API_TOKEN is set in the Oxygen
 * environment. Without it we fall back to the logging store below, which is
 * what a local `h2 dev` session gets.
 */
function makeMetaobjectStore(token: string, domain: string): SubmissionStore {
  const endpoint = `https://${domain}/admin/api/2026-04/graphql.json`;
  const MUTATION = `#graphql
    mutation CreateSubmission($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message }
      }
    }
  `;

  async function create(
    type: string,
    fields: Record<string, string | undefined>,
    logLabel: string,
    raw: unknown,
  ): Promise<void> {
    const body = {
      query: MUTATION,
      variables: {
        metaobject: {
          type,
          fields: Object.entries(fields)
            .filter(([, value]) => value != null && value !== '')
            .map(([key, value]) => ({key, value: String(value)})),
        },
      },
    };
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as {
        data?: {metaobjectCreate?: {userErrors?: {message: string}[]}};
        errors?: unknown;
      };
      const errors =
        result.errors ?? result.data?.metaobjectCreate?.userErrors ?? [];
      if (Array.isArray(errors) ? errors.length : errors) {
        throw new Error(JSON.stringify(errors));
      }
    } catch (error) {
      // A lost message is worse than a slow one, but we cannot fail the
      // customer's submission either — log it so the Oxygen drain still has
      // it, and let the form report success.
      console.error(`[msc:${logLabel}] metaobject write failed`, error);
      console.log(`[msc:${logLabel}] ${JSON.stringify(raw)}`);
    }
  }

  return {
    addTownRequest(request) {
      return create(
        'msc_town_request',
        {
          town: request.town,
          province_state: request.provinceState,
          email: request.email,
          note: request.note,
          submitted_at: request.submittedAt,
        },
        'town-request',
        request,
      );
    },
    addSubscriber(subscriber) {
      return create(
        'msc_subscriber',
        {
          email: subscriber.email,
          source: subscriber.source,
          region: subscriber.regionName ?? subscriber.region,
          town: subscriber.town,
          tags: subscriber.tags?.join(', '),
          submitted_at: subscriber.submittedAt,
        },
        'subscriber',
        subscriber,
      );
    },
    addMessage(message) {
      return create(
        'msc_contact_message',
        {
          // The display name in admin — makes the list scannable without
          // opening every entry.
          subject: `${message.topic} — ${message.name}`,
          name: message.name,
          email: message.email,
          topic: message.topic,
          order_number: message.orderNumber,
          message: message.message,
          submitted_at: message.submittedAt,
        },
        'message',
        message,
      );
    },
    listTownRequests() {
      // Reading back is an admin job; the site never lists these.
      return Promise.resolve([]);
    },
  };
}

let store: SubmissionStore | undefined;

/**
 * Pass the worker env (`context.env`) to get the durable store. Called
 * without one — or without the admin token configured — you get the
 * in-memory logger, so local development needs no secrets.
 */
export function getSubmissionStore(env?: {
  PRIVATE_ADMIN_API_TOKEN?: string;
  PUBLIC_STORE_DOMAIN?: string;
}): SubmissionStore {
  const token = env?.PRIVATE_ADMIN_API_TOKEN;
  const domain = env?.PUBLIC_STORE_DOMAIN;
  if (token && domain) return makeMetaobjectStore(token, domain);
  store ??= makeStore();
  return store;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
