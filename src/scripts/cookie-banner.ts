// Cookie banner: shown until the visitor accepts or declines; the choice is remembered in localStorage.
import { COOKIE_KEY } from '../config';

function read(): string | null {
  try {
    return localStorage.getItem(COOKIE_KEY);
  } catch {
    return null;
  }
}
function write(v: string): void {
  try {
    localStorage.setItem(COOKIE_KEY, v);
  } catch {
    /* storage unavailable: the banner will show again next visit */
  }
}

export function initCookieBanner(): void {
  const banner = document.querySelector<HTMLElement>('.cookie');
  if (!banner || read()) return;
  banner.hidden = false;
  banner.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach((b) =>
    b.addEventListener('click', () => {
      write(b.dataset.choice || 'declined');
      banner.hidden = true;
    }),
  );
}
