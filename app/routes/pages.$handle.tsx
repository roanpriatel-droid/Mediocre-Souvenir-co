import {Link, redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/pages.$handle';
import {Reveal} from '~/components/Reveal';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {SITE_NAME} from '~/lib/seo';

/**
 * Shopify CMS pages.
 *
 * Every page this store actually has is a real route with real components, so
 * the common /pages/* handles forward to their local equivalent rather than
 * duplicating the content in Shopify admin. The Storefront query stays as a
 * fallback: if someone does publish a page in admin later, it renders here in
 * brand styling instead of 404ing.
 */

/** Conventional Shopify handles → the page that actually holds that content. */
const LOCAL_EQUIVALENTS: Record<string, string> = {
  about: '/about',
  'about-us': '/about',
  contact: '/contact',
  'contact-us': '/contact',
  faq: '/faq',
  faqs: '/faq',
  'frequently-asked-questions': '/faq',
  'size-guide': '/size-guide',
  sizing: '/size-guide',
  'size-chart': '/size-guide',
  care: '/care',
  'care-guide': '/care',
  materials: '/materials',
  fabric: '/materials',
  lookbook: '/lookbook',
  journal: '/journal',
  blog: '/journal',
  shipping: '/policies/shipping-policy',
  'shipping-policy': '/policies/shipping-policy',
  returns: '/policies/refund-policy',
  'return-policy': '/policies/refund-policy',
  privacy: '/policies/privacy-policy',
  terms: '/policies/terms-of-service',
  accessibility: '/policies/accessibility',
  'request-your-town': '/request-a-town',
  search: '/search',
};

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.page.title ?? 'Page'} | ${SITE_NAME}`},
  ...(data?.page.seo?.description
    ? [{name: 'description', content: data.page.seo.description}]
    : []),
];

export async function loader({context, request, params}: Route.LoaderArgs) {
  const handle = params.handle;
  if (!handle) {
    throw new Response('Missing page handle', {status: 404});
  }

  const local = LOCAL_EQUIVALENTS[handle];
  if (local) {
    throw redirect(local, 301);
  }

  const {page} = await context.storefront.query(PAGE_QUERY, {
    variables: {handle},
  });

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: page});

  return {page};
}

export default function Page() {
  const {page} = useLoaderData<typeof loader>();

  return (
    <div>
      <header className="article-header">
        <span className="msc-kicker">From the shop</span>
        <h1>{page.title}</h1>
      </header>
      <div className="article-body">
        <Reveal>
          <div
            className="msc-prose policy-body"
            dangerouslySetInnerHTML={{__html: page.body}}
          />
        </Reveal>
        <Reveal>
          <div className="policy-footer">
            <nav className="policy-nav" aria-label="Elsewhere on the site">
              <Link to="/shop">Shop</Link>
              <Link to="/about">About</Link>
              <Link to="/faq">FAQ</Link>
              <Link to="/contact">Contact</Link>
            </nav>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
` as const;
