# Markos

A minimal, elegant side-by-side markdown editor with live preview. No sign-up required.

**Live app:** Set `NEXT_PUBLIC_SITE_URL` to your deployment URL (e.g. `https://markos.app`) and deploy. The app runs in the browser with no backend required.

## Features

- **Live preview** — Write markdown on the left, see the rendered result on the right in real time.
- **No account** — Use the editor immediately without signing up or logging in.
- **In-browser** — Runs entirely in the browser; your content stays local unless you choose otherwise.
- **Theme** — Light/dark mode with system preference support.

## Tech

- Next.js (App Router), React, Tailwind CSS, react-markdown.

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## SEO and social previews

- Set `NEXT_PUBLIC_SITE_URL` in production so metadata, sitemap, and Open Graph use the correct base URL.
- For best social link previews (Twitter, LinkedIn, etc.), add a 1200×630 image at `public/og.png`. The app uses `public/og.svg` as a fallback.
