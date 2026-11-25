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
 * How the durable store reaches the Admin API. Either a static token (a
 * legacy custom app's `shpat_…`), or the Dev Dashboard app's client
 * credentials, which mint a token that lives for 24 hours. A static copy of
 * a minted token would work for a day and then fail silently, so the
 * client-credentials path mints its own and refreshes it before expiry.
 */
type AdminCredentials =
  | {kind: 'token'; token: string}
  | {kind: 'client'; clientId: string; clientSecret: string};

const ADMIN_API_VERSION = '2026-04';

/** Per-isolate cache of a minted token. */
let minted: {token: string; expiresAt: number} | undefined;

async function adminToken(
  credentials: AdminCredentials,
  domain: string,
): Promise<string> {
  if (credentials.kind === 'token') return credentials.token;
  // Refresh with an hour of slack: a token that expires mid-request is a
  // lost submission.
  if (minted && minted.expiresAt - Date.now() > 60 * 60 * 1000) {
    return minted.token;
  }
  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
    }),
  });
  if (!response.ok) {
    throw new Error(`admin token request failed: ${response.status}`);
  }
  const body = (await response.json()) as {
    access_token: string;
    expires_in?: number;
  };
  minted = {
    token: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 86_400) * 1000,
  };
  return minted.token;
}

interface AdminResult<T> {
  data?: T;
  errors?: unknown;
}

function makeAdminClient(credentials: AdminCredentials, domain: string) {
  const endpoint = `https://${domain}/admin/api/${ADMIN_API_VERSION}/graphql.json`;
  return async function admin<T>(
    query: string,
    variables: Record<string, unknown>,
  ): Promise<AdminResult<T>> {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': await adminToken(credentials, domain),
      },
      body: JSON.stringify({query, variables}),
    });
    if (response.status === 401) minted = undefined;
    return (await response.json()) as AdminResult<T>;
  };
}

type UserErrors = {field?: string[] | null; message: string}[];

// Admin API documents. Deliberately untagged: `#graphql` would send them
// through Storefront API codegen, which rejects Admin types.

const CREATE_SUBMISSION = `
  mutation CreateSubmission($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject { id }
      userErrors { field message }
    }
  }
`;

const CREATE_SUBSCRIBER = `
  mutation CreateSubscriber($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`;

const FIND_CUSTOMER = `
  query FindCustomer($email: String!) {
    customerByIdentifier(identifier: {emailAddress: $email}) { id }
  }
`;

const RESUBSCRIBE = `
  mutation Resubscribe(
    $id: ID!
    $tags: [String!]!
    $consent: CustomerEmailMarketingConsentUpdateInput!
  ) {
    tagsAdd(id: $id, tags: $tags) { userErrors { field message } }
    customerEmailMarketingConsentUpdate(input: $consent) {
      userErrors { field message }
    }
  }
`;

/**
 * Durable store: one metaobject per submission, readable in Shopify admin
 * under Content → Metaobjects (msc_contact_message, msc_town_request,
 * msc_subscriber).
 *
 * A Postcards signup is also made a Shopify customer subscribed to email
 * marketing, tagged by source and region. That is what lets Shopify Email's
 * "welcome new subscriber" automation deliver the POSTCARDS10 code the
 * signup modal promises, and lets region waitlists be emailed as segments.
 *
 * Engages only when Admin credentials are in the Oxygen environment (see
 * getSubmissionStore). Without them we fall back to the logging store above,
 * which is what a local `h2 dev` session gets.
 */
