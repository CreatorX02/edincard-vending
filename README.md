# EdinCard Vending

Landing page for EdinCard Vending, EdinCard Ltd's Pokémon TCG vending machine
business in Edinburgh. Static site, no build step, no framework.

## What's in here

```
edincard-vending/
├── index.html        Page content and structure
├── css/style.css      Design system + styles
├── js/main.js          Notify-form handling, hero slot interaction
└── assets/             Drop logo/images here as they're ready
```

Sections on the page: hero, what EdinCard is, how it works, a locations
"notify me" signup, and a pitch to venue owners who want to host a machine.

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
- Wire the "Host a machine" `mailto:` link to whichever inbox should own
  venue enquiries, or replace it with a form.
- Add real machine locations to the Locations section once the first units
  are placed.
- Drop a logo/wordmark into `assets/` and swap it in for the `EC` text mark.
