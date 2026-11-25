import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/postcards.$slug';
import {useNonce} from '@shopify/hydrogen';
import {getArticle, articleDate} from '~/lib/journal';
import {productsByHandle} from '~/lib/shopify-search';
import {SouvenirGrid} from '~/components/SouvenirCard';
import {SITE_NAME} from '~/lib/seo';
import {breadcrumbList} from '~/lib/schema';

/** Paragraph text with [label](/path) turned into internal links. */
function renderInline(text: string) {
  const parts = text.split(/(\[[^\]]+\]\(\/[^)]*\))/g);
  return parts.map((part, index) => {
    const match = /^\[([^\]]+)\]\((\/[^)]*)\)$/.exec(part);
    return match ? (
      <Link key={index} to={match[2]}>
        {match[1]}
      </Link>
    ) : (
      part
    );
  });
}

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
              <p key={i}>{renderInline(para)}</p>
            ),
          )}
          {article.faq?.length ? (
            <section aria-labelledby="article-faq">
              <h2 id="article-faq">Questions people ask</h2>
              {article.faq.map((item) => (
                <details key={item.q} className="msc-accordion">
                  <summary>{item.q}</summary>
                  <div className="msc-accordion-body">{item.a}</div>
                </details>
              ))}
            </section>
          ) : null}
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
            dateModified: article.date,
            image: `${origin}/og-default.png`,
            author: {'@id': `${origin}/#organization`},
            publisher: {'@id': `${origin}/#organization`},
            mainEntityOfPage: `${origin}/postcards/${article.slug}`,
          }),
        }}
      />
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbList(origin, [
              {name: 'Postcards From Nowhere', path: '/postcards'},
              {name: article.title, path: `/postcards/${article.slug}`},
            ]),
          ),
        }}
      />
      {article.faq?.length ? (
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: article.faq.map((item) => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: {'@type': 'Answer', text: item.a},
              })),
            }),
          }}
        />
      ) : null}
    </article>
  );
}
