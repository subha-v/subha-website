import { useEffect, useState } from 'react';

type TocHeading = { depth: number; slug: string; text: string };

// Sidebar table of contents with scrollspy highlighting, modeled on the
// fixed-rail TOC at aadityan.com.
export default function Toc({ headings }: { headings: TocHeading[] }) {
  const [active, setActive] = useState<string | null>(headings[0]?.slug ?? null);

  useEffect(() => {
    const els = headings
      .map((h) => document.getElementById(h.slug))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    // Highlight the last heading above the reading line (~1/4 down the viewport).
    let ticking = false;
    const update = () => {
      ticking = false;
      const readingLine = window.innerHeight * 0.25;
      let current = els[0].id;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= readingLine) current = el.id;
        else break;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [headings]);

  return (
    <nav aria-label="Table of contents">
      <a href="/blog" className="quiet-link mb-5 inline-block text-[13px]">
        &larr; Back to blog
      </a>
      <div className="relative">
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-[1.5px] bg-line" aria-hidden="true" />
        <ul className="space-y-0.5">
          {headings.map((h) => {
            const isActive = active === h.slug;
            return (
              <li key={h.slug} className="relative">
                {isActive && (
                  <span
                    className="absolute top-1 bottom-1 left-0 w-[1.5px] bg-sakura-bright"
                    aria-hidden="true"
                  />
                )}
                <a
                  href={`#${h.slug}`}
                  className={`block py-1 leading-snug transition-colors ${
                    h.depth === 2 ? 'pl-3 text-[13px]' : 'pl-6 text-[12px]'
                  } ${isActive ? 'font-medium text-ink' : 'text-faint hover:text-ink'}`}
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
