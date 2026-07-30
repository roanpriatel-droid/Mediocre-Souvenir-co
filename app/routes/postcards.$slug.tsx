import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/postcards.$slug';
import {useNonce} from '@shopify/hydrogen';
import {getArticle, articleDate} from '~/lib/journal';
import {productsByHandle} from '~/lib/shopify-search';
import {SouvenirGrid} from '~/components/SouvenirCard';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data?.article) return [{title: 'Not found'}];
  return [
    {title: `${data.article.title} | Postcards From Nowhere | ${SITE_NAME}`},
    {name: 'description', content: data.article.dek},
    {
      tagName: 'link',
      rel: 'canonical',
      href: `${data.origin}/postcards/${data.article.slug}`,
    },
  ];
};

export async function loader({params, request, context}: Route.LoaderArgs) {
  const article = getArticle(params.slug ?? '');
  if (!article) throw new Response(null, {status: 404});

  // Articles name towns; only the ones the store actually carries become
  // links, so editorial can mention a place without promising a product.
  const related = await productsByHandle(
    context.storefront,
    article.relatedHandles,
  );
  return {article, related, origin: new URL(request.url).origin};
}

export default function JournalArticle() {
  const {article, related, origin} = useLoaderData<typeof loader>();
  const nonce = useNonce();

  return (
    <article>
      <header className="article-header">
        <span className="msc-kicker">
          The Journal ·{' '}
          {articleDate(article.date)}
        </span>
        <h1>{article.title}</h1>
        <p style={{fontSize: '18px', maxWidth: '52ch'}}>{article.dek}</p>
      </header>
      <div className="article-body">
        <div className="msc-prose">
          {article.body.map((para, i) =>
            para.startsWith('## ') ? (
              <h2 key={i}>{para.slice(3)}</h2>
            ) : (
              <p key={i}>{para}</p>
            ),
          )}
          <span className="msc-marker">— the management</span>
        </div>
      </div>
      {related.length > 0 && (
        <section className="msc-section msc-page" aria-labelledby="mentioned">
          <div className="msc-section-rule">
            <h2 id="mentioned">Mentioned in this dispatch</h2>
            <Link className="msc-section-note" to="/collections/all-souvenirs">
              The whole rack →
            </Link>
          </div>
          <SouvenirGrid products={related} eagerCount={0} />
        </section>
      )}
      <div style={{height: '56px'}} />
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.dek,
            datePublished: article.date,
            author: {'@type': 'Organization', name: SITE_NAME},
            publisher: {'@type': 'Organization', name: SITE_NAME},
            mainEntityOfPage: `${origin}/postcards/${article.slug}`,
          }),
        }}
      />
    </article>
  );
}
