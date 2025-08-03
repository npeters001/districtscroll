# DistrictScroll

This project implements a lightweight brand browser for **DistrictScroll**.  It provides a two‑row header to select a **vibe** and a **category**, renders a responsive grid of brand cards and allows visitors to save brands, share the current selection and track analytics events.  Everything is implemented client side and compiled down to a few static assets so the site can be deployed to Vercel’s free tier without any server side runtime.

## Key features

* **Dual facet filtering** – The header exposes two rows of pills.  The first row lists all available vibes and the second row lists all available categories.  Selecting a vibe **and** a category filters the cards by the intersection of those two facets.  Selecting “All” in either row disables that facet.  The filter state is persisted into `localStorage` under the key `ds_filter` and is also encoded into the query string (`?vibe=<slug>&cat=<slug>`) so a visitor can bookmark or share the current view.
* **Responsive card grid** – Brand cards are laid out in a CSS grid that automatically fills the available space.  Each card shows the brand’s hero image with a subtle gradient overlay, the brand name in a pill, and a heart icon.  When a heart is tapped the corresponding brand ID is stored in `localStorage.ds_saved`; reloading the page restores saved state.  Card order is randomly shuffled every time the filter changes to keep the page feeling fresh.
* **Save/Unsave** – Click the heart on a card to save or unsave a brand.  Saved cards receive the `saved` class so that the heart can be styled differently.  Saved brand IDs are written to `localStorage.ds_saved` as a JSON array.  Reloading the page restores the saved state.
* **Share link** – The Share button copies the current page URL (including the selected vibe and category) to the clipboard and briefly shows a toast notification.  Visitors can send this link to others and the filter state will automatically initialise from the query parameters on load.
* **Analytics** – If `window.plausible` is available (loaded via the Plausible script), the page fires a `scroll_75` event when the visitor scrolls past 75 % of the document height and fires an `outbound_click` event each time a card’s link is clicked.  The brand ID is passed via the `props` payload.  A helper `config.js` file exposes `SKIM_ID` and `PLAUSIBLE_DOMAIN` so these values can be configured without modifying the script.
* **Skimlinks rewriting** – When a visitor clicks a card link, the script rewrites the link to a Skimlinks tracking URL before navigation.  The Skimlinks publisher ID comes from `window.SITE_CONFIG.SKIM_ID`.  If this value is empty the link falls back to the original home page URL.
* **Performance and bundle size** – The only JavaScript shipped to the browser is contained in `public/script.js`.  A small Node script (`scripts/check‑bundle.js`) is provided to verify that the gzipped size of this file does not exceed 12 kB.  This check is run automatically in CI.
* **Tests** – Playwright tests live under the `tests` directory and exercise the critical pieces of functionality: filtering hides non‑matching cards, favourites persist after reload, the URL reflects the current selection and the script bundle stays within the size budget.

## Getting started

1. Install dependencies (for running tests and the bundle check).  Playwright is included as a dev dependency:

   ```bash
   npm install
   npx playwright install --with-deps
   ```

2. Serve the site locally.  A minimal Node server is included.  It serves files from the `public` directory and defaults to `browse.html` on the root path:

   ```bash
   npm run serve
   # Visit http://localhost:3000/browse.html in your browser
   ```

3. Run the Playwright tests:

   ```bash
   npm test
   ```

4. Check the bundle size manually:

   ```bash
   npm run check-bundle
   ```

## Environment variables

Environment variables are surfaced to the client via the `public/config.js` file.  An example file is provided in `.env.example`; you should copy it to `.env` and fill in the values before deploying.  During deployment the CI workflow passes these values to Vercel so they end up baked into `config.js`.

* `SKIM_ID` – Your Skimlinks publisher ID.  Without this the script falls back to the original brand home page when links are clicked.
* `PLAUSIBLE_DOMAIN` – The Plausible domain for analytics.  If set, a Plausible script tag will be injected into the page and `plausible()` calls will fire for scroll and outbound click events.

## CI and deployment

The repository contains a GitHub Actions workflow (`.github/workflows/ci.yml`) that installs dependencies, verifies the script bundle size, runs Playwright tests and deploys to Vercel using `amondnet/vercel-action`.  You need to configure the following secrets in your GitHub repository:

* `VERCEL_TOKEN` – a Vercel API token
* `VERCEL_ORG_ID` – your Vercel organisation ID
* `VERCEL_PROJECT_ID` – the project ID created on Vercel
* `SKIM_ID` – your Skimlinks publisher ID
* `PLAUSIBLE_DOMAIN` – your Plausible analytics domain

Once the workflow completes successfully the PR comment will include a link to the deployed site, e.g. `✅ Deployed → https://<vercel-subdomain>/browse`.
