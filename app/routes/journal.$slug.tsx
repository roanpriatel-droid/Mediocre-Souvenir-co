import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/journal.$slug';
import {useNonce} from '@shopify/hydrogen';
import {getArticle} from '~/lib/journal';
import {getTownByHandle} from '~/lib/catalog';
import {RackGrid} from '~/components/TownRackCard';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data?.article) return [{title: 'Not found'}];
  return [
    {title: `${data.article.title} | The Journal | ${SITE_NAME}`},
    {name: 'description', content: data.article.dek},
    {
      tagName: 'link',
      rel: 'canonical',
      href: `${data.origin}/journal/${data.article.slug}`,
    },
  ];
};

export async function loader({params, request}: Route.LoaderArgs) {
  const article = getArticle(params.slug ?? '');
  if (!article) throw new Response(null, {status: 404});
  const related = article.relatedHandles
    .map(getTownByHandle)
    .filter((t) => t !== undefined);
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
          {new Date(article.date).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
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
            <Link className="msc-section-note" to="/shop">
              The whole rack →
            </Link>
          </div>
          <RackGrid towns={related} />
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
            mainEntityOfPage: `${origin}/journal/${article.slug}`,
          }),
        }}
      />
    </article>
  );
}
