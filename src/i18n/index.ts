import { en } from './en';
import { ar } from './ar';

export type Locale = 'en' | 'ar';

export interface Dictionary {
  lang: Locale;
  dir: 'ltr' | 'rtl';
  meta: { title: string; description: string };
}

const dictionaries: Record<Locale, Dictionary> = { en, ar };

export const locales: Locale[] = ['en', 'ar'];

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];

/** Path of the homepage for a locale: `/` for English, `/ar/` for Arabic. */
export const localePath = (locale: Locale): string => (locale === 'en' ? '/' : `/${locale}/`);
