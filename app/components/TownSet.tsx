import {useMemo, useState} from 'react';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';

export interface SetProduct {
  handle: string;
  title: string;
  variants: {
    id: string;
    availableForSale: boolean;
    selectedOptions: {name: string; value: string}[];
  }[];
}

const SIZE_ORDER = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
const COLOUR_ORDER = ['Ivory', 'Bay', 'Blue Jean', 'Brick', 'White', 'Black'];

const optionValue = (variant: SetProduct['variants'][number], name: RegExp) =>
  variant.selectedOptions.find((option) => name.test(option.name))?.value;

/**
 * "Take the whole set": every print of one town, in one colour and size, into
 * the cart in a single press. Three or more shirts are 20% off at checkout,
 * so a four-print town is the best deal on the page.
 *
 * Only colours and sizes that every print offers are listed, so the button
 * never adds a partial set by surprise.
 */
export function TownSet({
  town,
  products,
}: {
  town: string;
  products: SetProduct[];
}) {
  const {open} = useAside();

  const {colours, sizes} = useMemo(() => {
    const per = products.map((product) => ({
      colours: new Set(
        product.variants
          .map((variant) => optionValue(variant, /colou?r/i))
          .filter(Boolean) as string[],
      ),
      sizes: new Set(
        product.variants
          .map((variant) => optionValue(variant, /size/i))
          .filter(Boolean) as string[],
      ),
    }));
    const shared = (key: 'colours' | 'sizes', order: string[]) =>
      order.filter((value) => per.every((entry) => entry[key].has(value)));
    return {
      colours: shared('colours', COLOUR_ORDER),
      sizes: shared('sizes', SIZE_ORDER),
    };
  }, [products]);

  const [colour, setColour] = useState(colours[0] ?? '');
  const [size, setSize] = useState('');

  if (products.length < 2) return null;

  const lines = size
    ? products
        .map((product) =>
          product.variants.find(
            (variant) =>
              variant.availableForSale &&
              optionValue(variant, /size/i) === size &&
              (!colours.length || optionValue(variant, /colou?r/i) === colour),
          ),
        )
        .filter(Boolean)
        .map((variant) => ({
          merchandiseId: variant!.id,
          quantity: 1,
          attributes: [{key: 'Town', value: town}],
        }))
    : [];

  const full = products.length * 36;
  const discounted = full * (products.length >= 3 ? 0.8 : 0.85);

  return (
    <div className="town-set">
      <div className="town-set-copy">
        <span className="msc-kicker">The whole set</span>
        <h2>
          All {products.length} {town} prints
        </h2>
        <p>
          ${discounted.toFixed(2)} instead of ${full.toFixed(2)}.{' '}
          {products.length >= 3 ? '20%' : '15%'} off, applied at checkout.
        </p>
      </div>
      <div className="town-set-controls">
        {colours.length > 0 && (
          <label>
            <span className="msc-label">Colour</span>
            <select
              className="msc-input"
              value={colour}
              onChange={(event) => setColour(event.target.value)}
            >
              {colours.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        )}
        <label>
          <span className="msc-label">Size</span>
          <select
            className="msc-input"
            value={size}
            onChange={(event) => setSize(event.target.value)}
          >
            <option value="">Choose</option>
            {sizes.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <AddToCartButton
          lines={lines}
          disabled={lines.length !== products.length}
          onClick={() => open('cart')}
          successLabel="The set is in your cart"
        >
          {size ? 'Add the whole set' : 'Choose a size'}
        </AddToCartButton>
      </div>
    </div>
  );
}
