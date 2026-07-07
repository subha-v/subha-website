# Subha Vadlamannati - Personal Website

Personal website built with [Astro](https://astro.build), [React](https://react.dev), and [Tailwind CSS 4](https://tailwindcss.com) — a quiet, minimal design with pixel-art critters. Live at [subhavadlamannati.com](https://subhavadlamannati.com).

## Structure

```
.
├── astro.config.mjs        # Astro config (React, MDX, Tailwind, KaTeX, Shiki)
├── public/                 # Static assets served as-is
│   ├── CNAME               # Custom domain for GitHub Pages
│   └── images/             # Photos, art, project images, pixel bunny favicon
├── src/
│   ├── components/
│   │   ├── Gallery.tsx     # Art gallery with lightbox (React island)
│   │   ├── Toc.tsx         # Blog scrollspy table of contents (React island)
│   │   ├── ThemeToggle.tsx # Pixel sun/moon dark-mode toggle (React island)
│   │   ├── Nav.astro / Footer.astro
│   │   └── pixel/          # Hand-made SVG pixel sprites (cats, sparkles)
│   ├── content/blog/       # Blog posts as Markdown with frontmatter
│   ├── layouts/Base.astro  # Shared layout (nav, footer, theme, view transitions)
│   ├── pages/              # index, projects, blog, art, 404
│   └── styles/global.css   # Tailwind 4 theme tokens + prose styles
└── .github/workflows/deploy.yml  # Builds and deploys to GitHub Pages
```

## Features

- Minimal paper-white design (cozy dark mode included) with a sakura-pink accent
- Geist typeface with Silkscreen pixel-font accents; pixel bunny, cats, and sparkles
- Blog posts written in plain Markdown with LaTeX math (KaTeX) and syntax-highlighted code (Shiki)
- Blog post pages have a fixed sidebar table of contents with scrollspy highlighting
- Art gallery with a keyboard-navigable lightbox
- Smooth page transitions (Astro view transitions)

## Development

```bash
npm install
npm run dev        # dev server at http://localhost:4321
npm run build      # static build into dist/
npm run preview    # preview the production build
```

## Writing a New Blog Post

1. Add a Markdown file to `src/content/blog/`, e.g. `my-post.md`
2. Start it with frontmatter:

   ```markdown
   ---
   title: My Post Title
   description: One-sentence summary shown on the blog list and under the title.
   date: 2026-07-07
   ---

   Post content here. Inline math like $E = mc^2$, display math with $$...$$,
   and fenced code blocks all work out of the box.
   ```

3. The post appears automatically at `/blog/my-post` and on the blog index. `##`/`###` headings populate the sidebar table of contents.

## Deployment

Pushing to `main` triggers the GitHub Actions workflow, which builds the site with Astro and deploys it to GitHub Pages (custom domain via `public/CNAME`).

## Changelog

- **July 2026 — Full UI rebuild.** Migrated the site from hand-written static HTML/CSS to Astro 5 + React 19 + Tailwind CSS 4, keeping all content identical. Blog post pages redesigned (scrollspy TOC sidebar, KaTeX, Shiki) modeled on a modern minimal blog layout. Added dark mode, view transitions, an art-gallery lightbox, and hand-made pixel-art accents (blinking bunny wordmark, sleeping cat at the end of posts, pixel 404 cat). Deployment moved from branch-based Pages to a GitHub Actions build.
