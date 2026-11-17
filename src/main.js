import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  TOOLS,
  CAPABILITIES,
  WORK,
  METRICS,
  EXPERIENCE,
  EDUCATION,
  EXTRAS,
  CONTACT,
} from "./data.js";
import { drawArt } from "./cards.js";
import { buildGauge } from "./gauge.js";
import { mountGlyphPortrait, loadImage } from "./glyphs.js";

gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  s.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
const bold = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
const pad = (i) => String(i + 1).padStart(2, "0");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// text resolves out of random glyphs, the same set the portrait is drawn with
const GLYPHS = ".:-~=+*<>[]{}#%@";
function decode(el, dur = 900) {
  if (!el || reduce || el.dataset.decoding) return;
  const text = el.dataset.text ?? (el.dataset.text = el.textContent);
  el.dataset.decoding = "1";
  const n = text.length,
    t0 = performance.now();
  const frame = (now) => {
    const p = Math.min(1, (now - t0) / dur),
      k = Math.floor(p * n);
    let s = text.slice(0, k);
    for (let i = k; i < n; i++)
      s += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    el.textContent = s;
    if (p < 1) requestAnimationFrame(frame);
    else delete el.dataset.decoding;
  };
  requestAnimationFrame(frame);
}
// an element leans towards the pointer and springs back
function magnet(el, k = 0.35) {
  if (!el || reduce) return;
  const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" }),
    y = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    x((e.clientX - r.left - r.width / 2) * k);
    y((e.clientY - r.top - r.height / 2) * k);
  });
  el.addEventListener("pointerleave", () => {
    x(0);
    y(0);
  });
}
const narrow = () => innerWidth < 900;

// ---------------------------------------------------------------- content
$(".marquee-track").innerHTML = [...TOOLS, ...TOOLS]
  .map((t) => `<span>${esc(t)}</span>`)
  .join("");

$(".caps").innerHTML = CAPABILITIES.map(
  (c, i) => `
  <li class="cap"><p class="cap-head"><i></i><span class="mono">${pad(i)}</span><b>${esc(c.name.toUpperCase())}</b></p>
  <p class="cap-text">${esc(c.text)}</p><p class="cap-tags mono">${c.tags.map(esc).join(" · ")}</p></li>`,
).join("");

$(".track").innerHTML =
  WORK.map(
    (w, i) => `
  <li class="card" data-id="${w.id}">
    <button class="card-btn" type="button" aria-label="Open ${esc(w.title)}">
      <div class="card-art">${drawArt(w.art)}</div>
      <div class="card-foot"><span class="mono red">${pad(i)}</span><div><b>${esc(w.title)}</b><span class="mono">${esc(w.kind)}</span></div><i class="card-go" aria-hidden="true">→</i></div>
    </button>
  </li>`,
  ).join("") +
  `
  <li class="card light">
    <a class="card-btn" href="#about">
      <div class="light-head"><b>EXPERIENCE</b><span class="mono">0${EXPERIENCE.length}</span></div>
      <ol class="light-roles mono">${EXPERIENCE.map((e) => `<li><span>${esc(e.org)}</span><em>${esc(e.when)}</em></li>`).join("")}</ol>
      <div class="card-foot"><span>4+ years in QA · three roles</span><i class="card-go solid" aria-hidden="true">→</i></div>
    </a>
  </li>`;

$(".sheet-table tbody").innerHTML = METRICS.map(
  (m, i) => `
  <tr data-i="${i}"><th>${esc(m.name)}</th><td class="mono">${esc(m.label)}</td><td class="mono num">${esc(display(m, 1))}</td></tr>`,
).join("");

$("#experience").innerHTML = EXPERIENCE.map(
  (e) =>
    `<li><b>${esc(e.org)}</b><span>${esc(e.role)}</span><em class="mono">${esc(e.when)}</em></li>`,
).join("");
$(".cv-side").innerHTML =
  (EDUCATION.length
    ? `<p class="eyebrow mono">Education</p><ul class="cv-list">${EDUCATION.map((e) => `<li><b>${esc(e.school)}</b><span>${esc(e.degree)}</span><em class="mono">${esc(e.when)}</em></li>`).join("")}</ul>`
    : "") +
  EXTRAS.map(
    (x) =>
      `<p class="eyebrow mono">${esc(x.label)}</p><ul class="cv-list"><li><b>${esc(x.title)}</b>${x.text ? `<span>${esc(x.text)}</span>` : ""}</li></ul>`,
  ).join("");

