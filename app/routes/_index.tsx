import {Link} from 'react-router';
import type {Route} from './+types/_index';
import {BadgeLogo, MSCMonogram} from '~/components/Brand';
import {Reveal} from '~/components/Reveal';
import {TownSearch} from '~/components/TownSearch';
import {MarqueeStrip, TrustBar} from '~/components/Strips';
import {RegionBrowse} from '~/components/RegionBrowse';
import {RackGrid} from '~/components/TownRackCard';
import {CollectLadder} from '~/components/CollectLadder';
import {GuestBook, SpottedGrid} from '~/components/SocialProof';
import {EmailCapture} from '~/components/EmailCapture';
import {getMostOverlooked, getNewArrivals} from '~/lib/catalog';
import {SITE_NAME, SITE_TAGLINE} from '~/lib/seo';

export const meta: Route.MetaFunction = () => {
  return [
    {title: `${SITE_NAME} — ${SITE_TAGLINE}`},
    {
      name: 'description',
      content:
        'Faux-vintage souvenir t-shirts for overlooked towns across Canada ' +
        'and the US — garment-dyed heavyweight tees commemorating the places ' +
        'other souvenirs forgot. Now open, starting with British Columbia. ' +
        'New towns weekly.',
    },
  ];
};

export async function loader(_args: Route.LoaderArgs) {
  // The catalog is local for now (see app/lib/catalog) — no storefront
  // queries needed above the fold.
  return {
    newArrivals: getNewArrivals(),
    mostOverlooked: getMostOverlooked(),
  };
}

export default function Homepage({loaderData}: Route.ComponentProps) {
  const {newArrivals, mostOverlooked} = loaderData;
  return (
    <div className="home">
      {/* HERO — the CTA is a search field, not a shop button */}
      <section className="hero">
        <BadgeLogo size={210} className="hero-badge" />
        <h1>GENUINE MERCH FOR OVERLOOKED PLACES.</h1>
        <p className="hero-sub">
          Souvenir tees for the towns that never got one · Now open
        </p>
        <TownSearch />
      </section>

      <MarqueeStrip />

      {/* BROWSE BY REGION — the real navigation */}
      <section className="msc-section msc-page" aria-labelledby="browse-region">
        <div className="msc-section-rule">
          <h2 id="browse-region">Browse by region</h2>
          <span className="msc-section-note">
            Starting with British Columbia · Then east, then south
          </span>
        </div>
        <RegionBrowse />
      </section>

      {/* NEW ARRIVALS */}
      <section className="msc-section msc-page" aria-labelledby="new-arrivals">
        <Reveal>
          <div className="msc-section-rule">
            <h2 id="new-arrivals">New arrivals</h2>
            <Link className="msc-section-note" to="/new-arrivals">
              See all →
            </Link>
          </div>
          <RackGrid towns={newArrivals} />
        </Reveal>
      </section>

      {/* EDITORIAL STATEMENT */}
      <Reveal as="section" className="statement" delay={1}>
        <p className="msc-kicker statement-kicker">The whole idea</p>
        <h2>
          Every town is somebody&rsquo;s hometown. Most of them never got a
          souvenir.
        </h2>
        <span className="msc-marker">we&rsquo;re fixing that, alphabetically.</span>
      </Reveal>

      {/* MOST OVERLOOKED */}
      <section
        className="msc-section msc-page"
        aria-labelledby="most-overlooked"
      >
        <Reveal>
          <div className="msc-section-rule">
            <h2 id="most-overlooked">Most overlooked</h2>
            <span className="msc-section-note">
              Towns of modest renown · Curated with care
            </span>
          </div>
          <RackGrid towns={mostOverlooked} />
        </Reveal>
      </section>

      {/* POSTCARD INTERLUDE */}
      <section className="msc-section msc-page" aria-label="A note from the road">
        <Reveal delay={1}>
          <div className="postcard">
            <div className="postcard-left">
              <span className="msc-kicker">From the road</span>
              <span className="msc-marker">
                Dear whoever&rsquo;s home — stopped in Hope for gas. Stayed
                for the reasons people stay anywhere: the coffee was fine,
                the mountains were enormous, and nobody made a thing of it.
                Bought the shirt. You&rsquo;d get it.
              </span>
              <span className="msc-kicker msc-kicker--navy">
                — the management
              </span>
            </div>
            <div className="postcard-right">
              <div className="postcard-stamp">
                <MSCMonogram size={52} />
              </div>
              <div className="postcard-lines" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <Link className="msc-button msc-button--navy" to="/lookbook">
                See the road trip
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* COLLECT LADDER */}
      <section className="msc-section msc-page">
        <CollectLadder />
      </section>

      {/* REQUEST YOUR TOWN teaser */}
      <section className="msc-section msc-page" aria-labelledby="request-town">
        <div className="msc-form-success">
          <span className="msc-kicker">The waitlist</span>
          <h2 id="request-town">Don&rsquo;t see your town?</h2>
          <p style={{maxWidth: '46ch'}}>
            Tell us where you&rsquo;re from. Enough requests and your town gets
            the commemorative garment it has quietly deserved all along.
          </p>
          <Link className="msc-button" to="/request-your-town">
            Request your town
          </Link>
        </div>
      </section>

      <MarqueeStrip variant="mustard" />

      {/* GUEST BOOK */}
      <section className="msc-section msc-page" aria-labelledby="guest-book">
        <Reveal>
          <div className="msc-section-rule">
            <h2 id="guest-book">Guest book</h2>
            <span className="msc-section-note">Reviews, when they arrive</span>
          </div>
          <GuestBook />
        </Reveal>
      </section>

      {/* SPOTTED IN THE WILD */}
      <section className="msc-section msc-page" aria-labelledby="spotted">
        <Reveal>
          <div className="msc-section-rule">
            <h2 id="spotted">Spotted in the wild</h2>
            <span className="msc-section-note">
              Tag @mediocresouvenirco for a feature
            </span>
          </div>
          <SpottedGrid />
        </Reveal>
      </section>

      {/* TRUST BAR */}
      <section className="msc-section" style={{paddingBottom: 0}}>
        <TrustBar />
      </section>

      {/* EMAIL CAPTURE */}
      <EmailCapture />
    </div>
  );
}
