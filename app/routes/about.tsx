import {Link} from 'react-router';
import type {Route} from './+types/about';
import {BadgeLogo} from '~/components/Brand';
import {Reveal} from '~/components/Reveal';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = () => [
  {title: `About — Why We Exist | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'Mediocre Souvenir Co. makes genuine faux-vintage souvenir t-shirts ' +
      'for overlooked towns across Canada and the US, treating a town of ' +
      '12,000 with the reverence a Hawaii gift shop would. Est. 2026.',
  },
];

export default function About() {
  return (
    <div>
      <header className="article-header">
        <BadgeLogo size={150} />
        <h1>Genuine merch for overlooked places.</h1>
        <p style={{fontSize: '18px', maxWidth: '52ch'}}>
          The souvenir industry decided some places deserve merchandise and
          some places deserve to be driven through. We disagree with the
          second half.
        </p>
      </header>
      <div className="article-body">
        <Reveal>
          <div className="msc-prose">
            <p>
              Somewhere along the highway there is a gift shop for a
              waterfall, and forty minutes past it there is a town of eleven
              thousand people with a hundred-year history, a hockey team, a
              contested opinion about the best pizza, and no shirt. Mediocre
              Souvenir Co. exists because of that second place.
            </p>
            <p>
              We make souvenir t-shirts for unglamorous, overlooked,
              un-touristy towns — and we make them with the exact reverence a
              Hawaii gift shop would use. Arched lettering. Est. years.
              Landmarks, even when the landmark is a water tower. Especially
              when the landmark is a water tower.
            </p>
            <h2>The rules we work by</h2>
            <p>
              Never mean toward the places. The humor is entirely in the
              sincerity — a commemorative garment for a town of 11,942,
              produced with total seriousness, is funnier and truer than any
              joke about the town could be. If a design would make a local
              wince, it does not get printed. If it would make a local nod
              slowly, it ships.
            </p>
            <p>
              Everything looks thirty years old on purpose. Heavyweight
              garment-dyed blanks in faded colors, prints that sit a hair
              off-register, a palette that was once brighter and calmed down.
              We test every decision against one question: would a sincere
              1978 gift shop in this town have done it this way.
            </p>
            <h2>How towns get in</h2>
            <p>
              We work one region at a time — British Columbia first, then
              Alberta, then east, then south into the United States — and the{' '}
              <Link to="/request-your-town">waitlist</Link> decides the print
              order inside each region. Enough neighbours request a town and
              it gets researched, drawn, and shelved with the rest. The
              catalog is written by homesick people, which we consider the
              correct authorship.
            </p>
            <p>
              Every shirt carries a Certificate of Souvenir: town,
              approximate population, the one thing it is known for. Real
              facts about real places where people live full lives, mostly
              without incident.
            </p>
            <span className="msc-marker">you were somewhere.</span>
          </div>
        </Reveal>
      </div>
      <section className="msc-section msc-page" style={{paddingBottom: '80px'}}>
        <Reveal>
          <div className="msc-form-success">
            <h2>Start with your own town.</h2>
            <p style={{maxWidth: '44ch'}}>
              It is on the rack, or it is on the waitlist. Both are good
              places to be.
            </p>
            <div className="route-error-actions">
              <Link className="msc-button" to="/shop">
                Browse the towns
              </Link>
              <Link className="msc-button msc-button--ghost" to="/request-your-town">
                Request yours
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
