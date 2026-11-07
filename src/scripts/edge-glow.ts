// Gold light that follows the cursor along every card edge and divider line nearby (rtEdgeGlow in the design).
// Only elements within 400px of the viewport are painted. Skipped under prefers-reduced-motion.

export function initEdgeGlow(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let px = -9999;
  let py = -9999;
  let raf = 0;
  let els: HTMLElement[] = [];

  function paint(): void {
    raf = 0;
    const vh = window.innerHeight;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -400 || r.top > vh + 400) continue;
      el.style.setProperty('--mx', `${px - r.left}px`);
      el.style.setProperty('--my', `${py - r.top}px`);
      el.style.setProperty('--myb', `${py - r.bottom}px`);
    }
  }
  const ask = (): void => {
    if (!raf) raf = requestAnimationFrame(paint);
  };
  const move = (e: PointerEvent): void => {
    px = e.clientX;
    py = e.clientY;
    ask();
  };
  const leave = (): void => {
    px = -9999;
    py = -9999;
    ask();
  };

  els = Array.from(document.querySelectorAll<HTMLElement>('.edge, .edge-line, .reach > div'));
  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerleave', leave);
  document.documentElement.addEventListener('mouseleave', leave);
  window.addEventListener('scroll', ask, { passive: true, capture: true });
}
