import {Link} from 'react-router';
import type {Route} from './+types/our-story';
import {BadgeLogo} from '~/components/Brand';
import {Reveal} from '~/components/Reveal';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `Our Story — Why Any Of This Exists | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'Founded on the belief that every town deserves a souvenir, even the ' +
      'ones that don’t. How Mediocre Souvenir Co. came to commemorate the ' +
      'places other gift shops drove past.',
  },
  {property: 'og:title', content: `Our Story | ${SITE_NAME}`},
  {
    property: 'og:description',
    content: 'Every town deserves a souvenir. Even the ones that don’t.',
  },
  {tagName: 'link', rel: 'canonical', href: `${data?.origin ?? ''}/our-story`},
];

const MILESTONES = [
  {
    year: '1978',
    label: 'The year we are pretending it is',
    body: 'Every design passes one test: would a sincere gift shop in this town have done it this way, with the type it had, in the colours it could get.',
  },
  {
    year: '2026',
    label: 'Founded, actually',
    body: 'Two people, a heavyweight blank, and a list of towns nobody had printed a shirt for. The list was longer than expected. It is still growing.',
  },
  {
    year: 'Now',
    label: 'Sixty-three regions',
    body: 'Two thousand one hundred and fifty souvenirs across every province, territory and state. Not one of the towns is famous. That was the entire specification.',
  },
];

export async function loader({request}: Route.LoaderArgs) {
  return {origin: new URL(request.url).origin};
}

export default function OurStory() {
  return (
    <div>
      <header className="article-header">
        <BadgeLogo size={150} />
        <span className="msc-kicker">Our story</span>
        <h1>Every town deserves a souvenir. Even the ones that don&rsquo;t.</h1>
        <p style={{fontSize: '18px', maxWidth: '54ch'}}>
          That is the whole belief. Everything else — the blanks, the fade, the
          sixty-three collections — is just the paperwork of taking it
          seriously.
        </p>
      </header>

      <div className="article-body">
        <Reveal>
          <div className="msc-prose">
            <p>
              The souvenir industry made a decision at some point, quietly and
              without a vote, that certain places were worth commemorating and
              the rest were worth driving through. Waterfalls got shirts.
              Mountains got shirts. A town of eleven thousand with a hockey
              rink, a contested opinion about pizza, and a hundred years of
              people being born in it got a gas station.
            </p>
            <p>
              We disagree with the second half of that decision. Not
              indignantly — indignation is exhausting and nobody asked. We
              disagree the way you disagree with a bad filing system: by
              quietly building a better one and putting everything in it.
            </p>

            <h2>The rule we do not break</h2>
            <p>
              Never mean toward the places. The humour is entirely in the
              sincerity. A commemorative garment for a town of 11,942, produced
              with total seriousness, is funnier and truer than any joke about
              the town could be. If a design would make a local wince, it does
              not get printed. If it would make a local nod slowly, it ships.
            </p>
            <p>
              This is not a rule about taste. It is a rule about who we are
              making these for. The answer is: the people from there, and the
              people who are about to admit they are from there.
            </p>

            <h2>Why everything looks thirty years old</h2>
            <p>
              Because a souvenir that looks new is a product, and a souvenir
              that looks found is a memory. Heavyweight garment-dyed blanks
              that were faded in the dye tank rather than in Photoshop. Prints
              that sit a hair off-register. A palette that was brighter once
              and has since calmed down. If it looks designed this year, it is
              wrong and we start again.
            </p>

            <h2>How a town gets in</h2>
            <p>
              Somebody asks. That is the entire mechanism. Every region is
              open, but no catalogue of 2,150 shirts covers every town in North
              America — so the gaps get filled in the order people name them.{' '}
              <Link to="/request-a-town">Nominate your hometown</Link> and it
              goes into the next batch. The catalogue is written by homesick
              people, which we consider the correct authorship.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <ol className="story-timeline">
            {MILESTONES.map((item) => (
              <li key={item.year}>
                <span className="story-year">{item.year}</span>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal>
          <div className="msc-prose" style={{marginTop: '36px'}}>
            <p>
              Every shirt ships with a{' '}
              <Link to="/certificate">Certificate of Mediocre Authenticity</Link>
              , which makes no claims about the town&rsquo;s significance and
              is signed anyway. It is the most honest document in retail.
            </p>
            <span className="msc-marker">you were somewhere.</span>
          </div>
        </Reveal>
      </div>

      <section className="msc-section msc-page" style={{paddingBottom: '80px'}}>
        <Reveal>
          <div className="msc-form-success">
            <h2>Start with your own town.</h2>
            <p style={{maxWidth: '46ch'}}>
              It is on the board, or it is on the waitlist. Both are real
              places to be.
            </p>
            <div className="route-error-actions">
              <Link className="msc-button" to="/towns">
                The directory
              </Link>
              <Link className="msc-button msc-button--ghost" to="/request-a-town">
                Nominate a town
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
