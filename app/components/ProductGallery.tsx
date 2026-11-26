import {useEffect, useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';

export interface GalleryImage {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

/**
 * Product gallery.
 *
 * Three things this has to survive, all of them real in this catalogue:
 * a product with several images, a product with exactly one, and a product
 * with none at all (the store returns those). Every branch renders something
 * with the same geometry, so nothing shifts.
 *
 * CLS: the stage is a fixed 1:1 box and the image is contained inside it, so
 * the layout is identical before and after any image loads. The first image
 * is eager and fetch-priority high — it is the LCP element on this page.
 *
 * Colorway linking: the parent passes `activeImageId` from the selected
 * variant. When a colorway is chosen the gallery jumps to that variant's
 * photograph rather than leaving you looking at a different colour.
 */
export function ProductGallery({
  images,
  title,
  activeImageId,
  colour,
}: {
  images: GalleryImage[];
  title: string;
  activeImageId?: string | null;
  /** The chosen colour option, which decides which photos the grid shows. */
  colour?: string | null;
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // When the colour changes, show that colour's front photo first.
  useEffect(() => {
    if (!colour) return;
    const wanted = `in ${colour.toLowerCase()}, front`;
    const found = images.findIndex((image) =>
      (image.altText ?? '').toLowerCase().endsWith(wanted),
    );
    if (found >= 0) setIndex(found);
  }, [colour, images]);

  // Follow the variant's image when a colorway changes.
  useEffect(() => {
    if (!activeImageId) return;
    const found = images.findIndex((image) => image.id === activeImageId);
    if (found >= 0) setIndex(found);
  }, [activeImageId, images]);

  // Keep the index valid if the image list changes underneath us.
  useEffect(() => {
    if (index > images.length - 1) setIndex(0);
  }, [images.length, index]);

  const open = () => {
    setLightbox(true);
    dialogRef.current?.showModal();
  };
  const close = () => {
    setLightbox(false);
    dialogRef.current?.close();
  };

  // Clicking the backdrop closes. Attached natively so <dialog> keeps its
  // built-in focus trap and Escape handling without a JSX click handler on a
  // non-interactive element.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onBackdropClick = (event: MouseEvent) => {
      if (event.target === dialog) {
        dialog.close();
      }
    };
    dialog.addEventListener('click', onBackdropClick);
    return () => dialog.removeEventListener('click', onBackdropClick);
  }, []);

  // Arrows, thumbnails and the lightbox move through the selected colour's
  // photos only (see `pool` below), not all six colours at once.
  const step = (delta: number) => {
    if (!pool.length) return;
    const position = Math.max(pool.indexOf(index), 0);
    setIndex(pool[(position + delta + pool.length) % pool.length]);
  };

  if (!images.length) {
    return (
      <div className="pdp-gallery">
        <div className="pdp-stage">
          <div className="product-photo-pending">
            <span>Photograph coming</span>
            <small>
              The shirt exists. The photograph of it is running late.
            </small>
          </div>
        </div>
      </div>
    );
  }

  const current = images[Math.min(index, images.length - 1)];

  // Desktop shows the selected colour's photos as a grid. Every photo's alt
  // text ends "in <colour>, <view>", so the grid takes the active variant's
  // colour and lays its views out front, worn, back, folded.
  const describe = (image: GalleryImage) =>
    /in ([a-z ]+), ([a-z ,]+)$/i.exec(image.altText ?? '');
  const activeIndex = activeImageId
    ? images.findIndex((image) => image.id === activeImageId)
    : -1;
  const activeColour =
    colour?.toLowerCase() ??
    describe(images[activeIndex] ?? images[0])?.[1]?.toLowerCase() ??
    null;
  const VIEW_ORDER = ['front', 'worn', 'back', 'folded', 'folded, flat lay'];
  const ofColour = activeColour
    ? images
        .map((image, i) => ({i, match: describe(image)}))
        .filter(({match}) => match?.[1]?.toLowerCase() === activeColour)
        .sort(
          (a, b) =>
            VIEW_ORDER.indexOf(a.match?.[2]?.toLowerCase() ?? '') -
            VIEW_ORDER.indexOf(b.match?.[2]?.toLowerCase() ?? ''),
        )
        .map(({i}) => i)
    : [];
  const pool = ofColour.length >= 2 ? ofColour : images.map((_, i) => i);
  // Desktop: one large lead photo and up to four more of the same colour.
  const gridIndexes = pool.slice(0, 5);
  const poolPosition = Math.max(pool.indexOf(index), 0) + 1;

  return (
    <div className="pdp-gallery">
      {images.length > 1 && (
        <div
          className="pdp-grid"
          aria-label="Product photos"
          data-rest={Math.max(0, gridIndexes.length - 1)}
        >
          {gridIndexes.map((imageIndex, position) => {
            const image = images[imageIndex];
            if (!image) return null;
            return (
              <button
                key={image.id ?? image.url}
                type="button"
                className="pdp-grid-item"
                onClick={() => {
                  setIndex(imageIndex);
                  open();
                }}
                aria-label={`Enlarge photo ${position + 1}`}
              >
                <Image
                  data={image}
                  alt={image.altText || title}
                  aspectRatio={position === 0 ? '1/1' : '4/5'}
                  crop="center"
                  sizes={
                    position === 0
                      ? '(min-width: 1200px) 720px, 55vw'
                      : '(min-width: 1200px) 360px, 28vw'
                  }
                  loading={position < 3 ? 'eager' : 'lazy'}
                  fetchPriority={position === 0 ? 'high' : 'auto'}
                />
              </button>
            );
          })}
        </div>
      )}
      <div className="pdp-stage" ref={stageRef}>
        <button
          type="button"
          className="pdp-stage-button"
          onClick={open}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') step(1);
            if (event.key === 'ArrowLeft') step(-1);
          }}
          aria-label={`Enlarge image ${poolPosition} of ${pool.length}`}
        >
          <Image
            data={current}
            alt={current.altText || title}
            aspectRatio="1/1"
            sizes="(min-width: 1000px) 560px, 100vw"
            loading="eager"
            decoding="sync"
          />
          <span className="pdp-stage-zoom" aria-hidden="true">
            Enlarge
          </span>
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="pdp-stage-nav pdp-stage-nav--prev"
              onClick={() => step(-1)}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              className="pdp-stage-nav pdp-stage-nav--next"
              onClick={() => step(1)}
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <ul className="pdp-thumbs" aria-label="Product images">
          {pool
            .map((i) => images[i])
            .map((image, n) => (
              <li key={image.id ?? image.url}>
                <button
                  type="button"
                  className="pdp-thumb"
                  data-active={pool[n] === index || undefined}
                  aria-label={`Show image ${n + 1}`}
                  aria-current={pool[n] === index}
                  onClick={() => setIndex(pool[n])}
                >
                  <Image
                    data={image}
                    alt=""
                    aspectRatio="1/1"
                    sizes="90px"
                    loading="lazy"
                  />
                </button>
              </li>
            ))}
        </ul>
      )}

      {/* Lightbox. <dialog> gives focus trapping and Escape for free. */}
      <dialog
        className="pdp-lightbox"
        ref={dialogRef}
        aria-label={`${title} enlarged`}
        onClose={() => setLightbox(false)}
      >
        {lightbox && (
          <div className="pdp-lightbox-inner">
            <button
              type="button"
              className="msc-modal-close pdp-lightbox-close"
              onClick={close}
              aria-label="Close"
            >
              &times;
            </button>
            <Image
              data={current}
              alt={current.altText || title}
              aspectRatio="1/1"
              sizes="90vw"
              loading="eager"
            />
            {images.length > 1 && (
              <div className="pdp-lightbox-nav">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous image"
                >
                  ‹ Previous
                </button>
                <span>
                  {poolPosition} / {pool.length}
                </span>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next image"
                >
                  Next ›
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
