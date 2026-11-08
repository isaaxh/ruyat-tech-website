// Site-wide constants. Change contact details here only.
export const SITE_URL = 'https://tech.ruyat.sa';

/** WhatsApp number that receives contact-form enquiries (digits only, international format, no +). */
export const WHATSAPP_NUMBER = '966583579979';

export const CONTACT = {
  email: 'info@ruyat.sa',
  phoneDisplay: '+966 58 357 9979',
  phoneHref: 'tel:+966583579979',
  /** Directions to the office in Ash Shawqiyah, Makkah. */
  mapsHref: 'https://www.google.com/maps/dir/?api=1&destination=21.383771,39.785028',
} as const;

/** Social profiles, in footer order. Labels live in the dictionaries (footer.social). */
export const SOCIAL_LINKS = [
  'https://www.instagram.com/ruyat.sa/',
  'https://www.tiktok.com/@ruyat.sa',
  'https://www.snapchat.com/add/ruyat.sa',
] as const;

/** Number behind the floating WhatsApp button (digits only, international format, no +). */
export const FLOATING_WHATSAPP_NUMBER = '966583579979';

/** External links for the work section. */
export const LINKS = {
  moneylion: 'https://www.moneylion.com/',
  perdana: 'https://www.perdanafellowsalumni.com/',
} as const;

/** localStorage key for the cookie banner choice. */
export const COOKIE_KEY = 'rt-cookie-choice';
