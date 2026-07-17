import {Link} from 'react-router';
import type {Route} from './+types/size-guide';
import {Reveal} from '~/components/Reveal';
import {FindMySize, SizeTable} from '~/components/SizeGuide';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = () => [
  {title: `Size & Fit Guide — Unisex S–3XL | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'Measurements and fit notes for the Mediocre Souvenir tee (Comfort ' +
      'Colors 1717, unisex S–3XL): chest width, body length, and a simple ' +
      'find-my-size flow.',
  },
];

export default function SizeGuide() {
  return (
    <div>
      <header className="article-header">
        <span className="msc-kicker">Measurements</span>
        <h1>Size &amp; fit guide.</h1>
        <p style={{fontSize: '18px', maxWidth: '52ch'}}>
          One garment, six sizes, no mysteries. Unisex, true to size, and the
          cotton relaxes about half a size as you break it in.
        </p>
      </header>
      <div className="article-body" style={{gap: '28px'}}>
        <Reveal>
          <SizeTable />
        </Reveal>
        <Reveal>
          <div className="msc-prose">
            <h2>The fit, in words</h2>
            <p>
              Classic-relaxed. Not boxy enough to be a statement, not slim
              enough to be a suggestion. Shoulders sit at the shoulder,
              sleeves hit mid-bicep, hem lands at mid-fly. If you are between
              sizes: your usual size gives the fit the shirt intends; one
              size up gives the thrift-store-find drape.
            </p>
            <h2>Find my size</h2>
          </div>
        </Reveal>
        <Reveal delay={1}>
          <FindMySize />
        </Reveal>
        <Reveal>
          <div className="msc-prose">
            <p>
              Still unsure? Returns are easy — 30 days, no interrogation —
              so the stakes are low. Fabric details live on the{' '}
              <Link to="/materials">Materials page</Link>.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
