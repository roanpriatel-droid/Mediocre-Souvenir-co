/**
 * Locally-authored store policies.
 *
 * The Shopify Storefront API is the canonical home for policies on a live
 * store, but the catalog is local while the real store is being set up and
 * mock.shop returns no policy documents at all — so every /policies/* link in
 * the footer 404'd. These documents are the source of truth today.
 *
 * When the real store is linked, paste each body into Shopify admin →
 * Settings → Policies and the route will prefer the Shopify copy
 * automatically (see app/routes/policies.$handle.tsx). Nothing else changes.
 *
 * NOTE: written to be accurate to how the store actually operates — they have
 * not been reviewed by a lawyer. See NEEDS_INPUT.md before launch.
 */

export interface PolicySection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface PolicyDoc {
  /** URL handle — matches Shopify's own policy handles. */
  handle: string;
  /** Full document title, used as the H1. */
  title: string;
  /** Short label for the policy index and footer. */
  navLabel: string;
  kicker: string;
  /** Deadpan one-line lead under the H1. */
  lead: string;
  /** Meta description. */
  description: string;
  sections: PolicySection[];
}

/** When these documents were last written. Shown on every policy page. */
export const POLICY_UPDATED = '2026-07-25';

export const POLICY_UPDATED_LABEL = 'July 25, 2026';

export const SUPPORT_EMAIL = 'hello@mediocresouvenir.co';

const shipping: PolicyDoc = {
  handle: 'shipping-policy',
  title: 'Shipping Policy',
  navLabel: 'Shipping',
  kicker: 'The fine print',
  lead:
    'Every shirt is printed after you order it. That is slower than a warehouse, ' +
    'and it is the whole point.',
  description:
    'Shipping times, rates, and tracking for Mediocre Souvenir Co. Printed to ' +
    'order in North America — free shipping on orders over $75 in Canada and ' +
    'the US.',
  sections: [
    {
      heading: 'Where we ship',
      paragraphs: [
        'We ship to street addresses in Canada and the United States. We do not ' +
          'currently ship anywhere else, which is consistent with a company that ' +
          'makes souvenirs for places most people drive past.',
      ],
    },
    {
      heading: 'How long it takes',
      paragraphs: [
        'Nothing sits in a warehouse waiting for you. Each shirt is printed to ' +
          'order, so allow 5–10 business days for printing before the parcel ' +
          'moves, then transit on top of that:',
      ],
      bullets: [
        'Printing: 5–10 business days from the time the order is placed.',
        'Standard transit: 3–8 business days within Canada or within the US.',
        'Cross-border transit: 6–12 business days, customs permitting.',
        'Express transit: 2–3 business days, where offered at checkout.',
      ],
    },
    {
      paragraphs: [
        'Orders placed on a weekend or a statutory holiday start their clock on ' +
          'the next business day. Genuine takes time.',
      ],
    },
    {
      heading: 'What it costs',
      bullets: [
        'Free standard shipping on orders over $75 CAD in Canada and over $75 USD in the United States.',
        'Below that threshold, a flat standard rate is calculated at checkout before you pay.',
        'Express rates, where available, are quoted at checkout.',
      ],
    },
    {
      heading: 'Duties and taxes',
      paragraphs: [
        'Orders are printed and dispatched within North America, so a Canadian ' +
          'order shipping inside Canada and a US order shipping inside the US ' +
          'clear no border. Applicable sales tax is calculated at checkout.',
        'On the occasional cross-border parcel, the recipient is responsible for ' +
          'any duties or import fees the carrier collects. We do not mark parcels ' +
          'as gifts and we do not understate their value.',
      ],
    },
    {
      heading: 'Tracking',
      paragraphs: [
        'A tracking number is emailed when the parcel is handed to the carrier. ' +
          'Tracking can take a day to start reporting movement, which is normal ' +
          'and not a reason to worry yet.',
      ],
    },
    {
      heading: 'Lost, late, and damaged parcels',
      paragraphs: [
        'If tracking has not moved in seven business days, write to us at ' +
          `${SUPPORT_EMAIL} and we will open a trace with the carrier. If a ` +
          'parcel is confirmed lost, we reprint and reship it at our cost.',
        'If a shirt arrives damaged or misprinted, send us a photograph within 30 ' +
          'days and we will replace it. You do not need to return the damaged one; ' +
          'it has already been through enough.',
      ],
    },
    {
      heading: 'Addresses',
      paragraphs: [
        'We print the address you give us. If it is wrong, tell us within 24 hours ' +
          'of ordering and we will correct it before the shirt goes to press. After ' +
          'that the parcel is in the carrier’s hands and a returned-to-sender ' +
          'parcel has to be reshipped at your cost.',
      ],
    },
  ],
};

