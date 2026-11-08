// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://tech.ruyat.sa',
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'ar',
    locales: ['en', 'ar'],
    routing: { prefixDefaultLocale: false },
  },
  build: {
    // One small page per language: inlining the CSS saves a render-blocking request on mobile.
    inlineStylesheets: 'always',
  },
});
