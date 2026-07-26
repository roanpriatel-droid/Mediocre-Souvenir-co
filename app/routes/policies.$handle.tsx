import {Link, redirect, useLoaderData} from 'react-router';
import {useNonce} from '@shopify/hydrogen';
import type {Route} from './+types/policies.$handle';
import {type Shop} from '@shopify/hydrogen/storefront-api-types';
import {Reveal} from '~/components/Reveal';
import {
  canonicalPolicyHandle,
  getPolicy,
  policyPlainText,
  POLICIES,
  POLICY_UPDATED,
  POLICY_UPDATED_LABEL,
  SUPPORT_EMAIL,
  type PolicyDoc,
} from '~/lib/policies';
import {SITE_NAME} from '~/lib/seo';

/**
 * Policy pages, local-first.
 *
 * The documents in app/lib/policies.ts are the source of truth while the
 * catalog is local — mock.shop serves no policies, so querying Shopify alone
 * meant every footer policy link 404'd. When a real store is linked and its
 * admin policies are filled in, the Shopify copy wins automatically: the
 * loader asks for it, and falls back to the local document when it is absent.
 */

type SelectedPolicies = keyof Pick<
  Shop,
  'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy'
>;

/** Only these four exist in Shopify admin; `accessibility` is ours alone. */
const SHOPIFY_BACKED: Record<string, SelectedPolicies> = {
  'privacy-policy': 'privacyPolicy',
  'shipping-policy': 'shippingPolicy',
  'terms-of-service': 'termsOfService',
  'refund-policy': 'refundPolicy',
};

export const meta: Route.MetaFunction = ({data}) => {
  if (!data?.policy) return [{title: `Policies | ${SITE_NAME}`}];
  return [
    {title: `${data.policy.title} | ${SITE_NAME}`},
    {name: 'description', content: data.policy.description},
    {tagName: 'link', rel: 'canonical', href: `${data.origin}/policies/${data.policy.handle}`},
  ];
};

export async function loader({params, context, request}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Response('No handle was passed in', {status: 404});
  }

  const canonical = canonicalPolicyHandle(params.handle);
  if (canonical) {
    throw redirect(`/policies/${canonical}`, 301);
  }

  const policy = getPolicy(params.handle);
  if (!policy) {
    throw new Response('Could not find the policy', {status: 404});
  }

  const shopifyBody = await loadShopifyBody(policy.handle, context);

  return {
    policy,
    shopifyBody,
    origin: new URL(request.url).origin,
  };
}

/**
 * Returns the Shopify-hosted body when a real store has one, else null.
 * Errors are swallowed on purpose: a policy page must render even when the
 * Storefront API is unreachable or the shop has no policies configured.
 */
async function loadShopifyBody(
  handle: string,
  context: Route.LoaderArgs['context'],
): Promise<string | null> {
  const policyName = SHOPIFY_BACKED[handle];
  if (!policyName) return null;

  try {
    const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
      variables: {
        privacyPolicy: false,
        shippingPolicy: false,
        termsOfService: false,
        refundPolicy: false,
        [policyName]: true,
        language: context.storefront.i18n?.language,
      },
    });
    const body = data.shop?.[policyName]?.body?.trim();
    return body ? body : null;
  } catch (error) {
    console.error('[msc:policy] Shopify policy lookup failed', error);
    return null;
  }
}

export default function Policy() {
  const {policy, shopifyBody, origin} = useLoaderData<typeof loader>();
  const nonce = useNonce();

  return (
    <div>
      <header className="article-header">
        <span className="msc-kicker">{policy.kicker}</span>
        <h1>{policy.title}</h1>
        <p style={{fontSize: '18px', maxWidth: '52ch'}}>{policy.lead}</p>
        <p className="policy-updated">
          <time dateTime={POLICY_UPDATED}>
            Last updated {POLICY_UPDATED_LABEL}
          </time>
        </p>
      </header>

      <div className="article-body">
        <Reveal>
          {shopifyBody ? (
            <div
              className="msc-prose policy-body"
              dangerouslySetInnerHTML={{__html: shopifyBody}}
            />
          ) : (
            <PolicyBody policy={policy} />
          )}
        </Reveal>

        <Reveal>
          <div className="policy-footer">
            <p>
              Anything here that reads as unclear is our fault, not yours.{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> reaches a
              person, who answers within two business days.
            </p>
            <nav className="policy-nav" aria-label="Other policies">
              {POLICIES.filter((other) => other.handle !== policy.handle).map(
                (other) => (
                  <Link key={other.handle} to={`/policies/${other.handle}`}>
                    {other.navLabel}
                  </Link>
                ),
              )}
              <Link to="/faq">FAQ</Link>
            </nav>
          </div>
        </Reveal>
      </div>

      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: policy.title,
            url: `${origin}/policies/${policy.handle}`,
            description: policy.description,
            dateModified: POLICY_UPDATED,
            isPartOf: {'@type': 'WebSite', name: SITE_NAME, url: origin},
            publisher: {'@type': 'Organization', name: SITE_NAME, url: origin},
            text: policyPlainText(policy),
          }),
        }}
      />
    </div>
  );
}

function PolicyBody({policy}: {policy: PolicyDoc}) {
  return (
    <div className="msc-prose policy-body">
      {policy.sections.map((section, i) => (
        <section key={section.heading ?? `section-${i}`}>
          {section.heading && <h2>{section.heading}</h2>}
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.bullets && (
            <ul className="policy-list">
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
    }
  }
` as const;