const mail = $("#mailBtn");
mail.href = `mailto:${CONTACT.email}`;
$("span", mail).textContent = CONTACT.email;
$(".nav-mail").href = `mailto:${CONTACT.email}`;
$(".contact-links").innerHTML = CONTACT.links
  .map(
    (l) =>
      `<li><a href="${l.href}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`,
  )
  .join("");

// number shown for a metric at progress t (0–1)
function display(m, t) {
  if (m.show) return m.show;
  const v = Math.round(m.from + (m.to - m.from) * t);
  return `${m.prefix || ""}${v}${m.suffix || ""}`;
}

// ---------------------------------------------------------------- detail dialog
const dialog = $("#detail");
$(".track").addEventListener("click", (e) => {
  const card = e.target.closest(".card[data-id]");
  if (!card) return;
  const w = WORK.find((x) => x.id === card.dataset.id);
  $(".detail-meta", dialog).textContent = `${w.org} · ${w.when}`;
  $(".detail-title", dialog).textContent = w.title;
  $(".detail-kind", dialog).textContent = w.kind;
  $(".detail-points", dialog).innerHTML = w.points
    .map((p) => `<li>${bold(p)}</li>`)
    .join("");
  dialog.showModal();
  lenis?.stop();
});
dialog.addEventListener("close", () => lenis?.start());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});

// ---------------------------------------------------------------- rail
const sections = $$("[data-rail]");
$(".rail-list").innerHTML = sections
  .map(
    (s, i) =>
      `<li><i></i><b>${pad(i)}</b><span>${esc(s.dataset.rail)}</span></li>`,
  )
  .join("");
const railItems = $$(".rail-list li");
// each stop sits at its section's share of the page
function placeStops() {
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  sections.forEach((s, i) =>
    railItems[i].style.setProperty("--at", Math.min(0.985, s.offsetTop / max).toFixed(4)),
  );
}

// ---------------------------------------------------------------- gauge
const gauge = buildGauge($(".gauge"));
gauge.set(METRICS[0].needle);
const readValue = $(".readout-value"),
  readLabel = $(".readout-label");
const rowsEl = $$(".sheet-table tr");
let shown = -1;
function showMetric(i) {
  if (i === shown) return;
  shown = i;
  const m = METRICS[i];
  rowsEl.forEach((r, k) => r.classList.toggle("on", k === i));
  readLabel.textContent = `${m.name} · ${m.label}`;
  delete readLabel.dataset.text;
  decode(readLabel, 600);
  readValue.classList.remove("roll");
  void readValue.offsetWidth;
  readValue.classList.add("roll");
  if (reduce) {
    gauge.set(m.needle);
    readValue.textContent = display(m, 1);
    return;
  }
  const o = { v: gauge.value, t: 0 };
  gsap.to(o, {
    v: m.needle,
    t: 1,
    duration: 1.1,
    ease: "elastic.out(1, .55)",
    overwrite: true,
    onUpdate: () => {
      gauge.set(o.v);
      readValue.textContent = display(m, Math.min(1, o.t * 1.4));
    },
  });
}
showMetric(0);

// ---------------------------------------------------------------- motion
let lenis = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const target = $(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.4 });
    }),
  );
}

const mm = gsap.matchMedia();

