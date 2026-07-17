import {Link} from 'react-router';
import type {Route} from './+types/journal._index';
import {ARTICLES} from '~/lib/journal';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = () => [
  {title: `The Journal — Notes from Overlooked Places | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'Field notes from Mediocre Souvenir Co. — on water towers, heavyweight ' +
      'cotton, overlooked towns, and how to wear a souvenir with quiet pride.',
  },
];

export default function JournalIndex() {
  return (
    <div className="msc-page" style={{paddingBottom: '88px'}}>
      <div className="province-header">
        <span className="msc-kicker">Field notes</span>
        <h1>The Journal</h1>
        <p className="province-copy">
          Occasional writing on towns, cotton, and the ethics of souvenirs.
          Published when there is something to say, which is not constantly.
        </p>
      </div>
      <div className="journal-grid">
        {ARTICLES.map((article) => (
          <Link
            key={article.slug}
            className="journal-card"
            to={`/journal/${article.slug}`}
            prefetch="intent"
          >
            <span className="msc-kicker">
              {new Date(article.date).toLocaleDateString('en-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}{' '}
              · {article.readingMinutes} min
            </span>
            <h3>{article.title}</h3>
            <p className="journal-card-dek">{article.dek}</p>
            <span className="msc-kicker msc-kicker--navy">Read →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
