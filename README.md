# EdinCard Vending

Landing page for EdinCard Vending, EdinCard Ltd's Pokémon TCG vending machine
business in Edinburgh. Static site, no build step, no framework — built to a
current (2026) production standard: semantic HTML, WCAG 2.2-minded
accessibility, Core Web Vitals-friendly performance, and full SEO/social
metadata.

## What's in here

```
edincard-vending/
├── index.html         Page content, meta tags, JSON-LD structured data
├── css/style.css       Design system + styles
├── js/main.js           Scroll reveals, mobile menu, notify form, stats counter
├── assets/              favicon.svg, apple-touch-icon.png, og-image.png
├── robots.txt           Crawler rules + sitemap pointer
├── sitemap.xml           Single-page sitemap
├── 404.html              Branded not-found page
└── CNAME                 GitHub Pages custom domain (edincardvending.com)
```

Sections on the page: sticky header with a live ticker, hero, a stats strip,
what EdinCard is, three "what's inside" pack tiers, how it works, a locations
"notify me" signup, a pitch to venue owners who want to host a machine, and
an FAQ accordion.

## What's new since the first version

- **Mobile menu** — a proper hamburger nav on small screens, not just a
  hidden desktop nav.
- **Scroll reveals** — sections fade in via `IntersectionObserver`, and fully
  disable themselves for anyone with `prefers-reduced-motion` set.
- **Count-up stats, card tilt, marquee ticker** — small motion details, all
  respecting reduced-motion.
- **SEO**: Open Graph + Twitter Card tags, canonical URL, `Store` JSON-LD
  structured data, `robots.txt`, `sitemap.xml`.
- **Icons**: SVG favicon, 180×180 apple-touch-icon, 1200×630 OG share image
  (all generated from the brand tokens, not stock art).
- **Accessibility**: skip-to-content link, `aria-live` form status, keyboard-
  operable hero slots, visible focus states throughout, native
  `<details>`/`<summary>` for the FAQ so it works with zero JS.
- **Custom 404 page**, styled to match the site.

## Running it locally

No install needed. Either:

- Open `index.html` directly in a browser, or
- Serve it so relative paths behave exactly like production:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Push to GitHub

This folder is already a git repo with an initial commit. To put it on GitHub:

1. Create a new, empty repository on GitHub (no README, no .gitignore, no
   license, so there's nothing to conflict with) — for example
   `edincard-vending` under your account or the EdinCard org.
2. Point this local repo at it and push:

```bash
cd edincard-vending
git remote add origin https://github.com/<your-username>/edincard-vending.git
git branch -M main
git push -u origin main
```

## Deploying

Since it's plain HTML/CSS/JS, GitHub Pages is the fastest route:

1. In the GitHub repo, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to `Deploy from a branch`,
   branch `main`, folder `/ (root)`.
3. Save. The site publishes to `https://<your-username>.github.io/edincard-vending/`.

Any static host (Netlify, Vercel, Cloudflare Pages) works the same way —
point it at this folder with no build command.

## Next steps

- Swap the `notify-form` submit handler in `js/main.js` for a real signup
  endpoint (Formspree, a Google Sheet via Apps Script, Mailchimp, etc.).
- Add real machine locations to the Locations section once the first units
  are placed.
- Drop a logo/wordmark into `assets/` and swap it in for the `EC` text mark
  (update `favicon.svg`, `apple-touch-icon.png`, and `og-image.png` to match).
- The FAQ's payment/return/stocking answers are placeholder copy — confirm
  actual policy (returns, data handling, T&Cs) before relying on it publicly.
- Consider adding Google Search Console + a lightweight analytics tool
  (e.g. Plausible or GA4) once the domain is fully live, so signups and
  traffic are measurable.
