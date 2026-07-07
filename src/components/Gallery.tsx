import { useCallback, useEffect, useState } from 'react';

type GalleryImage = {
  thumb: string;
  full: string;
  alt: string;
  width: number;
  height: number;
};

// Masonry-style art grid with a keyboard-navigable lightbox.
export default function Gallery({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) => {
      setOpenIndex((i) => (i === null ? i : (i + delta + images.length) % images.length));
    },
    [images.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    // warm the neighbors so arrow-key browsing feels instant
    for (const delta of [1, -1]) {
      const neighbor = images[(openIndex + delta + images.length) % images.length];
      new Image().src = neighbor.full;
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [openIndex, close, step, images]);

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 [&>button]:mb-4">
        {images.map((img, i) => (
          <button
            key={img.thumb}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="block w-full cursor-zoom-in overflow-hidden rounded-lg"
            aria-label={`View ${img.alt} full size`}
          >
            <img
              src={img.thumb}
              alt={img.alt}
              width={img.width}
              height={img.height}
              loading="lazy"
              decoding="async"
              className="h-auto w-full transition-transform duration-300 ease-out hover:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e1116]/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Artwork viewer"
          onClick={close}
        >
          <img
            src={images[openIndex].full}
            alt={images[openIndex].alt}
            className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            onClick={close}
            aria-label="Close viewer"
            className="absolute top-4 right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-2xl text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            &times;
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label="Previous artwork"
            className="absolute left-2 flex h-12 w-12 cursor-pointer items-center justify-center rounded-md text-2xl text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:left-6"
          >
            &lsaquo;
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label="Next artwork"
            className="absolute right-2 flex h-12 w-12 cursor-pointer items-center justify-center rounded-md text-2xl text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:right-6"
          >
            &rsaquo;
          </button>

          <span className="font-pixel absolute bottom-5 text-[10px] text-white/70 select-none">
            {openIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}
