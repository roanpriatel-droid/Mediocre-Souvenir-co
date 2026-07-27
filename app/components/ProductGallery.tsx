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
}: {
  images: GalleryImage[];
  title: string;
  activeImageId?: string | null;
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

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

  const step = (delta: number) => {
    if (!images.length) return;
    setIndex((current) => (current + delta + images.length) % images.length);
  };

  if (!images.length) {
    return (
      <div className="pdp-gallery">
        <div className="pdp-stage">
          <div className="product-photo-pending">
            <span>Photograph coming</span>
            <small>The shirt exists. The photograph of it is running late.</small>
          </div>
        </div>
      </div>
    );
  }

  const current = images[Math.min(index, images.length - 1)];

  return (
    <div className="pdp-gallery">
      <div className="pdp-stage" ref={stageRef}>
        <button
          type="button"
          className="pdp-stage-button"
          onClick={open}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') step(1);
            if (event.key === 'ArrowLeft') step(-1);
          }}
          aria-label={`Enlarge image ${index + 1} of ${images.length}`}
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
          {images.map((image, i) => (
            <li key={image.id ?? image.url}>
              <button
                type="button"
                className="pdp-thumb"
                data-active={i === index || undefined}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
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
                <button type="button" onClick={() => step(-1)} aria-label="Previous image">
                  ‹ Previous
                </button>
                <span>
                  {index + 1} / {images.length}
                </span>
                <button type="button" onClick={() => step(1)} aria-label="Next image">
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
