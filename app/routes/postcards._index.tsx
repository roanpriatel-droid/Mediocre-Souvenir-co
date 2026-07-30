import {Link, useLoaderData} from 'react-router';
import {useNonce} from '@shopify/hydrogen';
import type {Route} from './+types/postcards._index';
import {EmailCapture} from '~/components/EmailCapture';
import {Reveal} from '~/components/Reveal';
import {ARTICLES, articleDate} from '~/lib/journal';
import {getTownByHandle} from '~/lib/catalog';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `Postcards From Nowhere — Field Notes on Overlooked Towns | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'Short faux-travel writing about the overlooked towns we commemorate — ' +
      'Toledo, Gary, Rockford and the rest of the places nobody sends a ' +
      'postcard from.',
  },
  ...(data
    ? [
        {
          tagName: 'link' as const,
          rel: 'canonical',
          href: `${data.origin}/postcards`,
        },
      ]
    : []),
];

export async function loader({request}: Route.LoaderArgs) {
  // Newest first, so the index does not depend on the order of the data file.
  const articles = [...ARTICLES]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((article) => ({
      ...article,
      relatedTowns: article.relatedHandles
        .map(getTownByHandle)
        .filter((town) => town !== undefined)
        .slice(0, 3),
    }));

  return {articles, origin: new URL(request.url).origin};
}

export default function JournalIndex() {
  const {articles, origin} = useLoaderData<typeof loader>();
  const nonce = useNonce();
  const [lead, ...rest] = articles;

  return (
    <div className="msc-page" style={{paddingBottom: '88px'}}>
      <div className="province-header">
        <span className="msc-kicker">Field notes</span>
        <h1>Postcards From Nowhere</h1>
        <p className="province-copy">
          Short dispatches from towns we actually print. Written by people who
          drove there on purpose, which is more than most travel writing can
          claim.
        </p>
      </div>

      {lead && (
        <Reveal>
          <Link className="journal-lead" to={`/postcards/${lead.slug}`} prefetch="intent">
            <div className="journal-lead-copy">
              <span className="msc-kicker msc-kicker--navy">
                Latest ·{' '}
                {articleDate(lead.date)} ·{' '}
                {lead.readingMinutes} min
              </span>
              <h2>{lead.title}</h2>
              <p>{lead.dek}</p>
              <span className="collection-card-more">Read it →</span>
            </div>
            {lead.relatedTowns.length > 0 && (
              <div className="journal-lead-towns">
                <span className="msc-label">Towns in this one</span>
                <ul>
                  {lead.relatedTowns.map((town) => (
                    <li key={town.handle}>
                      {town.city}, {town.provinceAbbrev}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Link>
        </Reveal>
      )}

      {rest.length > 0 && (
        <div className="journal-grid" style={{marginTop: '32px'}}>
          {rest.map((article, i) => (
            <Reveal key={article.slug} delay={(i % 3) as 0 | 1 | 2}>
              <Link
                className="journal-card"
                to={`/postcards/${article.slug}`}
                prefetch="intent"
              >
                <span className="msc-kicker">
                  {articleDate(article.date)}{' '}
                  · {article.readingMinutes} min
                </span>
                <h3>{article.title}</h3>
                <p className="journal-card-dek">{article.dek}</p>
                <span className="msc-kicker msc-kicker--navy">Read →</span>
              </Link>
            </Reveal>
          ))}
        </div>
      )}

      {articles.length === 0 && (
        <div className="guest-book-empty">
          <h3>Nothing written yet.</h3>
          <p>
            The first entry is being thought about. In the meantime the{' '}
            <Link to="/about">about page</Link> covers why any of this exists.
          </p>
        </div>
      )}

      <Reveal>
        <section className="journal-subscribe">
          <EmailCapture source="postcards" />
        </section>
      </Reveal>

      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'Postcards From Nowhere',
            description:
              'Field notes on overlooked towns, heavyweight cotton, and the ethics of souvenirs.',
            url: `${origin}/postcards`,
            publisher: {'@type': 'Organization', name: SITE_NAME, url: origin},
            blogPost: articles.map((article) => ({
              '@type': 'BlogPosting',
              headline: article.title,
              description: article.dek,
              datePublished: article.date,
              url: `${origin}/postcards/${article.slug}`,
              author: {'@type': 'Organization', name: SITE_NAME},
            })),
          }),
        }}
      />
    </div>
  );
}
