// The hero portrait: her photo redrawn as monospace glyphs. Each cell carries a
// glyph index from an atlas ordered sparse → dense ink, so the index doubles as
// its tone. Brighter cells get denser glyphs. The darkest cells stay empty, so
// eyes, brows and hair read as negative space. Cells decode in from a scatter,
// a few keep flickering at rest, the pointer pushes them aside, and the head
// turns a little with the pointer over a dome, like a solid.

const GLYPHS = ".:-~=+*<>[]{}#%@";
const CELL = 0.6; // monospace cells are taller than wide
const PAPER = [241, 241, 239];
const RED = [255, 50, 71];
const LEVELS = 14;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const mix = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// sample the photo into cells: [x, y, tone 0–1, r, g, b] for every opaque cell
function sample(img, rows) {
  const cols = Math.round((rows * img.width) / img.height / CELL);
  const c = document.createElement("canvas");
  c.width = cols;
  c.height = rows;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.imageSmoothingQuality = "high";
  g.drawImage(img, 0, 0, cols, rows);
  const d = g.getImageData(0, 0, cols, rows).data;
  const L = new Float32Array(cols * rows).fill(-1);
  for (let i = 0; i < cols * rows; i++) {
    const r = d[i * 4] / 255,
      gr = d[i * 4 + 1] / 255,
      b = d[i * 4 + 2] / 255;
    if (d[i * 4 + 3] > 200 && Math.min(r, gr, b) < 0.86)
      L[i] = 0.2126 * r + 0.7152 * gr + 0.0722 * b;
  }
  const at = (x, y) =>
    x < 0 || y < 0 || x >= cols || y >= rows ? -1 : L[y * cols + x];
  const cells = [];
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const v = at(x, y);
      // erode one cell so the cut-out's fringe doesn't draw a halo
      if (v < 0 || at(x - 1, y) < 0 || at(x + 1, y) < 0 || at(x, y - 1) < 0)
        continue;
      let sum = 0,
        k = 0,
        sum5 = 0,
        sq5 = 0,
        k5 = 0;
      for (let j = -2; j <= 2; j++)
        for (let i = -2; i <= 2; i++) {
          const w = at(x + i, y + j);
          if (w < 0) continue;
          sum5 += w;
          sq5 += w * w;
          k5++;
          if (Math.abs(i) <= 1 && Math.abs(j) <= 1) {
            sum += w;
            k++;
          }
        }
      const i4 = (y * cols + x) * 4;
      // local variance marks printed fabric; skin is smooth
      const tex = clamp((sq5 / k5 - (sum5 / k5) ** 2) / 0.012, 0, 1);
      // sharpen against the neighbourhood so eyes and brows read
      cells.push([
        x,
        y,
        v + (v - sum / k) * 1.4,
        d[i4] / 255,
        d[i4 + 1] / 255,
        d[i4 + 2] / 255,
        tex,
      ]);
    }
  // equalise: a cell's tone is its rank among the smooth cells (skin, hair), so the
  // face uses the full glyph range; patterned fabric keeps its own, dimmer tone
  const smooth = cells.map((_, i) => i);
  smooth.sort((a, b) => cells[a][2] - cells[b][2]);
  const ranked = new Float32Array(cells.length).fill(-1);
  smooth.forEach((ci, r) => {
    ranked[ci] = r / Math.max(1, smooth.length - 1);
  });
  // blend the rank with the stretched luminance so gradients across the cheeks stay smooth
  const lo = smooth.length ? cells[smooth[0]][2] : 0,
    hi = smooth.length ? cells[smooth[smooth.length - 1]][2] : 1;
  cells.forEach((c, i) => {
    const lin = clamp((c[2] - lo) / Math.max(0.001, hi - lo), 0, 1);
    c[2] =
      ranked[i] >= 0
        ? ranked[i]
        : clamp(c[2] * 0.85, 0, 0.8);
  });
  return { cells, cols, rows };
}

// one atlas strip per colour level: 16 glyphs in a row
function atlases(px, dpr) {
  const out = [];
  const size = Math.ceil(px * dpr);
  for (let hue = 0; hue < 2; hue++)
    for (let l = 0; l < LEVELS; l++) {
      const c = document.createElement("canvas");
      c.width = size * 16;
      c.height = size;
      const g = c.getContext("2d");
      g.font = `600 ${size * 0.92}px "JetBrains Mono", ui-monospace, monospace`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      const k = 0.3 + (l / (LEVELS - 1)) * 0.95;
      const base = hue ? mix(PAPER, RED, 0.55) : PAPER;
      g.fillStyle = `rgb(${base.map((v) => Math.round(clamp(v * k, 0, 255))).join(" ")})`;
      [...GLYPHS].forEach((ch, i) =>
        g.fillText(ch, i * size + size / 2, size / 2 + size * 0.04),
      );
      out.push(c);
    }
  return { out, size };
}

