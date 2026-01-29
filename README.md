# Subha Vadlamannati - Personal Website

A simple static HTML personal website with blog support.

## Structure

```
.
├── index.html          # Main page (About) with two-column layout
├── projects.html       # Projects and research page
├── blog.html           # Blog listing page
├── style.css           # Global styles
├── images/             # Images directory
└── blog/               # Blog posts directory
    ├── example-post.html   # Example post with LaTeX demo
    └── post-template.html  # Template for new posts
```

## Features

- Simple, clean design with Times New Roman font
- White background with black text
- Two-column layout: photo/contact on left, bio on right
- Blog with Markdown and LaTeX support (via marked.js and MathJax)

## Usage

### Profile Picture

The profile picture is located in the `images/` folder and referenced in `index.html`.

### Creating a New Blog Post

1. Copy `blog/post-template.html` and rename it
2. Update the title in `<title>` and `<h1>`
3. Update the date
4. Write your content in the `markdown` variable using Markdown syntax
5. Add an entry to `blog.html` linking to your new post

### LaTeX in Blog Posts

- Inline math: `$E = mc^2$`
- Display math: `$$\int_0^\infty e^{-x^2} dx$$`

### Images in Blog Posts

```markdown
![Alt text](../images/your-image.jpg)
```

## Local Development

Simply open `index.html` in a web browser, or use a local server:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000
