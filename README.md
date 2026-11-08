# Ruyat Tech website

Source for [tech.ruyat.sa](https://tech.ruyat.sa), the software arm of Ruyat Al Enjaz.
Static [Astro](https://astro.build) site, hosted on Cloudflare Workers (static assets).

- Arabic (RTL, the default language): `/`
- English: `/en/`

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
| `npm test`           | Build, then run the Playwright end-to-end tests                 |
| `npm run test:e2e`   | Run the Playwright tests against the existing `dist/`           |
| `npm run preview`    | Build, then serve `dist/` with the Workers runtime (`wrangler dev`) |
| `npm run cf:dry-run` | Build and validate the Cloudflare deploy without uploading      |
| `npm run deploy`     | Build and deploy to Cloudflare (`wrangler deploy`)              |

## Environment variables

None. The site is fully static: no backend, API routes or secrets.

## Contact form (WhatsApp)

The form has no server. On a valid submit it builds a plain-text message (one field per line, labels in the page's
language, empty optional fields skipped) and opens `https://wa.me/966583579979?text=…`: in the same tab on mobile,
in a new tab on desktop. Then it shows the success panel with an "Open WhatsApp again" link. Nothing is stored.
A hidden honeypot field blocks the redirect for bots.

The number lives in one place: `WHATSAPP_NUMBER` in `src/config.ts` (digits only, international format).

## Arabic voice

Arabic copy lives in `src/i18n/ar.ts` and follows `website-copy/ruyat-tech-website-copy-ar.md`. Rules:

- **Register:** friendly, conversational Saudi-leaning white dialect (لهجة بيضاء), not formal Modern Standard Arabic.
  Modelled on the tone of glow.net.sa/ar.
- **Common words:** وش (what), الحين (now), كلمنا (talk to us), شوف (see), ما أدري / مو (don't know / not), بدري (early),
  عشان (so that), ليش (why), زين (good), راح (will).
- **Address:** speak to the reader directly with "أنت" and as "نحن", a partner and not a vendor.
- **Sentences:** short and practical, stating what the customer gets. Worry cards open with the customer's own words
  ("أخاف...", "ما أدري...") followed by "حلنا".
- **Technical terms** stay in English where people use them (App Store, Google Play, iPhone, Android, MacBook, NDA).
- **No invented promises.** Only claim what the English copy states: 60-day free maintenance, client ownership, data
  protection, scope and timeline agreed before work starts, published under the client's accounts.
- **Keep exactly as they are:** brand names, emails, phone numbers and links.
- **Testimonials** use the same dialect as the rest of the site ("سعدت بالشغل مع...", "دايمًا يسلّمون...").
- **Legal pages** (privacy policy, terms) stay in standard Arabic.
- **English copy** stays plain and friendly (`website-copy/ruyat-tech-website-copy-en.md`).

## Project structure

```
src/
  components/
    HomePage.astro   composes the page; used by both routes
    brand/           Logo, Mark
    icons/           Icon (+ paths.ts), Arrow
    ui/              Button, Badge, Diamond, SectionHead, HexFx, Edge, EdgeLine, CardHex
    layout/          Nav, Footer
    sections/        Hero, Partners, Services, Worries, Process, Work, WhyUs, Testimonials, Contact
                     (+ one folder per section for its smaller parts)
  i18n/              en.ts, ar.ts copy dictionaries + locale helpers
  layouts/           Base.astro (html lang/dir, canonical, hreflang, og/twitter meta, fonts)
  pages/             index.astro (EN), ar/index.astro (AR)
  scripts/           vanilla TS behaviour ported from the design (one module per behaviour)
  styles/            design CSS split into ordered partials; global.css sets the order
  config.ts          WhatsApp number, contact details, external links
  assets/work/       case-study screenshots (optimised to WebP at build time)
public/
  fonts/             self-hosted Satoshi (woff2)
  assets/            hexagon tiles and partner logos
tests/e2e/           Playwright tests
tools/               shot.mjs (full-page screenshots), serve.mjs (static server for tests)
design/              approved design source (.dc.html), assets and design system
reference/           full-page screenshots of the approved design
```

CSS order matters: `src/styles/global.css` imports the partials in the same order as the design's single stylesheet
(design system, then page styles section by section, then the RTL block). Add new rules to the partial that owns
the section, and don't reorder the imports.

## Testing

- `npm test` runs 58 Playwright checks on both languages: meta and hreflang, console errors, anchors, external
  links, image attributes, no horizontal scroll from 320px to 1440px, nav pack/unpack, burger menu, carousel
  (arrows, dots, mirrored keys and swipe, 6 s autoplay, pause, reduced motion), form validation and focus, the
  WhatsApp message in both languages, honeypot, focus rings and reduced-motion behaviour.
- `node tools/shot.mjs http://127.0.0.1:4321 shots` writes full-page screenshots at 1440px and 390px for comparison
  with `reference/`. Google Fonts are blocked by default, as in the reference renders; pass `--fonts` to load them.
- Lighthouse (mobile): performance 98–99, accessibility 97, best practices 100, SEO 100 on both pages.

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

## Differences from the design

- **Hero clock omitted.** The brief mentions a live clock, but the final design markup and screenshots have none
  (only unused CSS). Left out by agreement.
- **Contact success copy and WhatsApp flow** (new copy, needs approval, see below). The "That didn't send" error
  state was removed: there is no server that can fail.
- **Reference screenshot artifacts are not reproduced.** The reference renders show a few things that the design
  source does not intend: the mobile menu links printed under the nav on desktop, the name/email/service/details
  fields missing their `.field`/`.full` classes (so service and details sit side by side), black device screens
  and an empty hero lattice. The site follows the design source.
- **Unused CSS dropped**: rules for elements that aren't in the markup (hero foot/clock, scroll hint, logo grid,
  case `dl`, the form error alert) and the unused design-system components.
- **Small invisible additions**: `name`/`autocomplete` on form fields; `scroll-margin-top` on form fields so a field
  focused by validation isn't hidden under the sticky nav; the success panel receives focus after submit; the edge-glow cursor
  light is off under `prefers-reduced-motion`.
- **Meta tags**: the design has none. Titles and descriptions reuse existing hero copy
  ("Ruyat Tech | We build software that builds your business").
- **Accessibility note**: the testimonial dots are 8px with 10px gaps, below the 24px touch-target guideline
  (Lighthouse a11y 97). Fixing it would change the design. The skip link is visually hidden even on focus, as in
  the design.

## New copy to approve

| Where | English | Arabic |
| --- | --- | --- |
| Success heading | Thanks, {first name}. Your message is ready. | شكرًا يا {first name}، رسالتك جاهزة. |
| Success text | WhatsApp should have opened with your message ready. Tap send to finish. | من المفترض أن يكون واتساب قد فُتح ورسالتك جاهزة فيه. اضغط إرسال لإتمام الطلب. |
| Success link | Open WhatsApp again | افتح واتساب مرة أخرى |
| WhatsApp first line | New project enquiry from tech.ruyat.sa | طلب مشروع جديد من tech.ruyat.sa |
| WhatsApp labels | Name, Email, Phone, Business, Service, Project details | الاسم، البريد الإلكتروني، الهاتف، النشاط التجاري، الخدمة، تفاصيل المشروع |
| Page title | Ruyat Tech \| We build software that builds your business | رؤية تك \| نبني البرمجيات التي تبني أعمالك |

## To finish

- Privacy policy and Terms are `#` placeholders in the footer. Social links (Instagram, TikTok, Snapchat),
  phone and map link come from `website-copy/` and live in `src/config.ts`.
- Deploy and attach the `tech.ruyat.sa` custom domain (steps above).
