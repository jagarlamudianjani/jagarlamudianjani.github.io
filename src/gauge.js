// A dial-indicator gauge drawn in SVG: knurled bezel, ticks, a needle and the
// stem underneath. Halftone shading comes from a dot pattern so it sits in the
// same printed look as the paper section.

const NS = "http://www.w3.org/2000/svg";
const SWEEP = 260; // degrees from the lowest to the highest reading
const R = 230;

const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  parent?.appendChild(n);
  return n;
};

export function buildGauge(svg) {
  const defs = el("defs", {}, svg);
  const dots = el("pattern", { id: "dots", width: 7, height: 7, patternUnits: "userSpaceOnUse", patternTransform: "rotate(30)" }, defs);
  el("circle", { cx: 3.5, cy: 3.5, r: 1.7, fill: "#111" }, dots);
  const fine = el("pattern", { id: "dotsFine", width: 5, height: 5, patternUnits: "userSpaceOnUse", patternTransform: "rotate(30)" }, defs);
  el("circle", { cx: 2.5, cy: 2.5, r: 0.9, fill: "#111" }, fine);
  const fade = el("radialGradient", { id: "shade", cx: "35%", cy: "30%", r: "80%" }, defs);
  el("stop", { offset: "55%", "stop-color": "#fff", "stop-opacity": 0 }, fade);
  el("stop", { offset: "100%", "stop-color": "#fff", "stop-opacity": 1 }, fade);
  const mask = el("mask", { id: "shadeMask" }, defs);
  el("circle", { r: R + 36, fill: "url(#shade)" }, mask);

  // cast shadow and the stem with its plunger
  el("ellipse", { cx: 120, cy: 420, rx: 240, ry: 34, fill: "url(#dots)", opacity: 0.55 }, svg);
  el("rect", { x: -46, y: R + 10, width: 92, height: 120, rx: 8, fill: "#151515" }, svg);
  el("rect", { x: -34, y: R + 18, width: 18, height: 104, fill: "#f3f2ee", opacity: 0.25 }, svg);
  el("rect", { x: -18, y: R + 128, width: 36, height: 54, fill: "#151515" }, svg);
  el("circle", { cx: 0, cy: R + 190, r: 14, fill: "#151515" }, svg);

  // bezel: dark ring, knurling, inner lip
  el("circle", { r: R + 36, fill: "#121212" }, svg);
  const knurl = el("g", { stroke: "#efeeea", "stroke-width": 1.4, opacity: 0.55 }, svg);
  for (let i = 0; i < 180; i++) {
    const a = (i / 180) * Math.PI * 2;
    el("line", { x1: Math.cos(a) * (R + 26), y1: Math.sin(a) * (R + 26), x2: Math.cos(a) * (R + 34), y2: Math.sin(a) * (R + 34) }, knurl);
  }
  el("circle", { r: R + 14, fill: "#f6f5f1", stroke: "#111", "stroke-width": 6 }, svg);
  // printed shading along the lower rim of the face
  el("path", { d: `M ${-(R + 6)} 0 A ${R + 6} ${R + 6} 0 0 0 ${R + 6} 0 A ${R + 6} ${R - 40} 0 0 1 ${-(R + 6)} 0 Z`, fill: "url(#dotsFine)", opacity: 0.22 }, svg);

  // ticks: 60 minor, every fifth long
  const ticks = el("g", { stroke: "#111", "stroke-linecap": "butt" }, svg);
  for (let i = 0; i <= 60; i++) {
    const a = ((-SWEEP / 2 + (i / 60) * SWEEP - 90) * Math.PI) / 180;
    const long = i % 5 === 0;
    const r1 = R - (long ? 46 : 22), r2 = R - 4;
    el("line", { x1: Math.cos(a) * r1, y1: Math.sin(a) * r1, x2: Math.cos(a) * r2, y2: Math.sin(a) * r2, "stroke-width": long ? 7 : 2.4 }, ticks);
  }

  // needle and hub; the group rotates around the centre
  const needle = el("g", { class: "needle" }, svg);
  el("path", { d: "M -7 30 L 0 -205 L 7 30 Z", fill: "#111" }, needle);
  el("path", { d: "M -10 30 L 0 70 L 10 30 Z", fill: "#111" }, needle);
  el("circle", { r: 26, fill: "#111" }, svg);
  el("circle", { r: 12, fill: "#f6f5f1", stroke: "#111", "stroke-width": 3 }, svg);
  el("circle", { r: 4, fill: "#111" }, svg);

  let at = 0;
  return {
    // v is 0–1 along the sweep
    set(v) { at = v; needle.setAttribute("transform", `rotate(${-SWEEP / 2 + v * SWEEP})`); },
    get value() { return at; },
  };
}
