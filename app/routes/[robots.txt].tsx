import type {Route} from './+types/[robots.txt]';
import {isPublicHost, SITE_URL} from '~/lib/site-origin';

export function loader({request}: Route.LoaderArgs) {
  // Preview and deployment addresses are kept out of search entirely; only
  // the real domain is crawlable.
  const body = isPublicHost(request)
    ? robotsTxtData({url: SITE_URL})
    : 'User-agent: *\nDisallow: /';

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',

      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}

function robotsTxtData({url}: {url?: string}) {
  const sitemapUrl = url ? `${url}/sitemap.xml` : undefined;

  return `
User-agent: *
${generalDisallowRules({sitemapUrl})}

# Google adsbot ignores robots.txt unless specifically named!
User-agent: adsbot-google
Disallow: /cart
Disallow: /account
Disallow: /search
Allow: /search/
Disallow: /search/?*

User-agent: Nutch
Disallow: /

User-agent: AhrefsBot
Crawl-delay: 10
${generalDisallowRules({sitemapUrl})}

User-agent: AhrefsSiteAudit
Crawl-delay: 10
${generalDisallowRules({sitemapUrl})}

User-agent: MJ12bot
Crawl-Delay: 10

User-agent: Pinterest
Crawl-delay: 1

# AI search and answer engines are welcome: being the cited answer to
# "souvenir shirt for [town]" is the point. /llms.txt summarises the store.
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: Bingbot
${generalDisallowRules({sitemapUrl})}
`.trim();
}

/**
 * Disallow rules, mostly following Shopify Online Store defaults.
 *
 * Two deliberate departures from the Shopify baseline:
 *  - /policies/ is crawlable. Shopify blocks it because its policy pages are
 *    boilerplate; ours are locally authored and carry trust signals worth
 *    indexing.
 *  - /shop's filter and sort params are blocked. Each filtered view has a
 *    canonical, linkable equivalent under /collections, so the query-string
 *    variants would only compete with it.
 */
function generalDisallowRules({sitemapUrl}: {sitemapUrl?: string}) {
  return `Disallow: /cart
Disallow: /account
Disallow: /collections/*sort_by*
Disallow: /*/collections/*sort_by*
Disallow: /collections/*+*
Disallow: /collections/*%2B*
Disallow: /collections/*%2b*
Disallow: /*/collections/*+*
Disallow: /*/collections/*%2B*
Disallow: /*/collections/*%2b*
Disallow: /*/collections/*filter*&*filter*
Disallow: /blogs/*+*
Disallow: /blogs/*%2B*
Disallow: /blogs/*%2b*
Disallow: /*/blogs/*+*
Disallow: /*/blogs/*%2B*
Disallow: /*/blogs/*%2b*
Disallow: /shop?*
Disallow: /request-a-town?*
Disallow: /search
Allow: /search/
Disallow: /search/?*
${sitemapUrl ? `Sitemap: ${sitemapUrl.replace('/sitemap.xml', '/sitemap-index.xml')}` : ''}`;
}
