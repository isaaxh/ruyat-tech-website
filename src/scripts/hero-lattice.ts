// Hero hexagon lattice (startLattice in the design). A warm light drifts behind the grid (or follows the
// pointer for 3.2 s after it moves); only the hexagon edges are stroked, never filled. Random tiles flash.
// Animates only while the hero is visible. Under prefers-reduced-motion it draws one still frame.

interface Cell {
  x: number;
  y: number;
}
interface Flash {
  cell: Cell;
  t0: number;
}

function hex(p: Path2D, x: number, y: number, R: number): void {
  const h = R / 2;
  const w = R * 0.8660254;
  p.moveTo(x, y - R);
  p.lineTo(x + w, y - h);
  p.lineTo(x + w, y + h);
  p.lineTo(x, y + R);
  p.lineTo(x - w, y + h);
  p.lineTo(x - w, y - h);
  p.closePath();
}

export function initHeroLattice(): void {
  const c = document.querySelector<HTMLCanvasElement>('canvas.hero-lattice');
  const ctx = c?.getContext('2d');
  if (!c || !ctx) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0;
  let H = 0;
  let R = 60;
  let cells: Cell[] = [];
  let pool: Cell[] = [];
  let flashes: Flash[] = [];
  let nextFlash = 0;
  let eye: Cell | null = null;
  let L: Cell | null = null;
  let ptr: Cell | null = null;
  let ptrT = -1e9;
  let raf = 0;
  let visible = true;
  let base: Path2D | null = null;

  function draw(t: number): void {
    if (!eye || !W || !H) return;
    ctx!.clearRect(0, 0, W, H);
    const time = t / 1000;
    let tx: number;
    let ty: number;
    if (reduce) {
      tx = eye.x - R * 1.6;
      ty = eye.y - R * 0.5;
    } else if (ptr && t - ptrT < 3200) {
      tx = ptr.x;
      ty = ptr.y;
    } else {
      tx = eye.x + Math.cos(time * 0.19) * R * 6;
      ty = eye.y + Math.sin(time * 0.27) * R * 1.4;
    }
    if (!L) L = { x: tx, y: ty };
    const ease = reduce ? 1 : 0.045;
    L.x += (tx - L.x) * ease;
    L.y += (ty - L.y) * ease;
    const breath = reduce ? 0.85 : 0.6 + 0.4 * (0.5 - 0.5 * Math.cos((time * 2 * Math.PI) / 7));

    // Everything below is stroked, never filled: the tiles stay dark and untouched,
    // the light only shows through the hexagon edges.
    if (!base) {
      base = new Path2D();
      for (const cell of cells) hex(base, cell.x, cell.y, R);
    }
    ctx!.lineJoin = 'round';
    ctx!.lineWidth = 1;
    ctx!.strokeStyle = 'rgba(238,241,248,0.065)';
    ctx!.stroke(base);

    // Light source behind the grid: a radial gradient used as the stroke colour,
    // so each edge is lit by how close it is to the light, brightest nearest the source.
    const gl = ctx!.createRadialGradient(L.x, L.y, 0, L.x, L.y, R * 2.4);
    gl.addColorStop(0, `rgba(255,217,160,${(0.95 * breath).toFixed(3)})`);
    gl.addColorStop(0.3, `rgba(240,179,94,${(0.65 * breath).toFixed(3)})`);
    gl.addColorStop(0.65, `rgba(240,179,94,${(0.16 * breath).toFixed(3)})`);
    gl.addColorStop(1, 'rgba(240,179,94,0)');
    ctx!.strokeStyle = gl;
    ctx!.globalAlpha = 0.28;
    ctx!.lineWidth = 2.4;
    ctx!.stroke(base);
    ctx!.globalAlpha = 1;
    ctx!.lineWidth = 1.2;
    ctx!.stroke(base);

    // Flash: a random tile's edges light up gold and fade like a slow heartbeat (in 400ms, out 1.2s, at most 4)
    if (!reduce) {
      if (t >= nextFlash && flashes.length < 4 && pool.length) {
        flashes.push({ cell: pool[Math.floor(Math.random() * pool.length)], t0: t });
        nextFlash = t + 600 + Math.random() * 600;
      }
      flashes = flashes.filter((f) => t - f.t0 < 1600);
      for (const f of flashes) {
        const age = t - f.t0;
        const env = Math.max(0, age < 400 ? age / 400 : 1 - (age - 400) / 1200);
        const fp = new Path2D();
        hex(fp, f.cell.x, f.cell.y, R);
        ctx!.lineWidth = 1.2;
        ctx!.strokeStyle = `rgba(240,179,94,${(0.6 * env).toFixed(3)})`;
        ctx!.stroke(fp);
      }
    }
  }

  function layout(): void {
    const r = c!.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width;
    H = r.height;
    c!.width = Math.round(r.width * dpr);
    c!.height = Math.round(r.height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    const mobile = r.width < 640;
    R = mobile ? Math.max(28, r.width / 10) : Math.max(44, Math.min(80, r.width / 18));
    const w = Math.sqrt(3) * R;
    const vs = 1.5 * R;
    cells = [];
    pool = [];
    for (let row = -1; row * vs < r.height + R * 2; row++) {
      const off = row % 2 !== 0 ? w / 2 : 0;
      for (let col = -1; col * w < r.width + w; col++) {
        const cell = { x: col * w + off, y: row * vs };
        cells.push(cell);
        const nx = (cell.x - r.width / 2) / (r.width * 0.36);
        const ny = (cell.y - 110) / 300;
        if (nx * nx + ny * ny < 1) pool.push(cell);
      }
    }
    base = null;
    flashes = [];
    nextFlash = 0;
    eye = { x: r.width / 2, y: mobile ? 70 : 110 };
    L = null;
    draw(performance.now());
  }

  function loop(t: number): void {
    raf = 0;
    if (!visible || document.hidden) return;
    draw(t);
    raf = requestAnimationFrame(loop);
  }
  function kick(): void {
    if (!reduce && !raf && visible && !document.hidden) raf = requestAnimationFrame(loop);
  }

  window.addEventListener(
    'pointermove',
    (e) => {
      const r = c.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (y >= 0 && y <= r.height && x >= 0 && x <= r.width) {
        ptr = { x, y };
        ptrT = performance.now();
      }
    },
    { passive: true },
  );
  document.addEventListener('visibilitychange', kick);
  new ResizeObserver(layout).observe(c);
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    kick();
  }).observe(c);
  layout();
  kick();
}
