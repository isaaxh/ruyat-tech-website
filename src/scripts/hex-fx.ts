// Hexagon lattice motion for the section backgrounds (rtHexFx in the design).
// Same grid as facet-tile.svg (R 28, pointy-top), drawn on a canvas that shares the section's fade mask.
// Beam: a soft comet that travels only along connected edges and turns at corners.
// Flash: a tile lights up gold and fades like a slow heartbeat.
// Pointer glow: the hexagon edges near the pointer light up softly and fade shortly after it stops (same idea
// as the hero lattice, kept much subtler).
// Each canvas only animates while it is on screen; nothing runs under prefers-reduced-motion.

interface Vert {
  x: number;
  y: number;
}
interface Center extends Vert {
  d: number;
}
interface Beam {
  from: number;
  to: number;
  prev: number;
  prog: number;
  hist: number[];
  age: number;
  out: number;
}
interface Flash {
  c: Center;
  t0: number;
}
interface Item {
  el: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  mode: string;
  fx: number;
  fy: number;
  rx: number;
  ry: number;
  mt: number;
  mb: number;
  visible: boolean;
  W: number;
  H: number;
  verts?: Vert[];
  adj: number[][];
  centers: Center[];
  starts: number[];
  beams: (Beam | null)[];
  flashes: Flash[];
  next: number;
  edges?: Path2D;
  px: number;
  py: number;
  lx: number;
  ly: number;
  ptrT: number;
}

const R = 28;
const TW = 48.497;
const HW = 24.2485;

function dist(it: Item, x: number, y: number): number {
  const dx = (x - it.fx * it.W) / (it.rx * it.W);
  const dy = (y - it.fy * it.H) / (it.ry * it.H);
  return Math.sqrt(dx * dx + dy * dy);
}
function inBox(it: Item, p: Vert): boolean {
  return p.x > 12 && p.x < it.W - 12 && p.y > it.mt && p.y < it.H - it.mb;
}
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

function build(it: Item): void {
  const r = it.el.getBoundingClientRect();
  if (!r.width || !r.height) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  it.W = r.width;
  it.H = r.height;
  it.el.width = Math.round(r.width * dpr);
  it.el.height = Math.round(r.height * dpr);
  it.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const verts: Vert[] = [];
  const adj: number[][] = [];
  const keys: Record<string, number> = {};
  const centers: Center[] = [];
  const vid = (x: number, y: number): number => {
    const k = `${Math.round(x * 10)},${Math.round(y * 10)}`;
    if (keys[k] === undefined) {
      keys[k] = verts.length;
      verts.push({ x, y });
      adj.push([]);
    }
    return keys[k];
  };
  const link = (a: number, b: number): void => {
    if (adj[a].indexOf(b) < 0) {
      adj[a].push(b);
      adj[b].push(a);
    }
  };
  for (let j = -1; j * 84 <= it.H + 84; j++)
    for (let i = -1; i * TW <= it.W + TW; i++) {
      const cs = [
        [i * TW, j * 84],
        [i * TW + HW, j * 84 + 42],
      ];
      for (const [cx, cy] of cs) {
        const d = dist(it, cx, cy);
        if (d > 0.95) continue;
        centers.push({ x: cx, y: cy, d });
        const p = [
          [cx, cy - R],
          [cx + HW, cy - 14],
          [cx + HW, cy + 14],
          [cx, cy + R],
          [cx - HW, cy + 14],
          [cx - HW, cy - 14],
        ];
        const ids = p.map(([x, y]) => vid(x, y));
        for (let m = 0; m < 6; m++) link(ids[m], ids[(m + 1) % 6]);
      }
    }
  it.verts = verts;
  it.adj = adj;
  it.centers = centers.filter(
    (q) => q.d < 0.6 && q.x > HW && q.x < it.W - HW && q.y > it.mt + R && q.y < it.H - it.mb - R,
  );
  it.starts = [];
  for (let v = 0; v < verts.length; v++)
    if (inBox(it, verts[v]) && dist(it, verts[v].x, verts[v].y) < 0.45) it.starts.push(v);
  it.beams = [];
  it.flashes = [];
  it.next = 0;
  it.edges = new Path2D();
  for (let a = 0; a < verts.length; a++)
    for (const b of adj[a])
      if (b > a) {
        it.edges.moveTo(verts[a].x, verts[a].y);
        it.edges.lineTo(verts[b].x, verts[b].y);
      }
}

