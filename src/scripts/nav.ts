// Nav behaviour, ported from the design's watchNav() / expandNav / toggleMenu.
// Scrolling down compacts the bar into a pulsing gold dot (after 260 ms); scrolling up unpacks it (after 180 ms).
// A change of direction during the wait cancels the pending change.

export function initNav(): void {
  const nav = document.querySelector<HTMLElement>('header.nav');
  if (!nav) return;
  const dot = nav.querySelector<HTMLButtonElement>('.nav-dot');
  const menuBtn = nav.querySelector<HTMLButtonElement>('.menu-btn');
  const panel = nav.querySelector<HTMLElement>('.menu-panel');

  let compact = false;
  let menuOpen = false;

  function setCompact(v: boolean): void {
    if (compact === v) return;
    compact = v;
    nav!.classList.toggle('is-compact', v);
    nav!.classList.toggle('is-unpacked', !v);
    if (dot) dot.tabIndex = v ? 0 : -1;
  }

  function expand(): void {
    if (compact) setCompact(false);
  }

  function setMenu(open: boolean): void {
    menuOpen = open;
    if (!menuBtn || !panel) return;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', (open ? menuBtn.dataset.closeLabel : menuBtn.dataset.openLabel) ?? '');
    panel.classList.toggle('is-open', open);
  }

  // Wait a beat before compacting or unpacking; a change of direction in the meantime cancels it.
  let pending: boolean | null = null;
  let timer = 0;
  function want(v: boolean, delay: number): void {
    if (pending === v) return;
    clearTimeout(timer);
    pending = null;
    if (compact === v) return;
    pending = v;
    timer = window.setTimeout(() => {
      pending = null;
      setCompact(v);
    }, delay);
  }

  let lastY: number | null = null;
  let down = 0;
  let up = 0;
  function onScroll(): void {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    if (lastY === null) {
      lastY = y;
      return;
    }
    const dy = y - lastY;
    lastY = y;
    if (dy > 0) {
      down += dy;
      up = 0;
    } else if (dy < 0) {
      up -= dy;
      down = 0;
    }
    if (y < 120) {
      want(false, 0);
      down = 0;
      return;
    }
    if (down > 24 && !menuOpen) want(true, 260);
    else if (up > 10) want(false, 180);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  dot?.addEventListener('click', expand);
  // Keyboard users tabbing into the hidden bar bring it back (the design's onFocus on <header>).
  nav.addEventListener('focusin', expand);
  menuBtn?.addEventListener('click', () => setMenu(!menuOpen));
  panel?.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', () => setMenu(false)));
}
