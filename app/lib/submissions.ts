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

let store: SubmissionStore | undefined;

export function getSubmissionStore(): SubmissionStore {
  store ??= makeStore();
  return store;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