const refund: PolicyDoc = {
  handle: 'refund-policy',
  title: 'Return & Refund Policy',
  navLabel: 'Returns',
  kicker: 'The fine print',
  lead: 'Thirty days, no interrogation.',
  description:
    'Mediocre Souvenir Co. returns and refunds: 30 days from delivery, ' +
    'exchanges for size, and how to start a return. No restocking fees.',
  sections: [
    {
      heading: 'The short version',
      paragraphs: [
        'If the shirt is not right, send it back within 30 days of delivery in ' +
          'wearable condition and we refund it. We do not ask why, we do not charge ' +
          'a restocking fee, and we do not make it a whole thing.',
      ],
    },
    {
      heading: 'What “wearable condition” means',
      bullets: [
        'Unworn beyond trying it on, unwashed, and free of smoke, scent, or pet hair.',
        'Tags and packaging are helpful but not required — we know what we printed.',
      ],
    },
    {
      heading: 'How to start a return',
      paragraphs: [
        `Write to ${SUPPORT_EMAIL} with your order number and which shirt is ` +
          'going back. We reply within two business days with a return address and ' +
          'instructions.',
        'Return shipping is paid by you unless the shirt arrived damaged, ' +
          'misprinted, or was not the shirt you ordered — in those cases we cover ' +
          'it and you do not need to send anything back.',
      ],
    },
    {
      heading: 'Refunds',
      paragraphs: [
        'Refunds are issued to the original payment method within five business ' +
          'days of the return arriving. Your bank then takes as long as your bank ' +
          'takes. Original shipping charges are refunded only when the return is ' +
          'our error.',
        'If a multi-shirt order drops below a discount tier because of a return, ' +
          'the refund is calculated on the discounted price actually paid for that ' +
          'shirt, and the remaining shirts keep the discount they qualified for at ' +
          'the time of purchase.',
      ],
    },
    {
      heading: 'Exchanges',
      paragraphs: [
        'Size exchanges work the same way: send the shirt back and we ship the ' +
          'right size once it is on its way. Because everything is printed to ' +
          'order, an exchange takes another 5–10 business days to print. If you ' +
          'need it faster, order the new size and return the old one separately.',
        'Consult the size guide before ordering — it exists to make this ' +
          'paragraph unnecessary.',
      ],
    },
    {
      heading: 'Cancellations',
      paragraphs: [
        'Orders can be cancelled for a full refund any time before the shirt goes ' +
          'to press, which is usually within 24 hours of ordering. After that it is ' +
          'a physical object with your town on it, and the return policy applies.',
      ],
    },
    {
      heading: 'Things that are not defects',
      paragraphs: [
        'Garment-dyed cotton is dyed after the shirt is sewn, so colour varies ' +
          'slightly between shirts and along the seams. Prints sit a hair ' +
          'off-register on purpose. The cotton relaxes about half a size in the ' +
          'first month of wear. All of this is the arrangement, not a fault — but ' +
          'if a shirt is not what you hoped for, the 30 days cover that too.',
      ],
    },
  ],
};

const privacy: PolicyDoc = {
  handle: 'privacy-policy',
  title: 'Privacy Policy',
  navLabel: 'Privacy',
  kicker: 'The fine print',
  lead:
    'We collect what an order needs and what a waitlist needs. We are not ' +
    'interested in the rest of your life.',
  description:
    'What Mediocre Souvenir Co. collects, why, who processes it, and how to ' +
    'have it deleted. No sale of personal information.',
  sections: [
    {
      heading: 'What we collect',
      bullets: [
        'Order information: name, shipping address, email, and order contents. Needed to print and deliver a shirt.',
        'Payment information: handled entirely by Shopify and its payment processors. We never see or store your full card number.',
        'Waitlist submissions: the town you requested, the province or state, your email, and any note you added.',
        'Newsletter signups: your email address and which page you signed up from.',
        'Contact messages: your name, email, and whatever you wrote to us.',
        'Basic usage data: pages visited and referring site, collected in aggregate to understand which towns people are looking for.',
      ],
    },
    {
      heading: 'Why we collect it',
      paragraphs: [
        'To take payment, print the correct shirt, ship it to the correct address, ' +
          'answer your questions, and decide which town gets commemorated next. The ' +
          'waitlist is the entire product roadmap, so those submissions genuinely ' +
          'do get read.',
      ],
    },
    {
      heading: 'Who else touches it',
      bullets: [
        'Shopify — storefront, checkout, and order records.',
        'Our print and fulfilment partner — receives your name, address, and the design to print, and nothing else.',
        'Shipping carriers — receive your name and address so the parcel arrives.',
        'Email service — receives your email address if you signed up for Postcards From Us.',
      ],
    },
    {
      paragraphs: [
        'Each of these is a processor acting on our instructions. We do not sell ' +
          'your personal information, we do not rent mailing lists, and we do not ' +
          'share your data with advertisers.',
      ],
    },
    {
      heading: 'Cookies',
      paragraphs: [
        'The store uses cookies that are necessary to keep a cart working and a ' +
          'session logged in, plus aggregate analytics cookies to count visits. ' +
          'Blocking the analytics cookies will not break anything. Blocking the ' +
          'necessary ones will empty your cart, which seems worse for you than for ' +
          'us.',
      ],
    },
    {
      heading: 'How long we keep it',
      paragraphs: [
        'Order records are kept for seven years because tax authorities in both ' +
          'countries expect that. Waitlist and newsletter entries are kept until you ' +
          'ask us to remove them, or until the town is printed and the list has done ' +
          'its job. Contact messages are kept for two years.',
      ],
    },
    {
      heading: 'Your rights',
      paragraphs: [
        'Wherever you live, you can ask us for a copy of what we hold about you, ' +
          'ask us to correct it, or ask us to delete it. If you are in Canada this ' +
          'is PIPEDA; in the EU or UK it is the GDPR; in California it is the CCPA. ' +
          'We apply the strongest of them to everyone because maintaining three ' +
          'standards would be silly.',
        `Write to ${SUPPORT_EMAIL} and we will respond within 30 days. Newsletter ` +
          'emails also carry a one-click unsubscribe, which works immediately and ' +
          'without a guilt-trip screen.',
      ],
    },
    {
      heading: 'Children',
      paragraphs: [
        'The store is not directed at children under 13 and we do not knowingly ' +
          'collect their information.',
      ],
    },
    {
      heading: 'Changes',
      paragraphs: [
        'If this policy changes materially we will update the date at the top of ' +
          'this page and, where the change affects you, say so by email.',
      ],
    },
  ],
};

