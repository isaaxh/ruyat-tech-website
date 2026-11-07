// Stacked testimonial carousel (tq* handlers in the design).
// Arrows, dots, left/right keys, swipe. Autoplay every 6 s, looping; paused on hover/focus,
// restarted after manual navigation, and off under prefers-reduced-motion. Keys and swipe follow the page direction.

export function initTestimonials(): void {
  const root = document.querySelector<HTMLElement>('.tq');
  if (!root) return;
  const cards = Array.from(root.querySelectorAll<HTMLElement>('.tq-card'));
  const dots = Array.from(document.querySelectorAll<HTMLButtonElement>('.tq-nav .tq-dot'));
  const n = cards.length;
  if (!n) return;
  const rtl = document.documentElement.dir === 'rtl';

  let cur = 0;
  let last = Date.now();
  let hold = false;

  function render(): void {
    cards.forEach((card, i) => {
      const rel = (i - cur + n) % n;
      card.classList.toggle('is-front', rel === 0);
      card.classList.toggle('is-next', rel === 1);
      card.classList.toggle('is-prev', rel > 1);
      card.setAttribute('aria-hidden', rel === 0 ? 'false' : 'true');
    });
    dots.forEach((d, i) => d.classList.toggle('is-on', i === cur));
  }
  function go(i: number): void {
    last = Date.now();
    cur = ((i % n) + n) % n;
    render();
  }
  const next = (): void => go(cur + 1);
  const prev = (): void => go(cur - 1);

  root.querySelector('.tq-prev')?.addEventListener('click', prev);
  root.querySelector('.tq-next')?.addEventListener('click', next);
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));

  root.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    // In Arabic the "next" card is to the left.
    const forward = rtl ? e.key === 'ArrowLeft' : e.key === 'ArrowRight';
    if (forward) next();
    else prev();
  });

  let startX: number | null = null;
  root.addEventListener(
    'touchstart',
    (e) => {
      startX = e.touches[0] ? e.touches[0].clientX : null;
    },
    { passive: true },
  );
  root.addEventListener('touchend', (e) => {
    if (startX == null || !e.changedTouches[0]) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) {
      const forward = rtl ? dx > 0 : dx < 0;
      if (forward) next();
      else prev();
    }
  });

  const pause = (): void => {
    hold = true;
  };
  const resume = (): void => {
    hold = false;
    last = Date.now();
  };
  root.addEventListener('mouseenter', pause);
  root.addEventListener('mouseleave', resume);
  root.addEventListener('focusin', pause);
  root.addEventListener('focusout', resume);

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.setInterval(() => {
      if (hold || document.hidden || Date.now() - last < 6000) return;
      next();
    }, 500);
  }
}