const GLOW_R = 72;
const GLOW_HOLD = 900;
const GLOW_FADE = 900;

/** Soft light on the hexagon edges around the pointer. Fades out after the pointer stops or leaves. */
function drawGlow(it: Item, now: number): void {
  if (!it.edges) return;
  const k = Math.max(0, Math.min(1, 1 - (now - it.ptrT - GLOW_HOLD) / GLOW_FADE));
  if (k <= 0) return;
  it.lx += (it.px - it.lx) * 0.18;
  it.ly += (it.py - it.ly) * 0.18;
  const ctx = it.ctx;
  const g = ctx.createRadialGradient(it.lx, it.ly, 0, it.lx, it.ly, GLOW_R);
  g.addColorStop(0, `rgba(255,217,160,${(0.5 * k).toFixed(3)})`);
  g.addColorStop(0.35, `rgba(240,179,94,${(0.3 * k).toFixed(3)})`);
  g.addColorStop(0.7, `rgba(240,179,94,${(0.08 * k).toFixed(3)})`);
  g.addColorStop(1, 'rgba(240,179,94,0)');
  ctx.strokeStyle = g;
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 2.4;
  ctx.stroke(it.edges);
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1.2;
  ctx.stroke(it.edges);
}

function spawnBeam(it: Item, delay: number): Beam | null {
  if (!it.starts.length) return null;
  const v = pick(it.starts);
  return { from: v, to: pick(it.adj[v]), prev: -1, prog: 0, hist: [v], age: -delay, out: 0 };
}

function stepBeam(it: Item, b: Beam, dt: number, speed: number): void {
  b.age += dt;
  if (b.age < 0) return;
  b.prog += speed * dt;
  const V = it.verts!;
  for (;;) {
    const a = V[b.from];
    const c = V[b.to];
    const len = Math.hypot(c.x - a.x, c.y - a.y);
    if (b.prog < len) break;
    b.prog -= len;
    b.prev = b.from;
    b.from = b.to;
    b.hist.push(b.from);
    if (b.hist.length > 24) b.hist.shift();
    const opts = it.adj[b.from].filter((q) => q !== b.prev);
    const inside = opts.filter((q) => inBox(it, V[q]) && dist(it, V[q].x, V[q].y) < 0.7);
    b.to = pick(inside.length ? inside : opts);
    if (dist(it, V[b.from].x, V[b.from].y) > 0.75) b.out = b.out || 0.0001;
  }
}

