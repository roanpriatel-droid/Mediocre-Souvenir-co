/**
 * Guest book (reviews) and Spotted in the Wild (UGC).
 * Structurally in place, honestly empty: no fabricated counts, totals, or
 * stars. When real reviews and photos exist, they render into these frames.
 */

export function GuestBook() {
  return (
    <div className="guest-book-empty">
      <div className="guest-book-stars" aria-hidden="true">
        ☆ ☆ ☆ ☆ ☆
      </div>
      <h3>The guest book is open.</h3>
      <p>
        No entries yet — we just unlocked the door. Buy a souvenir, wear it
        somewhere unremarkable, and tell us how it went.
      </p>
      <span className="msc-marker">be our first.</span>
    </div>
  );
}

const SPOTTED_SLOTS = [
  'your photo here',
  'this one too',
  'ideally near a water tower',
  'or the town sign',
];

export function SpottedGrid() {
  return (
    <div className="spotted-grid">
      {SPOTTED_SLOTS.map((note) => (
        <div className="spotted-slot" key={note}>
          <span className="msc-marker">{note}</span>
          <span className="spotted-slot-note">Tag @mediocresouvenirco</span>
        </div>
      ))}
    </div>
  );
}
