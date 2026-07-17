import {useState} from 'react';
import {SIZES, type Size} from '~/lib/catalog';

/**
 * Comfort Colors 1717 published garment measurements (inches, laid flat).
 * Approximate — verify against the print provider before launch
 * (see NEEDS_INPUT.md).
 */
export const SIZE_TABLE: Record<Size, {chest: number; length: number}> = {
  S: {chest: 20, length: 28},
  M: {chest: 22, length: 29},
  L: {chest: 24, length: 30},
  XL: {chest: 26, length: 31},
  '2XL': {chest: 28, length: 32.5},
  '3XL': {chest: 30, length: 33.5},
};

export function SizeTable() {
  return (
    <div className="msc-table-wrap">
      <table className="msc-table">
        <thead>
          <tr>
            <th scope="col">Size</th>
            <th scope="col">Chest width (in)</th>
            <th scope="col">Body length (in)</th>
            <th scope="col">Chest width (cm)</th>
            <th scope="col">Body length (cm)</th>
          </tr>
        </thead>
        <tbody>
          {SIZES.map((size) => {
            const s = SIZE_TABLE[size];
            return (
              <tr key={size}>
                <td style={{fontWeight: 700}}>{size}</td>
                <td>{s.chest}&Prime;</td>
                <td>{s.length}&Prime;</td>
                <td>{Math.round(s.chest * 2.54)}</td>
                <td>{Math.round(s.length * 2.54)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Simple find-my-size: body chest measurement → recommended size. */
export function FindMySize() {
  const [chest, setChest] = useState('');
  const measured = Number(chest);
  let recommendation: string | null = null;
  if (measured >= 30 && measured <= 70) {
    // garment chest width ×2 vs body measurement, ~4in ease for the honest fit
    const match =
      SIZES.find((size) => SIZE_TABLE[size].chest * 2 >= measured + 4) ??
      '3XL';
    recommendation = match;
  }

  return (
    <div className="msc-form" style={{maxWidth: '480px'}}>
      <div>
        <label className="msc-label" htmlFor="chest-measure">
          Your chest measurement, in inches (tape under the arms, around the
          fullest part)
        </label>
        <input
          className="msc-input"
          id="chest-measure"
          inputMode="decimal"
          placeholder="e.g. 41"
          value={chest}
          onChange={(e) => setChest(e.target.value)}
        />
      </div>
      {recommendation ? (
        <p>
          <strong>Our recommendation: {recommendation}.</strong> That gives
          you the honest fit — roomy, not billowing. For the true
          vintage-find silhouette, take one size up.
        </p>
      ) : chest.trim() ? (
        <p>Enter a number between 30 and 70 and we can work with it.</p>
      ) : null}
    </div>
  );
}
