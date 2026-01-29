# Subha Vadlamannati - Personal Website

Personal portfolio website for Subha Vadlamannati, built with [Hugo](https://gohugo.io/) and the [Paper theme](https://github.com/nanxiaobei/hugo-paper).

## About

This website showcases my:
- **About** - Background, education, and interests
- **Experience** - Professional work history and research positions
- **Projects** - Technical projects and research work
- **Publications** - Academic papers and research publications
- **Blog** - Thoughts on AI, ML research, and technology
- **Contact** - Ways to get in touch

## Project Structure

```
subha-website/
├── exampleSite/           # Main site content
│   ├── content/           # Markdown content files
│   │   ├── about.md       # About page
│   │   ├── contact.md     # Contact page
│   │   ├── experience.md  # Experience page
│   │   ├── projects.md    # Projects page
│   │   ├── publications.md # Publications page
│   │   ├── homepage/      # Homepage sections
│   │   └── post/          # Blog posts
│   ├── static/            # Static assets (images, etc.)
│   └── hugo.toml          # Site configuration
├── layouts/               # Hugo templates
├── assets/                # CSS and styling
└── static/                # Theme static files
```

## Development

### Prerequisites
- [Hugo](https://gohugo.io/installation/) (v0.57.1+)
- [Bun](https://bun.sh/) or Node.js

### Running Locally

```bash
cd exampleSite
hugo server -D
```

Or with CSS watching:
```bash
bun run dev
```

### Building for Production

```bash
bun run build
```

## Customization

Edit `exampleSite/hugo.toml` to update:
- Site title and description
- Social media links
- Avatar and bio
- Menu items

## Tech Stack

- **Static Site Generator**: Hugo
- **Theme**: Hugo Paper
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (or any static hosting)

## License

Content is personal. Theme is [MIT Licensed](https://github.com/nanxiaobei/hugo-paper/blob/main/LICENSE).

---

Built with Hugo Paper theme by [nanxiaobei](https://github.com/nanxiaobei/hugo-paper)
