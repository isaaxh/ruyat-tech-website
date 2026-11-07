# Handoff / progress log

Running notes so work can resume in a fresh session. Keep this updated at every commit.

## Task
Build tech.ruyat.sa as a 1:1 Astro port of `design/Main.dc.html` (EN) and `design/Main-ar.dc.html` (AR).
Full brief: `handoff /PROMPT.md`. Reference screenshots: `reference/*.png`.

## Decisions made with the user
- Repo: github.com/isaaxh/ruyat-tech-website (public), npm, commit after each step with short messages.
- Hero clock: **omitted**. The final design markup and screenshots don't have it, although PROMPT.md mentions it.
- Follow the `.dc.html` source where the reference screenshots show render artifacts (see "Reference artifacts").

## Architecture
- `src/styles/global.css` imports partials in a fixed order that mirrors the design's single stylesheet:
  tokens → ds (design-system subset) → base → controls → sections/* → rtl.css. Don't reorder.
- `src/i18n/en.ts`, `ar.ts`: all copy. `Dictionary` type = shape of `en`. Strings marked NEW are not in the design.
- `src/config.ts`: WhatsApp number, contact details, external links, cookie key.
- `src/components/HomePage.astro` composes everything; `src/pages/index.astro` (en) and `src/pages/ar/index.astro` (ar).
- Components: `brand/` (Logo, Mark), `icons/` (Icon + paths.ts, Arrow), `ui/` (Button, Diamond, HexFx, Edge,
  EdgeLine, CardHex, Badge, SectionHead), `layout/` (Nav, Footer, CookieBanner), `sections/` (one per section,
  with subfolders for their parts).
- Scripts (`src/scripts/`), each `initX()` called from the owning component's `<script>`:
  nav, hero-lattice, hex-fx, edge-glow, fill-from, testimonials, contact-form (WhatsApp), cookie-banner.
- Images: work screenshots in `src/assets/work` (astro:assets → webp + srcset); partner logos and lattice tiles in `public/assets`.

## Testing tools
- `node tools/shot.mjs <baseUrl> <outDir> [--fonts] [--widths=1440,390] [--paths=/,/ar/]`: full-page screenshots
  (Google Fonts blocked by default, as in the reference renders).
- Debug scripts that need Playwright go in `.scratch/` (gitignored); Node can't resolve packages from the scratchpad.
- An `astro dev` server on :4321 belongs to the user; don't kill it. `astro preview` daemonises (it picked :4322).

## Reference artifacts (screenshots differ from the source; we follow the source)
- Mobile menu panel links visible under the nav on desktop and mobile (unresolved `menuPanelClass` hole).
- Contact form: name/email/service/details lose the `.field`/`.full` classes, so labels are unstyled and
  service + details sit side by side. Source says `.field` / `.field.full`.
- Phone/MacBook screens render black (lazy images not loaded in the render).
- Hero lattice canvas blank (canvas not run).
- Arabic fallback font differs (Google Fonts blocked); compare AR with `--fonts`.

## Status
- [x] Scaffold, Cloudflare config, README
- [x] CSS port, i18n, components, scripts, both pages
- [x] Visual check 1440/390 EN+AR against reference
- [x] Playwright e2e tests: 58 passing (`npm test`)
- [x] 768/1100 checks, reduced motion, keyboard basics, form states (error/success, EN/AR)
- [x] Lighthouse mobile: perf 98-99, a11y 97 (tq-dot target size, design-bound), BP 100, SEO 100.
      One early run gave perf 68: noise from other processes; re-runs were stable at 98-99.
- [x] README: differences list, "to finish" list, new copy to approve
- [ ] Waiting on the user: approve new copy, provide social/legal URLs and OG image, then deploy + DNS
