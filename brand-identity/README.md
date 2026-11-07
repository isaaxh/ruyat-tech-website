# Ruyat Tech — Brand Identity

**Vision, engineered.** · v1.0 · November 2026 · Powered by Ruyat Al Enjaz

Start with `guidelines/ruyat-tech-brand-guidelines.pdf`. It is a 39-page guide covering brand, logo, colour, typography, graphic language and applications.

## Folder map

| Folder | What's inside |
|---|---|
| `guidelines/` | Brand guidelines as a PDF and as editable HTML (the HTML reads assets from the sibling folders) |
| `logo/svg`, `logo/png` | Horizontal, stacked, endorsed, wordmark and mark logos in dark / light / black / white, plus the **micro mark** for sizes of 32 px and below |
| `app-icon/` | 1024 px app icon (full-bleed for App Store / Play) and a rounded preview |
| `favicon/` | `favicon.svg`, `.ico`, 16/32/48 PNG, apple-touch-icon, Android 192/512, `site.webmanifest` |
| `social/` | Profile avatar (circle-safe) |
| `patterns/` | Facet lattice (void, navy, light, gold), horizon arc, seamless `facet-tile.svg` |
| `icons/` | 16 line icons: 24 px grid, 1.5 px stroke, `currentColor` |
| `tokens/` | `tokens.css` (CSS variables + type classes), `tokens.json`, `tailwind.preset.js` (v3), `tailwind-v4-theme.css` |
| `fonts/` | Satoshi (OTF + WOFF2, Fontshare free licence), Inter, JetBrains Mono, Readex Pro and IBM Plex Sans Arabic (SIL OFL), plus a ready-made `fonts.css` |
| `mockups/` | Website hero, business card, social, app icon, presentation & email (PNG @2x) |

## Core values

| Token | HEX | Use |
|---|---|---|
| Vision Gold | `#F0B35E` | Mark, CTAs, highlights (≈6%) |
| Midnight Navy | `#041238` | Brand surface (≈22%) |
| Void | `#030A1F` | Primary background (≈60%) |
| Deep Gold | `#8A5A12` | Gold on light backgrounds and small text |
| Frost | `#EEF1F8` | Text / light surfaces |

Typography: **Satoshi** for headlines and big text (Bold 700; Black 900 at 72px and above; tracking −3.5 to −4.5%), **Inter** for body, and **JetBrains Mono** for labels (uppercase, +14%).

Arabic: **Readex Pro** (SemiBold 600 / Bold 700) for headlines and **IBM Plex Sans Arabic** (Regular 400 / Medium 500) for body. Set `lang="ar"` or `dir="rtl"` and `tokens.css` switches fonts, sets line height (1.25 headings, 1.75 body) and removes letter-spacing, which breaks Arabic joins.

## Website quick start

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/brand-identity/fonts/fonts.css">
<link rel="stylesheet" href="/brand-identity/tokens/tokens.css">
```

`fonts/fonts.css` loads Satoshi (WOFF2) and the Arabic fonts (TTF) from local files, and Inter + JetBrains Mono from Google Fonts. Copy the `fonts/` folder into your site's public assets if you move things around.

## Notes

- The logo text is outlined to paths. Never retype it.
- The mark geometry is unchanged from the approved Facet Eye. The micro mark is an additional cut for favicons and other tiny UI only.
- The wordmark is outlined from Satoshi Bold (Ruyat) and Satoshi Regular (Tech).


## motion/
Soft, easy motion kit for the website (guideline section 06).
- `motion.css` – soft reveal (`data-reveal`), hover lift, press, link underline, focus ring, reduced-motion rules
- `ruyat-motion.js` (global `RuyatMotion`) / `ruyat-motion.mjs` (ESM)
  - `initReveal()`
  - `mountFacetLattice(el, {mode})`, modes: `flash` (tiles), `beam` (comet along connected hexagon edges; `beamPreset:'drift'` for the long faint variant), `pulse` (light behind the grid showing through edges only), `all`, or combos like `'pulse+beam'`, `still`
- `demo.html` – hero demo with a mode toggle
- `reference/` – approved static frames and spec (LATTICE-MOTIONS.md)

```html
<link rel="stylesheet" href="/brand-identity/motion/motion.css">
<script src="/brand-identity/motion/ruyat-motion.js"></script>
<script>RuyatMotion.initReveal(); RuyatMotion.mountFacetLattice(document.querySelector('.hero'),{mode:'pulse'});</script>
```