// hero: the room lights up, the name rises, the figure steps in
const heroPin = $(".hero-pin");
mm.add("(prefers-reduced-motion: no-preference)", () => {
  gsap.from(".hero-name .line", {
    yPercent: 110,
    duration: 1.3,
    ease: "expo.out",
    stagger: 0.12,
    delay: 0.15,
  });
  gsap.from(".hero-meta span, .marquee, .scroll-cue", {
    opacity: 0,
    duration: 1,
    delay: 0.7,
    stagger: 0.08,
  });
  // the planes drift on their own, slowly
  const amb = { ax: 0, ay: 0 };
  gsap.to(amb, {
    ax: 1.2,
    ay: 0.6,
    duration: 9,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
    onUpdate: () => {
      heroPin.style.setProperty("--ax", amb.ax.toFixed(4));
      heroPin.style.setProperty("--ay", amb.ay.toFixed(4));
    },
  });
});
mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
  // pointer parallax: each plane has its own factor in CSS
  const p = { x: 0, y: 0 };
  const toX = gsap.quickTo(p, "x", {
    duration: 0.9,
    ease: "power3",
    onUpdate: () => heroPin.style.setProperty("--px", p.x.toFixed(4)),
  });
  const toY = gsap.quickTo(p, "y", {
    duration: 0.9,
    ease: "power3",
    onUpdate: () => heroPin.style.setProperty("--py", p.y.toFixed(4)),
  });
  const onMove = (e) => {
    toX((e.clientX / innerWidth - 0.5) * 2);
    toY((e.clientY / innerHeight - 0.5) * 2);
  };
  window.addEventListener("pointermove", onMove);
  // pinned for a little over two extra screens: the name slides apart and dims, the line of intro comes up
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "+=230%",
      scrub: 0.6,
      pin: ".hero-pin",
      pinSpacing: true,
    },
  });
  tl.to(".hero-name .one", { xPercent: -16, opacity: 0.45, ease: "none" }, 0)
    .to(".hero-name .two", { xPercent: 20, opacity: 0.55, ease: "none" }, 0)
    .to(".hero-name", { y: -40, ease: "none" }, 0)
    .fromTo(
      ".hero-intro",
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, ease: "power2.out", duration: 0.35 },
      0.08,
    )
    .to(".hero-meta", { opacity: 0, duration: 0.3, ease: "none" }, 0)
    .to(".plane-figure", { y: "-3%", ease: "none" }, 0)
    .to(".room-wall", { scale: 1.08, ease: "none" }, 0)
    .to(".plane-haze", { opacity: 0.6, ease: "none" }, 0);
  return () => window.removeEventListener("pointermove", onMove);
});
// the scroll cue goes once the page has moved
ScrollTrigger.create({
  start: 40,
  onToggle: (self) =>
    document.documentElement.classList.toggle("scrolled", self.isActive),
});

