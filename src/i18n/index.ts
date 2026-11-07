import { en } from './en';
import { ar } from './ar';

export type Locale = 'en' | 'ar';

/** Shape of a copy dictionary. English is the source of truth; Arabic must match it. */
export type Dictionary = Omit<typeof en, 'lang' | 'dir'> & { lang: Locale; dir: 'ltr' | 'rtl' };

const dictionaries: Record<Locale, Dictionary> = { en: en as Dictionary, ar };

export const locales: Locale[] = ['en', 'ar'];

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];

/** Path of the homepage for a locale: `/` for English, `/ar/` for Arabic. */
export const localePath = (locale: Locale): string => (locale === 'en' ? '/' : `/${locale}/`);
