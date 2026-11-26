/**
 * The one public address of the store. Canonical links, the sitemap,
 * structured data and social previews always point here, so a visit through
 * the Oxygen preview address (…o2.myshopify.dev) or a deployment URL never
 * tells Google that the preview is the real site.
 */
export const SITE_URL = 'https://mediocresouvenir.com';

const PUBLIC_HOSTS = new Set(['mediocresouvenir.com', 'www.mediocresouvenir.com']);

function isLocal(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

/** The origin to put in canonical and absolute links. Local dev keeps its own. */
export function siteOrigin(request: Request): string {
  const {hostname, origin} = new URL(request.url);
  return isLocal(hostname) ? origin : SITE_URL;
}

/**
 * True on the real domain. Anywhere else (Oxygen previews, deployment URLs,
 * the myshopify.com address) the site asks search engines not to index it.
 */
export function isPublicHost(request: Request): boolean {
  return PUBLIC_HOSTS.has(new URL(request.url).hostname);
}