// work: the cards ride a curve, nearest on the left, receding to the right
mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
  const cards = $$(".card");
  const place = (p) => {
    const w = cards[0].offsetWidth,
      gap = w * 1.14,
      anchor = -innerWidth * 0.2;
    let front = 0,
      best = Infinity;
    cards.forEach((c, i) => {
      const x = anchor + (i - p * (cards.length - 1.6)) * gap;
      const d = x - anchor;
      const z = -Math.abs(d) * 0.42;
      const rot = gsap.utils.clamp(-24, 24, -d * 0.022);
      const fade = gsap.utils.clamp(0, 1, 1.25 - Math.abs(d) / (gap * 2.6));
      c.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${rot}deg)`;
      c.style.opacity = fade.toFixed(3);
      c.style.zIndex = String(100 - Math.round(Math.abs(d) / 10));
      if (Math.abs(d) < best) {
        best = Math.abs(d);
        front = i;
      }
    });
    // the card in front runs its mock-up
    cards.forEach((c, i) => c.classList.toggle("live", i === front));
  };
  // cards tilt towards the pointer
  cards.forEach((c) => {
    const btn = $(".card-btn", c);
    const rx = gsap.quickTo(btn, "rotationX", {
        duration: 0.5,
        ease: "power3",
      }),
      ry = gsap.quickTo(btn, "rotationY", { duration: 0.5, ease: "power3" });
    c.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
      ry(((e.clientX - r.left) / r.width - 0.5) * 12);
    });
    c.addEventListener("pointerleave", () => {
      rx(0);
      ry(0);
    });
  });
  place(0);
  const st = ScrollTrigger.create({
    trigger: ".work",
    start: "top top",
    end: () => `+=${innerHeight * 2.4}`,
    pin: ".work-pin",
    scrub: true,
    onUpdate: (self) => place(self.progress),
    onRefresh: (self) => place(self.progress),
  });
  // capability columns light up one by one as the cards pass
  const caps = $$(".cap");
  ScrollTrigger.create({
    trigger: ".work",
    start: "top top",
    end: () => `+=${innerHeight * 2.4}`,
    onUpdate: (self) =>
      caps.forEach((c, i) => {
        const on = self.progress >= i / caps.length - 0.01;
        if (on && !c.classList.contains("on")) decode($(".cap-head b", c), 700);
        c.classList.toggle("on", on);
      }),
  });
  return () => {
    st.kill();
    cards.forEach((c) => {
      c.style.transform = c.style.opacity = c.style.zIndex = "";
    });
  };
});

// numbers: pin the gauge and step through each figure
mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
  ScrollTrigger.create({
    trigger: ".numbers",
    start: "top top",
    end: () => `+=${innerHeight * 0.55 * METRICS.length}`,
    pin: ".numbers-pin",
    onUpdate: (self) =>
      showMetric(
        Math.min(
          METRICS.length - 1,
          Math.floor(self.progress * METRICS.length),
        ),
      ),
  });
});
// on phones each row tapped or scrolled past drives the gauge instead
mm.add("(max-width: 899px)", () => {
  rowsEl.forEach((r, i) =>
    ScrollTrigger.create({
      trigger: r,
      start: "top 70%",
      onEnter: () => showMetric(i),
      onEnterBack: () => showMetric(i),
    }),
  );
});

// gentle reveals for the rest
mm.add("(prefers-reduced-motion: no-preference)", () => {
  $$(
    ".about-row, .rules li, .road li, .cv-list li, .contact-title span, .contact-note, .mail-btn, .contact-links",
  ).forEach((n) =>
    gsap.from(n, {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: { trigger: n, start: "top 88%" },
    }),
  );
});

// rail tracks the whole page and lights the current section
ScrollTrigger.create({
  start: 0,
  end: "max",
  onUpdate: (self) => {
    $(".rail-marker").style.setProperty("--p", self.progress.toFixed(4));
    $(".rail-pct").textContent = String(Math.round(self.progress * 100)).padStart(3, "0");
  },
  onRefresh: placeStops,
});
sections.forEach((s, i) =>
  ScrollTrigger.create({
    trigger: s,
    start: "top 50%",
    end: "bottom 50%",
    onToggle: (self) => {
      if (!self.isActive) return;
      railItems.forEach((li, k) => li.classList.toggle("on", k === i));
      const label = $("span", railItems[i]);
      delete label.dataset.text;
      decode(label, 500);
    },
  }),
);
// the rail and nav switch to dark ink over the paper sections
$$(".paper").forEach((p) =>
  ScrollTrigger.create({
    trigger: p,
    start: "top 40px",
    end: "bottom 40px",
    onToggle: (self) =>
      document.documentElement.classList.toggle("on-paper", self.isActive),
  }),
);

if (reduce || narrow()) $$(".cap").forEach((c) => c.classList.add("on"));
document.fonts?.ready.then(() => ScrollTrigger.refresh());

// headings and labels decode in as they arrive
$$(
  ".eyebrow, .title, .sheet-title, .contact-title span, .work-note, .hero-meta span",
).forEach((el) =>
  ScrollTrigger.create({
    trigger: el,
    start: "top 92%",
    once: true,
    onEnter: () => decode(el, el.classList.contains("eyebrow") ? 600 : 1000),
  }),
);
// magnetic controls
magnet($(".mail-btn"), 0.3);
magnet($(".scroll-cue"), 0.4);
// the contact light follows the pointer
const contact = $(".contact"),
  light = $(".contact .hero-glow");
if (contact && light && !reduce) {
  const lx = gsap.quickTo(light, "--lx", {
      duration: 1.2,
      ease: "power2",
      unit: "%",
    }),
    ly = gsap.quickTo(light, "--ly", {
      duration: 1.2,
      ease: "power2",
      unit: "%",
    });
  contact.addEventListener("pointermove", (e) => {
    const r = contact.getBoundingClientRect();
    lx(((e.clientX - r.left) / r.width) * 100);
    ly(((e.clientY - r.top) / r.height) * 100);
  });
}
// phones: a card runs its mock-up while it is mostly on screen
if (narrow() || reduce) {
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((en) => en.target.classList.toggle("live", en.isIntersecting)),
    { threshold: 0.6 },
  );
  $$(".card").forEach((c) => io.observe(c));
}

// the glyph portrait: wait for the mono font so the atlas is drawn with it
Promise.all([document.fonts?.ready, loadImage("/portrait.png")])
  .then(([, img]) =>
    mountGlyphPortrait($(".glyph-portrait"), img, {
      delay: 0.4,
      frame: (W, H) =>
        W < 900
          ? (() => {
              // the figure fills whatever is left between the intro and the ticker
              const intro = $(".hero-intro").getBoundingClientRect();
              const top = (intro.bottom - $(".hero-pin").getBoundingClientRect().top + 8) / H;
              const bottom = 0.93;
              return { cx: 0.5, bottom, height: Math.max(0.22, Math.min(0.42, bottom - top)), rows: 62 };
            })()
          : { cx: 0.76, bottom: 1.03, height: 0.86, rows: 104 },
    }),
  )
  .catch(() => {});

// the road: experience as stops on a line, oldest first; the line draws as it enters
$(".road").innerHTML = [...EXPERIENCE]
  .reverse()
  .map(
    (e) =>
      `<li><i></i><em class="mono">${esc(e.when)}</em><b>${esc(e.org)}</b><span>${esc(e.role.replace(" · Hyderabad", ""))}</span></li>`,
  )
  .join("");
ScrollTrigger.create({
  trigger: ".road",
  start: "top 80%",
  once: true,
  onEnter: () => $(".road").classList.add("in"),
});
