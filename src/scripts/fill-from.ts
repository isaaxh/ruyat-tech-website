// Secondary buttons fill with Frost from the point where the cursor enters or leaves (rtFillFrom in the design).
export function initFillFrom(): void {
  const set = (e: MouseEvent): void => {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--fx', `${e.clientX - r.left}px`);
    el.style.setProperty('--fy', `${e.clientY - r.top}px`);
    el.style.setProperty('--fd', `${Math.ceil(Math.sqrt(r.width * r.width + r.height * r.height) * 2.2)}px`);
  };
  document.querySelectorAll<HTMLElement>('.rt-btn--secondary').forEach((el) => {
    el.addEventListener('mouseenter', set);
    el.addEventListener('mouseleave', set);
  });
}
