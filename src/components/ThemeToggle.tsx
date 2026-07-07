// Pixel sun/moon dark-mode toggle. The visible icon is driven purely by the
// `.dark` class via CSS, so there is no hydration flicker.
export default function ThemeToggle() {
  const toggle = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.theme = isDark ? 'dark' : 'light';
  };

  const px = (cells: [number, number][], fill: string) =>
    cells.map(([x, y], i) => <rect key={i} x={x} y={y} width="1" height="1" fill={fill} />);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="ml-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-soft transition-colors hover:bg-card hover:text-ink"
    >
      {/* moon — shown in light mode */}
      <svg viewBox="0 0 9 9" className="h-4 w-4 dark:hidden" shapeRendering="crispEdges" aria-hidden="true">
        {px(
          [
            [3, 1], [4, 1], [5, 1],
            [2, 2], [3, 2],
            [2, 3],
            [2, 4],
            [2, 5],
            [2, 6], [3, 6],
            [3, 7], [4, 7], [5, 7],
          ],
          'currentColor',
        )}
        {px([[7, 2]], 'var(--c-sakura-bright)')}
      </svg>
      {/* sun — shown in dark mode */}
      <svg viewBox="0 0 9 9" className="hidden h-4 w-4 dark:block" shapeRendering="crispEdges" aria-hidden="true">
        {px(
          [
            [3, 3], [4, 3], [5, 3],
            [3, 4], [4, 4], [5, 4],
            [3, 5], [4, 5], [5, 5],
          ],
          'currentColor',
        )}
        {px(
          [
            [4, 0], [4, 8], [0, 4], [8, 4],
            [1, 1], [7, 1], [1, 7], [7, 7],
          ],
          'var(--c-sakura-bright)',
        )}
      </svg>
    </button>
  );
}
