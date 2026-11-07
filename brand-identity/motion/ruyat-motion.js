(function(root){
/*!
 * Ruyat Tech — motion helpers (no dependencies)
 *   mountFacetLattice(host, options)  hexagon grid with three soft motions:
 *       flash  random tiles glow and fade
 *       beam   a soft comet travels slowly along connected hexagon edges
 *       pulse  a light source breathes behind the grid; light shows through the EDGES only and follows the source as it drifts
 *     modes can be combined: 'flash+beam', 'pulse+beam', 'both' (= flash+beam), 'all'
 *   initReveal(root)                  soft, staggered reveal on scroll for [data-reveal]
 * Brand rules: soft, easy, unhurried. Ambient motion stays behind content, pauses off-screen,
 * and becomes a still image when the visitor prefers reduced motion.
 */

const rand = (a, b) => a + Math.random() * (b - a);
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const reducedQuery = () => (typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false, addEventListener() {} });

function mountFacetLattice(host, opts = {}) {
  const o = Object.assign({
    mode: 'flash',                 // 'flash' | 'beam' | 'pulse' | 'both' | 'all' | 'a+b' | 'still'
    beamPreset: 'slow',            // 'slow' (default) | 'drift' (longer, fainter, two beams)
    radius: 40,                    // hexagon circumradius, CSS px
    gold: [240, 179, 94],          // Vision Gold
    lumen: [255, 217, 160],        // Lumen (beam head)
    line: [238, 241, 248],         // Frost (grid lines)
    lineAlpha: 0.07,
    flashPeak: 0.14,               // tile opacity at peak (0.12 – 0.18)
    flashIn: 400, flashOut: 1200,  // ms
    flashGap: [600, 1200],         // ms between flashes (random)
    maxFlashes: 4,
    beamSpeed: 60,                 // px / s  (slow, unhurried)
    beamLength: 320,               // px of fading trail
    beamLife: 12000,               // ms per pass
    beamAlpha: 0.6,
    beamCount: 1,
    pulseSources: 2,               // light sources behind the grid
    pulsePeriod: 7000,             // ms per breath
    pulseRadius: 0.30,             // of the longer side of the host
    pulseAlpha: 0.55,              // peak edge brightness
    pulseDrift: 0.00004,           // source drift speed (slow)
    avoid: null,                   // selector or element(s) whose area stays calm (headline, cards)
    avoidPad: 24,
  }, opts);
  if (o.beamPreset === 'drift') Object.assign(o, { beamSpeed: 40, beamLength: 460, beamAlpha: 0.38, beamCount: 2, beamLife: 16000 }, opts);

  const small = () => host.clientWidth < 640;
  const base = document.createElement('canvas');
  const fx = document.createElement('canvas');
  for (const c of [base, fx]) {
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    host.insertBefore(c, host.firstChild);
  }
  const bctx = base.getContext('2d');
  const ctx = fx.getContext('2d');

  let W = 0, H = 0, dpr = 1, cells = [], verts = new Map(), adj = new Map();
  let flashes = [], nextFlash = 0, beams = [], raf = 0, last = 0, visible = true, mode = o.mode, pulseT0 = 0;
  const rq = reducedQuery();

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = host.clientWidth; H = host.clientHeight;
    for (const c of [base, fx]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const r = o.radius, dx = Math.sqrt(3) * r, dy = 1.5 * r;
    cells = []; verts = new Map(); adj = new Map();
    const key = (x, y) => Math.round(x) + ',' + Math.round(y);
    for (let row = 0, y = -r; y < H + r * 2; row++, y += dy) {
      for (let x = row % 2 ? -dx / 2 : -dx; x < W + dx; x += dx) {
        cells.push({ x, y });
        const vs = [];
        for (let k = 0; k < 6; k++) {
          const a = (-90 + 60 * k) * Math.PI / 180, vx = x + r * Math.cos(a), vy = y + r * Math.sin(a), kk = key(vx, vy);
          if (!verts.has(kk)) { verts.set(kk, { x: vx, y: vy }); adj.set(kk, new Set()); }
          vs.push(kk);
        }
        for (let k = 0; k < 6; k++) { adj.get(vs[k]).add(vs[(k + 1) % 6]); adj.get(vs[(k + 1) % 6]).add(vs[k]); }
      }
    }
    drawGrid();
    if (!animated()) drawStill();
  }

  const hexPath = (c, x, y, r) => {
    c.beginPath();
    for (let k = 0; k < 6; k++) { const a = (-90 + 60 * k) * Math.PI / 180; c[k ? 'lineTo' : 'moveTo'](x + r * Math.cos(a), y + r * Math.sin(a)); }
    c.closePath();
  };
  function drawGrid() {
    bctx.clearRect(0, 0, W, H);
    bctx.strokeStyle = `rgba(${o.line},${o.lineAlpha})`; bctx.lineWidth = 1;
    for (const c of cells) { hexPath(bctx, c.x, c.y, o.radius); bctx.stroke(); }
  }
  function drawStill() {
    ctx.clearRect(0, 0, W, H);
    let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const n = Math.max(3, Math.round(cells.length / 90));
    if (has('pulse')) drawPulse(0, [], true);
    else for (let i = 0; i < n; i++) { const c = cells[Math.floor(rnd() * cells.length)]; paintTile(c, i === 0 ? 0.3 : o.flashPeak * 0.8); }
  }
  function paintTile(c, a) {
    hexPath(ctx, c.x, c.y, o.radius * 0.94);
    ctx.fillStyle = `rgba(${o.gold},${a})`; ctx.fill();
    ctx.strokeStyle = `rgba(${o.gold},${Math.min(a * 2.2, 0.6)})`; ctx.lineWidth = 1; ctx.stroke();
  }

  // areas that should stay calm (text blocks, cards)
  function avoidRects() {
    if (!o.avoid) return [];
    const els = typeof o.avoid === 'string' ? [...document.querySelectorAll(o.avoid)] : [].concat(o.avoid);
    const hb = host.getBoundingClientRect(), p = o.avoidPad;
    return els.map((e) => { const r = e.getBoundingClientRect(); return { l: r.left - hb.left - p, t: r.top - hb.top - p, r: r.right - hb.left + p, b: r.bottom - hb.top + p }; });
  }
  const inRects = (rs, x, y) => rs.some((q) => x > q.l && x < q.r && y > q.t && y < q.b);

  function spawnFlash(now) {
    const rs = avoidRects();
    for (let i = 0; i < 30; i++) {
      const c = cells[Math.floor(Math.random() * cells.length)];
      if (c.x < 0 || c.y < 0 || c.x > W || c.y > H || inRects(rs, c.x, c.y)) continue;
      if (flashes.some((f) => f.c === c)) continue;
      flashes.push({ c, t0: now, peak: Math.random() < 0.1 ? o.flashPeak * 2.2 : rand(o.flashPeak * 0.8, o.flashPeak) });
      return;
    }
  }
  function drawFlashes(now) {
    flashes = flashes.filter((f) => now - f.t0 < o.flashIn + o.flashOut);
    for (const f of flashes) {
      const age = now - f.t0;
      const e = age < o.flashIn ? easeOutCubic(age / o.flashIn) : 1 - easeInOut((age - o.flashIn) / o.flashOut);
      paintTile(f.c, f.peak * e);
    }
  }

  function newBeam(now) {
    const keys = [...verts.keys()].filter((k) => { const v = verts.get(k); return v.x > 0 && v.x < W && v.y > 0 && v.y < H; });
    const k0 = keys[Math.floor(Math.random() * keys.length)];
    const v = verts.get(k0);
    return { born: now, prev: null, from: k0, to: null, t: 0, pts: [{ x: v.x, y: v.y }], head: { x: v.x, y: v.y }, travelled: 0, wait: 0 };
  }
  function nextVertex(b) {
    const opts = [...adj.get(b.from)].filter((k) => k !== b.prev);
    const inside = opts.filter((k) => { const v = verts.get(k); return v.x > 0 && v.x < W && v.y > 0 && v.y < H; });
    const pool = inside.length ? inside : opts;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  function stepBeam(b, dt, now) {
    if (now - b.born > o.beamLife) { if (!b.dead) b.dead = now; if (now - b.dead > o.beamLength / o.beamSpeed * 1000 + 1500) Object.assign(b, newBeam(now), { dead: 0 }); return; }
    let move = o.beamSpeed * (small() ? 0.8 : 1) * dt / 1000;
    while (move > 0) {
      if (!b.to) b.to = nextVertex(b);
      const a = verts.get(b.from), z = verts.get(b.to), len = Math.hypot(z.x - a.x, z.y - a.y), left = len * (1 - b.t);
      if (move >= left) { move -= left; b.travelled += left; b.pts.push({ x: z.x, y: z.y }); b.prev = b.from; b.from = b.to; b.to = null; b.t = 0; b.head = { x: z.x, y: z.y }; }
      else { b.t += move / len; b.travelled += move; move = 0; b.head = { x: a.x + (z.x - a.x) * b.t, y: a.y + (z.y - a.y) * b.t }; }
    }
    if (b.pts.length > 60) b.pts.splice(0, b.pts.length - 60);
  }
  function drawBeam(b, now, rs) {
    const age = now - b.born;
    let env = Math.min(1, age / 800) * (b.dead ? Math.max(0, 1 - (now - b.dead) / 1200) : 1);
    if (env <= 0) return;
    // trail polyline, head → tail, limited to beamLength
    const line = [{ x: b.head.x, y: b.head.y }];
    let acc = 0;
    for (let i = b.pts.length - 1; i >= 0 && acc < o.beamLength; i--) {
      const p = b.pts[i], q = line[line.length - 1], d = Math.hypot(p.x - q.x, p.y - q.y);
      if (!d) continue; acc += d; line.push(p);
    }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    let run = 0;
    for (let i = 0; i < line.length - 1; i++) {
      const p = line[i], q = line[i + 1], d = Math.hypot(p.x - q.x, p.y - q.y);
      const f = 1 - Math.min(1, (run + d / 2) / o.beamLength); run += d;
      let a = o.beamAlpha * env * f * f;
      if (inRects(rs, (p.x + q.x) / 2, (p.y + q.y) / 2)) a *= 0.25;      // soften behind text
      ctx.strokeStyle = `rgba(${o.gold},${a * 0.18})`; ctx.lineWidth = 7;  // soft glow
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      ctx.strokeStyle = `rgba(${f > 0.8 ? o.lumen : o.gold},${a})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
    }
  }


  // pulsating edge light: sources drift behind the grid, edges (never tiles) catch the light
  let edgeList = null, srcs = [];
  function pulseInit() {
    edgeList = [];
    for (const [k, set] of adj) for (const k2 of set) if (k < k2) { const a = verts.get(k), b = verts.get(k2); edgeList.push({ a, b, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }); }
    srcs = Array.from({ length: o.pulseSources }, (_, i) => ({ px: rand(0, 6.28), py: rand(0, 6.28), fx: rand(0.7, 1.3), fy: rand(0.7, 1.3), ph: i * 2.4, k: i ? 0.6 : 1 }));
  }
  function drawPulse(t, rs, still) {
    if (!edgeList) pulseInit();
    const R = o.pulseRadius * Math.max(W, H);
    const live = srcs.map((s) => {
      const breath = still ? 1 : 0.55 + 0.45 * Math.sin((t / o.pulsePeriod) * 6.283 + s.ph);   // swell and fade
      const r = R * (0.85 + 0.25 * breath);
      return { x: W * (0.5 + 0.34 * Math.sin(s.px + t * o.pulseDrift * s.fx * 6.283 * 4)), y: H * (0.5 + 0.30 * Math.sin(s.py + t * o.pulseDrift * s.fy * 6.283 * 4)), r, i: s.k * breath };
    });
    ctx.lineCap = 'round';
    for (const e of edgeList) {
      let a = 0;
      for (const s of live) { const d = Math.hypot(e.mx - s.x, e.my - s.y) / s.r; if (d < 1.6) a += s.i * Math.exp(-d * d * 2.2); }
      a = Math.min(1, a) * o.pulseAlpha;
      if (rs.length && inRects(rs, e.mx, e.my)) a *= 0.35;
      if (a < 0.015) continue;
      ctx.strokeStyle = `rgba(${o.gold},${a * 0.22})`; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();
      ctx.strokeStyle = `rgba(${a > 0.35 ? o.lumen : o.gold},${a})`; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();
    }
  }
  const has = (m) => { const p = mode.split('+'); if (p.includes('all')) return true; if (p.includes('both') && (m === 'flash' || m === 'beam')) return true; return p.includes(m); };
  const animated = () => mode !== 'still' && !rq.matches;
  function frame(now) {
    raf = 0;
    if (!animated() || !visible || document.hidden) { last = 0; return; }
    const dt = last ? Math.min(now - last, 50) : 16; last = now;
    ctx.clearRect(0, 0, W, H);
    if (has('pulse')) { if (!pulseT0) pulseT0 = now; drawPulse(now - pulseT0, avoidRects(), false); }
    if (has('flash')) {
      if (now >= nextFlash && flashes.length < (small() ? Math.min(2, o.maxFlashes) : o.maxFlashes)) { spawnFlash(now); nextFlash = now + rand(...o.flashGap); }
      drawFlashes(now);
    }
    if (has('beam')) {
      while (beams.length < o.beamCount) beams.push(newBeam(now));
      const rs = avoidRects();
      for (const b of beams) { stepBeam(b, dt, now); drawBeam(b, now, rs); }
    }
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf && animated()) raf = requestAnimationFrame(frame); };
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; };

  const ro = new ResizeObserver(() => { build(); edgeList = null; beams = []; flashes = []; start(); });
  ro.observe(host);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); });
  io.observe(host);
  const onVis = () => (document.hidden ? stop() : start());
  const onRq = () => { stop(); build(); start(); };
  document.addEventListener('visibilitychange', onVis);
  rq.addEventListener && rq.addEventListener('change', onRq);

  build(); start();
  return {
    setMode(m) { mode = m; flashes = []; beams = []; pulseT0 = 0; ctx.clearRect(0, 0, W, H); if (m === 'still' || rq.matches) drawStill(); else start(); },
    destroy() { stop(); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', onVis); base.remove(); fx.remove(); },
  };
}

/* Soft staggered reveal. Add data-reveal to elements; include motion.css. */
function initReveal(root = document, { stagger = 70, max = 6 } = {}) {
  document.documentElement.classList.add('rt-js');
  const els = [...root.querySelectorAll('[data-reveal]')];
  const groups = new Map();
  for (const el of els) { const g = groups.get(el.parentElement) || []; el.style.setProperty('--i', Math.min(g.length, max)); g.push(el); groups.set(el.parentElement, g); }
  if (reducedQuery().matches || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.15 });
  els.forEach((e) => io.observe(e));
}

var api={mountFacetLattice:mountFacetLattice,initReveal:initReveal};
if(typeof module!=="undefined"&&module.exports)module.exports=api;root.RuyatMotion=api;
})(typeof window!=="undefined"?window:this);