function makeMetaobjectStore(
  credentials: AdminCredentials,
  domain: string,
): SubmissionStore {
  const admin = makeAdminClient(credentials, domain);

  function failed(result: AdminResult<unknown>, errors?: UserErrors) {
    return Boolean(
      (Array.isArray(result.errors) ? result.errors.length : result.errors) ||
        errors?.length,
    );
  }

  async function create(
    type: string,
    fields: Record<string, string | undefined>,
    logLabel: string,
    raw: unknown,
  ): Promise<void> {
    try {
      const result = await admin<{
        metaobjectCreate?: {userErrors?: UserErrors};
      }>(CREATE_SUBMISSION, {
        metaobject: {
          type,
          fields: Object.entries(fields)
            .filter(([, value]) => value != null && value !== '')
            .map(([key, value]) => ({key, value: String(value)})),
        },
      });
      if (failed(result, result.data?.metaobjectCreate?.userErrors)) {
        throw new Error(
          JSON.stringify(
            result.errors ?? result.data?.metaobjectCreate?.userErrors,
          ),
        );
      }
    } catch (error) {
      // A lost message is worse than a slow one, but we cannot fail the
      // customer's submission either — log it so the Oxygen drain still has
      // it, and let the form report success.
      console.error(`[msc:${logLabel}] metaobject write failed`, error);
      console.log(`[msc:${logLabel}] ${JSON.stringify(raw)}`);
    }
  }

  async function subscribe(subscriber: Subscriber): Promise<void> {
    const tags = [
      'postcards',
      `source:${subscriber.source}`,
      ...(subscriber.tags ?? []),
    ];
    const consent = {
      marketingState: 'SUBSCRIBED',
      marketingOptInLevel: 'SINGLE_OPT_IN',
      consentUpdatedAt: subscriber.submittedAt,
    };
    try {
      const created = await admin<{
        customerCreate?: {customer?: {id: string}; userErrors?: UserErrors};
      }>(CREATE_SUBSCRIBER, {
        input: {email: subscriber.email, tags, emailMarketingConsent: consent},
      });
      const errors = created.data?.customerCreate?.userErrors ?? [];
      if (!failed(created, errors)) return;

      // Already a customer (a past buyer, or a second signup): opt them in
      // and add the new tags rather than failing. An exact lookup, not
      // customer search — search lags creation by several seconds.
      const found = await admin<{customerByIdentifier?: {id: string} | null}>(
        FIND_CUSTOMER,
        {email: subscriber.email},
      );
      const id = found.data?.customerByIdentifier?.id;
      if (!id) throw new Error(JSON.stringify(created.errors ?? errors));
      const updated = await admin<Record<string, {userErrors?: UserErrors}>>(
        RESUBSCRIBE,
        {
          id,
          tags,
          consent: {customerId: id, emailMarketingConsent: consent},
        },
      );
      const updateErrors = Object.values(updated.data ?? {}).flatMap(
        (r) => r.userErrors ?? [],
      );
      if (failed(updated, updateErrors)) {
        throw new Error(JSON.stringify(updated.errors ?? updateErrors));
      }
    } catch (error) {
      console.error('[msc:subscriber] customer subscribe failed', error);
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
    async addSubscriber(subscriber) {
      await Promise.all([
        create(
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
        ),
        subscribe(subscriber),
      ]);
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

/** The Oxygen variables the durable store reads. All optional. */
export interface SubmissionEnv {
  PUBLIC_STORE_DOMAIN?: string;
  /** Dev Dashboard app credentials — preferred; tokens are minted and refreshed. */
  SHOPIFY_ADMIN_CLIENT_ID?: string;
  SHOPIFY_ADMIN_CLIENT_SECRET?: string;
  /** A non-expiring Admin token from a legacy custom app. */
  PRIVATE_ADMIN_API_TOKEN?: string;
}

/**
 * Pass the worker env (`context.env`) to get the durable store. Called
 * without one — or without Admin credentials configured — you get the
 * in-memory logger, so local development needs no secrets.
 */
export function getSubmissionStore(env?: SubmissionEnv): SubmissionStore {
  const domain = env?.PUBLIC_STORE_DOMAIN;
  const credentials: AdminCredentials | undefined =
    env?.SHOPIFY_ADMIN_CLIENT_ID && env.SHOPIFY_ADMIN_CLIENT_SECRET
      ? {
          kind: 'client',
          clientId: env.SHOPIFY_ADMIN_CLIENT_ID,
          clientSecret: env.SHOPIFY_ADMIN_CLIENT_SECRET,
        }
      : env?.PRIVATE_ADMIN_API_TOKEN
        ? {kind: 'token', token: env.PRIVATE_ADMIN_API_TOKEN}
        : undefined;
  if (credentials && domain) return makeMetaobjectStore(credentials, domain);
  store ??= makeStore();
  return store;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
