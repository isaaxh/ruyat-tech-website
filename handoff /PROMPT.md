# Prompt for Claude Code: build tech.ruyat.sa

Paste everything below the line into Claude Code, from the root of an empty project folder that contains the `design/` and `reference/` folders from this package.

---

You are building the production website for **Ruyat Tech** (https://tech.ruyat.sa), the software arm of Ruyat Al Enjaz. The design is finished and approved. Your job is a **1:1 reproduction** in Astro, hosted on Cloudflare. Do not redesign, "improve", simplify or modernise anything. If something looks odd, copy it anyway and tell me afterwards.

## 1. What is in this folder

- `design/Main.dc.html`: the English homepage (source of truth).
- `design/Main-ar.dc.html`: the Arabic (RTL) homepage (source of truth).
- `design/assets/`: SVG and image assets (hex tiles, partner logos, project screenshots).
- `design/ds/ruyattech/`: design system. `components/bundle.css` (shared component CSS), `tokens.json` (colour, type, spacing, motion tokens), `fonts/` (Satoshi woff2).
- `design/canvas.json`: design-tool metadata only. Ignore it.
- `reference/`: full-page screenshots of the approved design: `en-1440.png`, `en-390.png`, `ar-1440.png`, `ar-390.png`. Use them to check your work visually. They were rendered without Google Fonts (blocked in my sandbox), so body text in them uses a fallback font. Inter, JetBrains Mono, Readex Pro and IBM Plex Sans Arabic must still load from Google Fonts in the real site.

### How to read the `.dc.html` files
They are design-canvas files, not normal HTML. You cannot open them in a browser as they are (they need a runtime that is not included). Read them as source:

- `<helmet>` holds the page `<style>` (all CSS) and font links. Port this CSS faithfully. Do not rewrite it into Tailwind or a different system.
- The page markup is inside `<x-dc>`. `{{name}}` are data/handler holes. `<sc-if value="{{x}}">` is a conditional. `ref="{{fxRef}}"` marks canvas elements the script attaches effects to. Replace these with real Astro/JS equivalents.
- `<script type="text/x-dc">` at the bottom contains all behaviour. `class Component extends DCLogic` has `state`, `setState`, and `renderVals()` which returns the handlers/classes the markup refers to. Treat this script as the **behaviour spec** and port it to plain browser JavaScript (no framework needed). The helper functions `rtHexFx()` (animated hexagon canvas), `rtEdgeGlow()` (cursor light on card edges and divider lines) and `rtClock()` are plain JS and can be reused almost verbatim.
- The Arabic file is the English file with translated copy plus an RTL CSS block appended at the end of `<style>`. Keep both in sync structurally.

## 2. Tech requirements

- **Astro** (latest stable), static output (`output: 'static'`), TypeScript where it helps, no UI framework. Small vanilla scripts only.
- **Cloudflare hosting.** Use Cloudflare Workers with static assets (Cloudflare's current recommended path for Astro), or Pages if that is simpler in the current Astro docs. Check the current Astro and Cloudflare docs before choosing. Add `wrangler.jsonc`, and a `pnpm`/`npm` script for `deploy`. Domain: **tech.ruyat.sa** (the parent domain ruyat.sa is already on Cloudflare DNS, and the main site on it must not be touched). Explain exactly which DNS record or custom-domain setting I need to add for the `tech` subdomain.
- **i18n routes:** English at `/`, Arabic at `/ar/`. Correct `<html lang dir>`, `hreflang` alternates, canonical URLs, and `og:` / Twitter meta in each language. The "English" / "العربية" links in the nav must link between the two pages (they are `#` placeholders in the design).
- Share components between the two languages: one set of Astro components, with copy in two dictionaries (e.g. `src/i18n/en.ts`, `src/i18n/ar.ts`). The Arabic copy must be exactly the text in `Main-ar.dc.html`.
- Fonts: Satoshi is self-hosted (`design/ds/ruyattech/fonts`, move to `public/fonts`). Inter, JetBrains Mono, Readex Pro, IBM Plex Sans Arabic come from Google Fonts with `display=swap` and `preconnect`. Arabic must use Readex Pro for headings and IBM Plex Sans Arabic for body, with **no letter-spacing** in Arabic.
- Design tokens are the `--rt-*` CSS variables at the top of the design's `<style>` and in `tokens.json`. Keep the names. Gold is `#F0B35E`, navy `#041238`, void `#030A1F`.
- Performance: images in `public/` or `src/assets` with width/height set, lazy-loaded below the fold, the two hex canvases and edge-glow script must only run when visible (they already use IntersectionObserver) and must respect `prefers-reduced-motion`. Target Lighthouse 95+ on performance, accessibility, best practices and SEO on mobile.
- Accessibility: keep every `aria-*`, `alt`, `role`, `aria-label`, focus style and keyboard behaviour from the design. Visible focus rings (2px gold) stay.

## 3. Page structure (in order, both languages)

1. **Nav**: logo (inline SVG), links Services / Process / Work / Testimonials / Contact (no pill around them; gold text on hover/focus), language link, "Start a project" button. Scroll behaviour: scrolling **down** compacts the bar into a small pulsing gold dot at the centre (260 ms delay, 560 ms CSS clip-path animation, bar stays navy, never turns gold); scrolling **up** unpacks it from the centre (180 ms delay, 680 ms). Clicking the dot expands it. State classes `.is-compact` / `.is-unpacked`, keyframes `rt-nav-pack` / `rt-nav-unpack`. Copy these keyframes exactly. On mobile (≤980px) the links collapse into a burger button with no circle around it; its two lines animate into a cross when the menu is open; the menu panel opens below.
2. **Hero**: headline "We build software that builds your business", sub-line, CTAs, hexagon lattice canvas background, a small live clock at the bottom-right of the hero (`rtClock()`, hidden on mobile), the horizon arc and planet (the arc must not become elongated on mobile: use the mobile rules in the design).
3. **Trusted by**: partner logo marquee (infinite scroll, pauses on hover, static and wrapped under reduced motion).
4. **What we build** (`#services`): 4 cards (mobile app, web app, website, automation) with inline SVG art, the animated dots in the automation card (animateMotion with a mask so the centre hexagon covers dots passing through it), card edges that light up under the cursor (**edges only, never the inside, no lift on hover**), and a link in each card that preselects the matching service in the contact form.
5. **How we work** (`#process`): 6 stages with a one-sentence description each, joined by vertical lines that light up under the cursor like the card edges.
6. **Work we're proud of** (`#work`): QuickBite (mobile app) as a feature with three pure-CSS phone frames (`quickbite-1/2/3.jpg`), then MoneyLion and Perdana Fellows Alumni Association in pure-CSS MacBook frames, linking out (`target="_blank" rel="noopener"`) to https://www.moneylion.com/ and https://www.perdanafellowsalumni.com/.
7. **Why us** (`#why-us`, not in the nav) with the reasons grid and the "backed by Ruyat Al Enjaz" panel.
8. **Testimonials** (`#testimonials`): stacked glass-card carousel of 3 quotes, arrow buttons, dots, swipe on touch, left/right arrow keys, **autoplay every 6 s that loops**, paused on hover/focus and under reduced motion. No slide counter.
9. **Contact** (`#contact`): heading, intro, form panel, and a details list with **gold line icons** (mail, phone, pin, clock) instead of text labels (keep the label text visually hidden for screen readers). Details: info@ruyat.sa, +966 58 357 9979 (tel link), Ash Shawqiyah, Makkah, Saudi Arabia, "Saturday to Thursday, 8:30 AM to 6:30 PM". **Below 1100px the form comes before the details list** (the intro text stays on top). Soft focus state on fields: subtle gold border and glow, no background change. Arrow icons in every arrow button nudge slightly right on hover.
10. **Footer**: logo, tagline, "Powered by Ruyat Al Enjaz" badge, link columns, contact lines with the same gold icons, social links, legal row, back-to-top.
11. **Cookie banner**: as designed. Store the choice in `localStorage` (try/catch), do not show again once chosen.

Hexagon lattice backgrounds (`.hexbg`, `.hex-*`, `.hex2-*`, `.card-hex`) and the two canvas effects are used in most sections. Reproduce all of them.

## 4. Contact form (sends to WhatsApp only)

There is **no email, no backend and no API route** for the form. When a visitor fills it in and submits, the enquiry goes to Ruyat Tech's WhatsApp, and nowhere else.
- Fields, validation, error messages, focus-first-invalid behaviour and the soft gold focus state stay exactly as in the design: name, email, phone/WhatsApp (optional), business (optional), service (Mobile app / Web app / Website / Automation / Not sure yet), project details.
- On a valid submit, build a prefilled message and open WhatsApp with it: `https://wa.me/966583579979?text=<encodeURIComponent(message)>`. The number is +966 58 357 9979, kept in one config constant so it is easy to change.
- Message format: plain text, one field per line, in the language of the page (English page: English labels; Arabic page: Arabic labels, with the visitor's own text unchanged). Include name, email, phone, business, service and project details. Skip optional fields that are empty. Start with a short greeting line, e.g. "New project enquiry from tech.ruyat.sa".
- Open it in a way that is not blocked: on mobile use `window.location.href`, on desktop `window.open(url, '_blank', 'noopener')`, called directly from the submit handler (not after an `await` or timeout). Keep the visitor's form data until the success panel shows.
- Then show the existing success panel. Its text in the design says we will reply by email; change it minimally so it is true (for example "Thanks, {name}. WhatsApp should have opened with your message ready. Tap send to finish."), in both languages, and add a small "Open WhatsApp again" link in the panel in case the app did not open. Remove the "That didn't send" error state, since there is no server to fail. Flag the new copy to me in your final notes so I can approve the wording.
- Do not collect or store submissions anywhere. No Turnstile, no email provider, no secrets. If you want spam protection, a hidden honeypot field that blocks the redirect is enough.

## 5. How to work

1. First read both `.dc.html` files fully, then reply with a short plan (folder structure, component list, how you will port the script, any ambiguities). Ask me only about things you genuinely cannot decide.
2. Scaffold the project, port the CSS and markup section by section, then the behaviours.
3. After each major section, run the site locally and compare with `reference/*.png` at **1440px and 390px**, English and Arabic, using Playwright screenshots. Fix differences in spacing, type size, colour, radius, gradients and animation before moving on. Also check 768px and 1100px (layouts change at max-width 1100, 980, 860, 760, 640 and 520px).
4. When done, verify: no console errors, no horizontal scroll at 320px, all links and anchors work, Arabic is fully RTL (arrows, carousel keys, swipe, form alignment), keyboard navigation works end to end, reduced-motion respected, Lighthouse scores.
5. Deliver: the repo, a README (install, dev, build, deploy, env vars, DNS steps for `tech.ruyat.sa`), and a short list of anything that differs from the design and why.

## 6. Hard rules

- 1:1 with the design. Copy text exactly (English and Arabic). *(Superseded 2026-11-08: copy now follows `website-copy/*.md`; see README "Arabic voice".)* Do not rewrite copy, rename sections or change colours.
- Do not add libraries for things CSS or small vanilla JS already do (no Tailwind, no animation libraries, no carousel plugins).
- Do not touch anything outside this project. Do not change DNS, deploy, or push to a remote without asking me first.
- Placeholders in the design that I have not filled yet (social links `#`, Privacy policy `#`, Terms `#`) stay as `#` and go in your "to finish" list. Do not invent URLs or legal text.