// mount on a canvas that covers the hero; the portrait sits in `frame` (fractions of the canvas)
export function mountGlyphPortrait(canvas, img, opts = {}) {
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0,
    H = 0,
    dpr = 1,
    px = 6,
    cells = [],
    cols = 1,
    rows = 1,
    atlas = null,
    grid = [];
  let frame = opts.frame; // { cx, bottom, height } as fractions
  const pointer = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, px: 0, py: 0 };
  let t0 = performance.now(),
    tick = 0,
    raf = 0,
    visible = true;

  function layout() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    frame = typeof opts.frame === "function" ? opts.frame(W, H) : opts.frame;
    const rowsWanted = frame.rows || 104;
    ({ cells, cols, rows } = sample(img, rowsWanted));
    px = (frame.height * H) / rows; // row pitch in css px
    atlas = atlases(px * 1.16, dpr);
    const cw = px * CELL,
      pw = cols * cw;
    const left = frame.cx * W - pw / 2,
      top = frame.bottom * H - rows * px;
    for (const c of cells) {
      const [x, y, t, r, g, b, tex] = c;
      const nx = (x + 0.5 - cols / 2) / Math.max(rows, cols * CELL),
        ny = -(y + 0.5 - rows / 2) / Math.max(rows, cols * CELL);
      const tone = Math.pow(t, 1.35);
      // shoulders fade towards the bottom and the sides; patterned fabric sits back so the face leads
      const fade =
        clamp((rows - y) / (rows * 0.3), 0, 1) *
        clamp(1.7 - Math.abs(nx) * 2.6, 0, 1) *
        (1 - tex * 0);
      const bright = (0.55 + tone * 0.75) * fade;
      const level = Math.round((clamp(bright, 0, 1.25) / 1.25) * (LEVELS - 1));
      // a few red cells in the brightest fabric highlights; never on the face
      const hue = tone > 0.9 && y > rows * 0.5 && Math.random() < 0.35 ? 1 : 0;
      const dome =
        Math.sqrt(Math.max(0, 0.2 - nx * nx - ny * ny * 0.6)) * 0.5 +
        (tone - 0.5) * 0.04;
      c.glyph =
        fade < 0.05 || tone < 0.07 ? -1 : Math.min(15, Math.round(tone * 15));
      c.level = level;
      c.hue = hue;
      c.dome = dome;
      c.ox = left + (x + 0.5) * cw;
      c.oy = top + (y + 0.5) * px;
      c.delay = Math.random() * 0.45;
      c.seed = Math.random();
      const a = Math.random() * Math.PI * 2,
        rr = 40 + Math.random() * 120;
      c.sx = Math.cos(a) * rr;
      c.sy = Math.sin(a) * rr;
    }
    // the dot grid behind, faint and even
    grid = [];
    const step = px * 3.2;
    for (let gy = top - step * 2; gy < H; gy += step)
      for (let gx = 0; gx < W; gx += step) grid.push([gx, gy]);
  }

  function draw(now) {
    const T = (now - t0) / 1000;
    const prog = reduce ? 1 : clamp((T - (opts.delay || 0)) / 1.6, 0, 1);
    pointer.x += (pointer.tx - pointer.x) * 0.12;
    pointer.y += (pointer.ty - pointer.y) * 0.12;
    const R = 110,
      turn = pointer.px * 34;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // dot grid
    ctx.fillStyle = "rgb(241 241 239 / .13)";
    for (const [gx, gy] of grid) {
      ctx.fillRect(gx, gy, 1.4, 1.4);
    }
    const sz = atlas.size / dpr,
      half = sz / 2;
    tick = Math.floor(T * 16);
    for (const c of cells) {
      if (c.glyph < 0) continue;
      const k = clamp((prog - c.delay) / 0.55, 0, 1),
        e = 1 - Math.pow(1 - k, 3);
      const flight = Math.sin(k * Math.PI);
      let x = c.ox + c.sx * (1 - e) + c.dome * turn,
        y = c.oy + c.sy * (1 - e) - c.dome * pointer.py * 10;
      // pointer push
      const dx = x - pointer.x,
        dy = y - pointer.y,
        dist = Math.hypot(dx, dy);
      let f = 0;
      if (dist < R) {
        f = 1 - dist / R;
        f *= f;
        x += (dx / (dist + 0.001)) * f * R * 0.5;
        y += (dy / (dist + 0.001)) * f * R * 0.5;
      }
      let gi = c.glyph;
      if (k > 0 && k < 0.999)
        gi = Math.floor(hash(c.seed * 97 + tick) * 16); // decoding
      else if (!reduce && hash(c.seed * 131 + Math.floor(T * 2.5)) > 0.993)
        gi = Math.floor(hash(c.seed * 57 + tick) * 16); // rest flicker
      gi = Math.min(15, gi + Math.floor(f * 6));
      const lvl = Math.min(LEVELS - 1, c.level + Math.round(f * 4));
      const a = atlas.out[c.hue * LEVELS + lvl];
      ctx.globalAlpha =
        (0.8 + 0.2 * c.seed) * (k > 0 ? 1 : 0) * (1 - flight * 0.3);
      ctx.drawImage(
        a,
        gi * atlas.size,
        0,
        atlas.size,
        atlas.size,
        x - half,
        y - half,
        sz,
        sz,
      );
    }
    ctx.globalAlpha = 1;
  }
  const hash = (n) => {
    const s = Math.sin(n) * 43758.5453;
    return s - Math.floor(s);
  };

  function loop(now) {
    raf = 0;
    if (!visible) return;
    draw(now);
    raf = requestAnimationFrame(loop);
  }
  const start = () => {
    if (!raf && visible) raf = requestAnimationFrame(loop);
  };

  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.tx = e.clientX - r.left;
    pointer.ty = e.clientY - r.top;
    pointer.px = (e.clientX / innerWidth - 0.5) * 2;
    pointer.py = (e.clientY / innerHeight - 0.5) * 2;
  };
  const onLeave = () => {
    pointer.tx = pointer.ty = -1e4;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeave);
  new IntersectionObserver(
    ([en]) => {
      visible = en.isIntersecting;
      start();
    },
    { threshold: 0 },
  ).observe(canvas);
  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      layout();
    }, 120);
  });

  layout();
  start();
  return {
    relayout: layout,
    replay() {
      t0 = performance.now();
      start();
    },
  };
}
