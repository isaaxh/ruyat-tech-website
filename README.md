# Ruyat Tech website

Source for [tech.ruyat.sa](https://tech.ruyat.sa), the software arm of Ruyat Al Enjaz.
Static [Astro](https://astro.build) site, hosted on Cloudflare Workers (static assets).

- English: `/`
- Arabic (RTL): `/ar/`

## Requirements

- Node.js 22.23.4+ (developed on Node 24)
- npm 11

## Commands

| Command              | What it does                                                    |
| -------------------- | --------------------------------------------------------------- |
| `npm install`        | Install dependencies                                            |
| `npm run dev`        | Astro dev server at http://localhost:4321                       |
| `npm run build`      | Build the static site to `dist/`                                |
| `npm run check`      | Type-check `.astro` and `.ts` files                             |
| `npm run preview`    | Build, then serve `dist/` with the Workers runtime (`wrangler dev`) |
| `npm run cf:dry-run` | Build and validate the Cloudflare deploy without uploading      |
| `npm run deploy`     | Build and deploy to Cloudflare (`wrangler deploy`)              |

## Environment variables

None. The site is fully static: no backend, API routes or secrets. The contact form opens WhatsApp with a prefilled message.

## Project structure

```
src/
  components/   shared Astro components (used by both languages)
  i18n/         en.ts, ar.ts copy dictionaries + locale helpers
  layouts/      Base.astro (html lang/dir, canonical, hreflang, og/twitter meta)
  pages/        index.astro (EN), ar/index.astro (AR)
  scripts/      small vanilla browser scripts
  styles/       global CSS ported from the design
public/
  fonts/        self-hosted Satoshi (woff2)
design/         approved design source (.dc.html), assets and design system
reference/      full-page screenshots of the approved design
```

## Deploying to Cloudflare

Deploys use Cloudflare Workers with static assets, Cloudflare's recommended path for new Astro projects. A fully static site does not need the `@astrojs/cloudflare` adapter. Config is in `wrangler.jsonc`.

1. Log in once: `npx wrangler login`
2. Deploy: `npm run deploy`

The first deploy publishes to `https://ruyat-tech-website.<your-subdomain>.workers.dev`. Check the site there before attaching the domain.

## DNS: pointing tech.ruyat.sa at the Worker

`ruyat.sa` is already on Cloudflare DNS. Attach the subdomain as a **Workers Custom Domain**. Cloudflare then creates the `tech` DNS record and the TLS certificate itself. No other record on `ruyat.sa` is touched, so the main site is unaffected.

First check that no `tech` record already exists: in the Cloudflare dashboard, go to **ruyat.sa → DNS → Records**. If a `CNAME` (or any other record) for `tech` exists, delete it, because a Custom Domain cannot be created over an existing CNAME.

Then do **one** of the following:

- **Dashboard:** go to **Workers & Pages → ruyat-tech-website → Settings → Domains & Routes → Add → Custom Domain**, enter `tech.ruyat.sa`, then select **Add Custom Domain**.
- **Wrangler:** uncomment the `routes` entry in `wrangler.jsonc`:
  ```jsonc
  "routes": [{ "pattern": "tech.ruyat.sa", "custom_domain": true }]
  ```
  and run `npm run deploy`.

Once done, the zone's DNS tab shows a `tech` record of type **Worker**. Do not add a manual `A`/`CNAME` record for `tech`.
