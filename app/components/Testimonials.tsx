/**
 * The middling testimonials strip.
 *
 * These are clearly-labelled placeholders, not invented customer reviews. The
 * brand rule is that we never fake social proof (BRAND.md), and the joke only
 * works if the praise is honestly unenthusiastic — so the section says out
 * loud that real ones go here when they arrive, and no review structured data
 * is emitted for them.
 */
const NOTICES = [
  {quote: 'It’s fine.', name: 'Greg', place: 'Toledo, OH'},
  {quote: 'Arrived. Fits.', name: 'Dana', place: 'Rockford, IL'},
  {quote: 'My wife said it was “a shirt”.', name: 'Bill', place: 'Gary, IN'},
  {quote: 'Softer than expected. Not sure that’s a compliment.', name: 'Marisa', place: 'Pittsburgh, PA'},
  {quote: 'Nobody has commented on it once.', name: 'Ken', place: 'Detroit, MI'},
];

export function Testimonials() {
  return (
    <section className="testimonials" aria-labelledby="testimonials-heading">
      <div className="msc-section-rule">
        <h2 id="testimonials-heading">Middling praise</h2>
        <span className="msc-section-note">
          Placeholder copy · real ones go here when they arrive
        </span>
      </div>

      <ul className="testimonial-row">
        {NOTICES.map((notice) => (
          <li className="testimonial" key={notice.name}>
            <div className="testimonial-stars" aria-hidden="true">
              ★ ★ ★ ☆ ☆
            </div>
            <blockquote>{notice.quote}</blockquote>
            <cite>
              {notice.name} · {notice.place}
            </cite>
          </li>
        ))}
      </ul>

      <p className="testimonial-fineprint">
        We do not invent reviews. When real ones exist they will appear here,
        exactly as written, including the unenthusiastic ones — especially
        those.
      </p>
    </section>
  );
}
