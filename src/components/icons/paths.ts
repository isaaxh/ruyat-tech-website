// 24x24 line icons (stroke 1.5, round caps), copied from the design's inline SVGs.
export const ICONS = {
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"></circle>',
  tiktok: '<path d="M14 3.5v10.2a3.7 3.7 0 1 1-3.7-3.7"></path><path d="M14 3.5c.3 2.4 1.9 4 4.6 4.2"></path>',
  snapchat: '<path d="M12 3.5c-2.7 0-4.5 2-4.5 4.6v2.3c-.9.3-2.2.7-2.2 1.3 0 .6 1.1.8 1.7 1-.4 1.200-1.400 2.200-2.700 2.800.8.5 1.800.6 2.500.7.4.8 1.100 1.100 2.100.9.9-.2 1.500.7 3.100.7s2.200-.9 3.100-.7c1 .2 1.700-.1 2.100-.9.7-.1 1.700-.2 2.500-.7-1.300-.6-2.300-1.600-2.700-2.800.6-.2 1.700-.4 1.700-1 0-.6-1.300-1-2.200-1.300V8.100c0-2.600-1.800-4.600-4.500-4.600z"></path>',
  arrow: '<path d="M4.75 12h14.5M13.5 6.25L19.25 12l-5.75 5.75"></path>',
  'arrow-ne': '<path d="M7 17L17 7M8.5 7H17v8.5"></path>',
  'arrow-up': '<path d="M12 19.25V4.75M6.25 10.5L12 4.75l5.75 5.75"></path>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  // Service icons
  mobile: '<rect x="6.5" y="2.75" width="11" height="18.5" rx="2.5"></rect><path d="M10.5 5.75h3"></path><path d="M12 17.25l1.25 1.25L12 19.75l-1.25-1.25z"></path>',
  webapp: '<rect x="2.75" y="4.25" width="18.5" height="15.5" rx="2.5"></rect><path d="M2.75 8.75h18.5"></path><path d="M6 6.5h.01M8.5 6.5h.01"></path><path d="M9.5 12.5l-2.5 2.25 2.5 2.25M14.5 12.5l2.5 2.25-2.5 2.25"></path>',
  website: '<circle cx="12" cy="12" r="9.25"></circle><path d="M2.75 12h18.5"></path><path d="M12 2.75c2.6 2.6 3.75 5.8 3.75 9.25S14.6 18.65 12 21.25C9.4 18.65 8.25 15.45 8.25 12S9.4 5.35 12 2.75z"></path>',
  automation: '<circle cx="6" cy="6" r="2.75"></circle><circle cx="18" cy="18" r="2.75"></circle><path d="M8.75 6H15a3 3 0 0 1 3 3v6.25"></path><path d="M15.25 18H9a3 3 0 0 1-3-3V8.75"></path><path d="M16 13.25l2 2 2-2M8 10.75l-2-2-2 2"></path>',
  // Why-us icons
  chat: '<path d="M20.25 11.5c0 4.28-3.7 7.75-8.25 7.75-1.2 0-2.350-.24-3.4-.67L3.75 20.25l1.5-3.9A7.4 7.4 0 0 1 3.75 11.5C3.75 7.22 7.45 3.75 12 3.750s8.25 3.47 8.25 7.75z"></path><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"></path>',
  hexagon: '<path d="M12 2.75l8 4.62v9.26l-8 4.62-8-4.62V7.37z"></path><circle cx="12" cy="12" r="3"></circle>',
  steps: '<path d="M3.75 20.25h16.5"></path><path d="M6.5 16.5v-4M11 16.5V7.5M15.5 16.5v-6M20 16.5V4.75"></path>',
  rocket: '<path d="M12 2.75c3.5 2.5 5 6 5 9.75v3.75H7V12.5c0-3.75 1.5-7.250 5-9.75z"></path><circle cx="12" cy="10" r="1.75"></circle><path d="M7 13.5l-2.5 2.25v3.5L7 18M17 13.5l2.5 2.25v3.5L17 18M10.25 19.5L12 21.25l1.75-1.75"></path>',
  code: '<path d="M8.5 7.5L4 12l4.5 4.5M15.5 7.5L20 12l-4.5 4.5M13.5 5l-3 14"></path>',
  shield: '<path d="M12 2.75l7.75 3v6c0 4.6-3.2 8.2-7.75 9.5-4.55-1.3-7.75-4.9-7.75-9.5v-6z"></path><path d="M8.75 12l2.25 2.25 4.25-4.5"></path>',
} as const;

export type IconName = keyof typeof ICONS;