function drawBeam(it: Item, b: Beam, tail: number, peak: number): void {
  if (b.age < 0) return;
  const V = it.verts!;
  const a = V[b.from];
  const c = V[b.to];
  const len = Math.hypot(c.x - a.x, c.y - a.y) || 1;
  const t = b.prog / len;
  const hx = a.x + (c.x - a.x) * t;
  const hy = a.y + (c.y - a.y) * t;
  const life = Math.min(1, b.age / 0.8) * (b.out ? Math.max(0, 1 - b.out / 0.8) : 1);
  const ctx = it.ctx;
  let px = hx;
  let py = hy;
  let acc = 0;
  ctx.lineCap = 'round';
  ctx.lineWidth = 1.4;
  for (let i = b.hist.length - 1; i >= 0 && acc < tail; i--) {
    const q = V[b.hist[i]];
    const seg = Math.hypot(px - q.x, py - q.y);
    const steps = Math.max(1, Math.ceil(seg / 6));
    for (let s = 0; s < steps && acc < tail; s++) {
      const x1 = px + (q.x - px) * (s / steps);
      const y1 = py + (q.y - py) * (s / steps);
      const x2 = px + (q.x - px) * ((s + 1) / steps);
      const y2 = py + (q.y - py) * ((s + 1) / steps);
      const f = 1 - acc / tail;
      const al = peak * life * f * f;
      ctx.strokeStyle = `rgba(${f > 0.85 ? '255,217,160' : '240,179,94'},${al.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      acc += seg / steps;
    }
    px = q.x;
    py = q.y;
  }
  const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 7);
  g.addColorStop(0, `rgba(255,217,160,${(0.85 * life).toFixed(3)})`);
  g.addColorStop(1, 'rgba(240,179,94,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(hx, hy, 7, 0, Math.PI * 2);
  ctx.fill();
}

function hexPath(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.beginPath();
  ctx.moveTo(x, y - R);
  ctx.lineTo(x + HW, y - 14);
  ctx.lineTo(x + HW, y + 14);
  ctx.lineTo(x, y + R);
  ctx.lineTo(x - HW, y + 14);
  ctx.lineTo(x - HW, y - 14);
  ctx.closePath();
}

export function initHexFx(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const items: Item[] = [];
  let raf = 0;
  let last = 0;

  function frame(now: number): void {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    let any = false;
    for (const it of items) {
      if (!it.visible || document.hidden || !it.verts) continue;
      any = true;
      const ctx = it.ctx;
      ctx.clearRect(0, 0, it.W, it.H);
      if (it.mode === 'beam') {
        if (!it.beams.length) {
          it.beams.push(spawnBeam(it, 0));
          it.beams.push(spawnBeam(it, 2.5));
        }
        for (let k = 0; k < it.beams.length; k++) {
          const b = it.beams[k];
          if (!b) continue;
          stepBeam(it, b, dt, k ? 42 : 58);
          if (b.out) {
            b.out += dt;
            if (b.out > 0.8) {
              it.beams[k] = spawnBeam(it, 0.6);
              continue;
            }
          }
          drawBeam(it, b, k ? 420 : 300, k ? 0.5 : 0.85);
        }
      } else {
        const t = now;
        if (t >= it.next && it.flashes.length < 4 && it.centers.length) {
          it.flashes.push({ c: pick(it.centers), t0: t });
          it.next = t + 600 + Math.random() * 600;
        }
        it.flashes = it.flashes.filter((f) => t - f.t0 < 1600);
        for (const f of it.flashes) {
          const age = t - f.t0;
          const env = Math.max(0, age < 400 ? age / 400 : 1 - (age - 400) / 1200);
          hexPath(ctx, f.c.x, f.c.y);
          ctx.fillStyle = `rgba(240,179,94,${(0.14 * env).toFixed(3)})`;
          ctx.fill();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = `rgba(240,179,94,${(0.55 * env).toFixed(3)})`;
          ctx.stroke();
        }
      }
      drawGlow(it, now);
    }
    if (any) raf = requestAnimationFrame(frame);
    else last = 0;
  }
  const kick = (): void => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  document.addEventListener('visibilitychange', () => {
    last = 0;
    kick();
  });

  window.addEventListener(
    'pointermove',
    (e) => {
      const now = performance.now();
      for (const it of items) {
        if (!it.visible) continue;
        const r = it.el.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        if (x < 0 || y < 0 || x > r.width || y > r.height) continue;
        // Jump straight to the pointer when the glow is not showing, so it does not slide in from far away.
        if (now - it.ptrT > GLOW_HOLD + GLOW_FADE) {
          it.lx = x;
          it.ly = y;
        }
        it.px = x;
        it.py = y;
        it.ptrT = now;
      }
    },
    { passive: true },
  );

  document.querySelectorAll<HTMLCanvasElement>('canvas.hexfx').forEach((el) => {
    const ctx = el.getContext('2d');
    if (!ctx) return;
    const [fx, fy, rx, ry] = (el.dataset.focus || '1,0,0.5,0.6').split(',').map(Number);
    const fade = el.dataset.fade || 'both';
    const it: Item = {
      el,
      ctx,
      mode: el.dataset.mode || 'beam',
      fx,
      fy,
      rx,
      ry,
      mt: fade === 'none' ? 12 : 150,
      mb: fade === 'both' ? 150 : 12,
      visible: false,
      W: 0,
      H: 0,
      adj: [],
      centers: [],
      starts: [],
      beams: [],
      flashes: [],
      next: 0,
      px: 0,
      py: 0,
      lx: 0,
      ly: 0,
      ptrT: -1e9,
    };
    items.push(it);
    build(it);
    new ResizeObserver(() => build(it)).observe(el);
    new IntersectionObserver((e) => {
      it.visible = e[0].isIntersecting;
      kick();
    }).observe(el);
  });
}
