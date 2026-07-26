import {redirect} from 'react-router';
import type {Route} from './+types/blogs.$blogHandle.$articleHandle';
import {ARTICLES} from '~/lib/journal';

/**
 * Article-level Shopify blog URLs. When the handle matches a Journal article
 * the reader goes straight to that piece; otherwise to the Journal index,
 * which beats a 404 for a URL shape we no longer publish.
 */
export async function loader({params}: Route.LoaderArgs) {
  const handle = params.articleHandle ?? '';
  const article = ARTICLES.find((candidate) => candidate.slug === handle);
  return redirect(article ? `/journal/${article.slug}` : '/journal', 301);
}