const terms: PolicyDoc = {
  handle: 'terms-of-service',
  title: 'Terms of Service',
  navLabel: 'Terms',
  kicker: 'The fine print',
  lead: 'The arrangement between you and a small company that prints town names on shirts.',
  description:
    'Terms of service for Mediocre Souvenir Co. — orders, pricing, the ' +
    'collect-more discount, intellectual property, and governing law.',
  sections: [
    {
      paragraphs: [
        'By using this site or placing an order you agree to what follows. If you ' +
          'do not agree, the correct move is not to order, and there are no hard ' +
          'feelings.',
      ],
    },
    {
      heading: 'Orders',
      paragraphs: [
        'An order is an offer to buy. It is accepted when we send the confirmation ' +
          'email. We may decline an order — for a suspected fraudulent payment, an ' +
          'undeliverable address, or a pricing error — and if we do, you are ' +
          'refunded in full and told why.',
      ],
    },
    {
      heading: 'Pricing and the discount ladder',
      bullets: [
        'Shirts are $36 CAD in Canada and $36 USD in the United States. Parity is deliberate.',
        'Two or more shirts save 15%; three or more save 20%. It applies automatically at checkout, mixes and matches across any towns, and needs no code.',
        'Prices exclude tax and shipping, both shown before you pay.',
        'Prices can change, but never for an order already confirmed.',
      ],
    },
    {
      heading: 'The product',
      paragraphs: [
        'Every shirt is a Comfort Colors 1717 garment-dyed heavyweight, printed to ' +
          'order. Shirts are made to look worn: colour varies between garments, ' +
          'prints sit slightly off-register, and the cotton relaxes with wear. ' +
          'Screen images are representations of a printed garment, not photographs ' +
          'of the exact shirt you will receive.',
      ],
    },
    {
      heading: 'Towns, facts, and names',
      paragraphs: [
        'Our designs commemorate real places. Populations, founding years, and ' +
          'landmarks are drawn from public records and are approximate by nature — ' +
          'a census is a snapshot, not a promise. If we have a fact wrong about ' +
          `your town, write to ${SUPPORT_EMAIL} and we will correct it; getting a ` +
          'town right matters more to us than being first.',
        'We are not affiliated with, endorsed by, or speaking for any municipality, ' +
          'and nothing we print is an official emblem of any town. Municipal crests, ' +
          'flags, and logos are never reproduced.',
      ],
    },
    {
      heading: 'Intellectual property',
      paragraphs: [
        'The artwork, layouts, photographs, and written material on this site ' +
          'belong to Mediocre Souvenir Co. Buying a shirt buys you the shirt: wear ' +
          'it, gift it, inherit it out, sell it secondhand in thirty years for more ' +
          'than we charged. It does not license the artwork for reproduction or ' +
          'resale as a design.',
        'Town names, geographic facts, and the general concept of a souvenir ' +
          'belong to everybody.',
      ],
    },
    {
      heading: 'Submissions',
      paragraphs: [
        'When you send us a town request, a note, or a photograph, you give us ' +
          'permission to use it to research and make products, and to quote it in ' +
          'our own material with your first name and town. If you would rather we ' +
          'did not, say so in the message and we will not.',
      ],
    },
    {
      heading: 'Accounts',
      paragraphs: [
        'You are responsible for keeping your account credentials to yourself and ' +
          'for anything done through your account. Tell us promptly if you think ' +
          'someone else is using it.',
      ],
    },
    {
      heading: 'Liability',
      paragraphs: [
        'We stand behind the garment: if it is defective, we replace or refund it, ' +
          'and the return policy covers the rest. Beyond that, and to the extent ' +
          'the law allows, our total liability for any claim is limited to what you ' +
          'paid for the order in question. Nothing here limits liability that ' +
          'cannot legally be limited, including your statutory consumer rights.',
      ],
    },
    {
      heading: 'Governing law',
      paragraphs: [
        'These terms are governed by the laws of the Province of British Columbia ' +
          'and the federal laws of Canada that apply there. If you are a consumer ' +
          'elsewhere, you keep the protections of your own local law.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [
        `Questions about these terms go to ${SUPPORT_EMAIL}, and are answered by a ` +
          'person within two business days.',
      ],
    },
  ],
};

