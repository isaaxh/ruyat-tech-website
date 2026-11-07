// Contact form: validation as in the design, then the enquiry is handed to WhatsApp (no backend, nothing stored).
// On a valid submit we build a plain-text message and open wa.me directly from the submit handler,
// so pop-up blockers allow it. A filled honeypot field silently skips the redirect.

export interface ContactFormCopy {
  number: string;
  successTitle: string; // contains "{name}"
  labels: { greeting: string; name: string; email: string; phone: string; business: string; service: string; details: string };
}

type Field = 'name' | 'email' | 'phone' | 'business' | 'service' | 'details';
const REQUIRED: Field[] = ['name', 'email', 'service', 'details'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function buildWhatsAppUrl(number: string, labels: ContactFormCopy['labels'], v: Record<Field, string>): string {
  const lines = [labels.greeting, ''];
  const add = (label: string, value: string): void => {
    if (value) lines.push(`${label}: ${value}`);
  };
  add(labels.name, v.name);
  add(labels.email, v.email);
  add(labels.phone, v.phone);
  add(labels.business, v.business);
  add(labels.service, v.service);
  add(labels.details, v.details);
  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`;
}

const isMobile = (): boolean =>
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));

function openWhatsApp(url: string): void {
  if (isMobile()) window.location.href = url;
  else window.open(url, '_blank', 'noopener');
}

export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('form.form');
  const panel = form?.closest<HTMLElement>('.form-panel');
  const success = panel?.querySelector<HTMLElement>('.success');
  if (!form || !panel || !success) return;
  const copy = JSON.parse(form.dataset.copy || '{}') as ContactFormCopy;

  const ctl = (k: Field): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement =>
    form.querySelector(`#f-${k}`)!;

  function setError(k: Field, on: boolean): void {
    const el = ctl(k);
    el.closest('.field')?.classList.toggle('is-error', on);
    el.setAttribute('aria-invalid', on ? 'true' : 'false');
    const msg = document.getElementById(`f-${k}-err`);
    if (msg) msg.hidden = !on;
  }

  // Typing in a field clears its error (setField in the design).
  REQUIRED.forEach((k) => {
    const el = ctl(k);
    const clear = (): void => {
      if (el.closest('.field')?.classList.contains('is-error')) setError(k, false);
    };
    el.addEventListener('input', clear);
    el.addEventListener('change', clear);
  });

  // Service cards preselect the matching option.
  document.querySelectorAll<HTMLAnchorElement>('a[data-service]').forEach((a) =>
    a.addEventListener('click', () => {
      const sel = ctl('service') as HTMLSelectElement;
      sel.value = a.dataset.service || '';
      setError('service', false);
    }),
  );

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = {} as Record<Field, string>;
    (['name', 'email', 'phone', 'business', 'service', 'details'] as Field[]).forEach((k) => {
      v[k] = ctl(k).value.trim();
    });
    const errors: Partial<Record<Field, boolean>> = {
      name: !v.name,
      email: !EMAIL_RE.test(v.email),
      service: !v.service,
      details: !v.details,
    };
    REQUIRED.forEach((k) => setError(k, Boolean(errors[k])));
    const first = REQUIRED.find((k) => errors[k]);
    if (first) {
      ctl(first).focus();
      return;
    }

    const url = buildWhatsAppUrl(copy.number, copy.labels, v);
    const trap = form.querySelector<HTMLInputElement>('.hp input');
    if (!trap || !trap.value) openWhatsApp(url);

    // Show the success panel; the form keeps its values until this point.
    const firstName = v.name.split(/\s+/)[0];
    const title = success.querySelector('h3');
    if (title) title.textContent = copy.successTitle.replace('{name}', firstName);
    const again = success.querySelector<HTMLAnchorElement>('.success-again');
    if (again) again.href = url;
    form.hidden = true;
    success.hidden = false;
    success.setAttribute('tabindex', '-1');
    success.focus({ preventScroll: true });
  });
}
