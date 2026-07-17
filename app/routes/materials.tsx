import {Link} from 'react-router';
import type {Route} from './+types/materials';
import {Reveal} from '~/components/Reveal';
import {SITE_NAME} from '~/lib/seo';

export const meta: Route.MetaFunction = () => [
  {title: `Materials & Construction — Comfort Colors 1717 | ${SITE_NAME}`},
  {
    name: 'description',
    content:
      'Every Mediocre Souvenir tee is a Comfort Colors 1717: 6.1 oz ' +
      'heavyweight 100% ring-spun cotton, garment-dyed so the fade is ' +
      'structural. Fabric weight, construction, and why both matter.',
  },
];

const SPECS = [
  ['Blank', 'Comfort Colors 1717 — non-negotiable'],
  ['Fabric', '100% ring-spun cotton'],
  ['Weight', '6.1 oz/yd² (~207 GSM) — heavyweight'],
  ['Dye process', 'Garment-dyed (dyed after sewing), soft-washed'],
  ['Shoulders', 'Taped neck and shoulder seams'],
  ['Stitching', 'Double-needle sleeve and bottom hems'],
  ['Collar', 'Ribbed, structured, intends to stay that way'],
  ['Fit', 'Unisex, true to size, relaxes ~half a size with wear'],
  ['Print', 'Screen-print aesthetic, slogans run at 88% ink density'],
];

export default function Materials() {
  return (
    <div>
      <header className="article-header">
        <span className="msc-kicker">The garment</span>
        <h1>Materials &amp; construction.</h1>
        <p style={{fontSize: '18px', maxWidth: '52ch'}}>
          The blank does the vintage work. Everything we believe about
          clothing is expressed in one decision: the shirt is a Comfort
          Colors 1717, and it is not a different shirt.
        </p>
      </header>
      <div className="article-body">
        <Reveal>
          <div className="msc-prose">
            <h2>The spec sheet</h2>
          </div>
        </Reveal>
        <Reveal delay={1}>
          <div className="msc-table-wrap" style={{marginTop: '18px', maxWidth: '720px'}}>
            <table className="msc-table">
              <thead>
                <tr>
                  <th scope="col">Detail</th>
                  <th scope="col">Specification</th>
                </tr>
              </thead>
              <tbody>
                {SPECS.map(([k, v]) => (
                  <tr key={k}>
                    <td style={{fontWeight: 700}}>{k}</td>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <Reveal>
          <div className="msc-prose" style={{marginTop: '32px'}}>
            <h2>Why heavyweight</h2>
            <p>
              Most modern tees run around 4 ounces per square yard and drape
              like they have somewhere else to be. At 6.1 ounces, the 1717
              settles on your shoulders like it has agreed to stay. Weight is
              what lets a t-shirt hold its shape through years of washing —
              it is the difference between a shirt that ages and a shirt that
              merely wears out.
            </p>
            <h2>Why garment-dyed</h2>
            <p>
              The finished shirt goes into the dye — seams, collar, and all —
              so the color takes unevenly in exactly the way three decades of
              sun would have faded it. Softer everywhere, lighter along the
              seams. The fade is not printed on; it is structural. This is
              also why our colorways are called Ivory, Butter, Blue Jean,
              Brick, and Sage rather than anything urgent: garment dye
              produces colors that look found rather than chosen.
            </p>
            <h2>Why ring-spun</h2>
            <p>
              Ring-spun cotton twists the fibers before spinning, producing a
              smoother, stronger yarn. An open-end shirt pills; a ring-spun
              heavyweight breaks in. Breaking in is what happens when a
              garment and a person come to an arrangement.
            </p>
            <h2>Printed to order</h2>
            <p>
              Shirts are printed when you order them, in North America, which
              takes 5–10 business days and means nothing sits in a warehouse
              becoming landfill inventory. Genuine takes time. Care
              instructions live in the <Link to="/care">Care Guide</Link>;
              measurements live in the{' '}
              <Link to="/size-guide">Size &amp; Fit Guide</Link>.
            </p>
            <span className="msc-marker">built to be inherited.</span>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