const accessibility: PolicyDoc = {
  handle: 'accessibility',
  title: 'Accessibility Statement',
  navLabel: 'Accessibility',
  kicker: 'The fine print',
  lead:
    'A shirt for an overlooked town should not be sold on a site that overlooks ' +
    'people.',
  description:
    'How Mediocre Souvenir Co. approaches accessibility: WCAG 2.1 AA as the ' +
    'target, what we have done, and how to report a barrier.',
  sections: [
    {
      heading: 'Our target',
      paragraphs: [
        'We build against WCAG 2.1 Level AA. We do not claim perfect conformance — ' +
          'that would be the kind of confident overstatement this company exists to ' +
          'avoid — but it is the standard every page is measured against.',
      ],
    },
    {
      heading: 'What is in place',
      bullets: [
        'Semantic headings and landmarks, and a skip link to the main content on every page.',
        'Visible focus outlines on every interactive element, and full keyboard operation including the search, filters, and cart.',
        'Text and interface colours checked against the AA contrast threshold on the cream background.',
        'Descriptive alternative text on product artwork, generated from the town it commemorates.',
        'All motion — the scroll reveals in particular — disabled automatically when your system asks for reduced motion.',
        'Body text at 17px with a narrow measure, and layouts that reflow to 400% zoom without horizontal scrolling.',
        'Forms with real labels, and errors written in words rather than colour alone.',
      ],
    },
    {
      heading: 'Known limitations',
      paragraphs: [
        'Product artwork is generated rather than photographed, so fine print ' +
          'detail on a shirt may be hard to make out at small sizes; the full ' +
          'design is described in the alt text and the certificate panel. Checkout ' +
          'is hosted by Shopify and follows their accessibility work rather than ' +
          'ours.',
      ],
    },
    {
      heading: 'Reporting a barrier',
      paragraphs: [
        `If something on this site keeps you from ordering, write to ${SUPPORT_EMAIL} ` +
          'with the page and what happened. We treat access barriers as defects, ' +
          'not suggestions, and we will reply within two business days.',
      ],
    },
  ],
};

export const POLICIES: PolicyDoc[] = [
  shipping,
  refund,
  privacy,
  terms,
  accessibility,
];

/**
 * Friendly aliases → canonical handles, so /policies/returns and
 * /policies/shipping resolve rather than 404. Shopify's own handles are the
 * canonical form because they are what a linked store will serve.
 */
const ALIASES: Record<string, string> = {
  shipping: 'shipping-policy',
  delivery: 'shipping-policy',
  returns: 'refund-policy',
  refunds: 'refund-policy',
  'return-policy': 'refund-policy',
  privacy: 'privacy-policy',
  terms: 'terms-of-service',
  tos: 'terms-of-service',
  'terms-of-use': 'terms-of-service',
  'accessibility-statement': 'accessibility',
};

export function getPolicy(handle: string): PolicyDoc | undefined {
  const canonical = ALIASES[handle] ?? handle;
  return POLICIES.find((policy) => policy.handle === canonical);
}

/** Non-empty when `handle` was an alias — the route redirects to the canonical URL. */
export function canonicalPolicyHandle(handle: string): string | undefined {
  const canonical = ALIASES[handle];
  return canonical && canonical !== handle ? canonical : undefined;
}

/** Flattens a policy to plain text for structured data and Shopify seeding. */
export function policyPlainText(policy: PolicyDoc): string {
  return policy.sections
    .flatMap((section) => [
      section.heading,
      ...(section.paragraphs ?? []),
      ...(section.bullets ?? []),
    ])
    .filter(Boolean)
    .join('\n\n');
}
