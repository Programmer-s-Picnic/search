/* =========================================================
   Programmer’s Picnic — Branding v3.1
   Picturesque 3D Floating Profile • Smart Panel Direction
   Accordion • Pyodide SAFE • Correct Line Breaks
   Safer Fetch • Safer HTML Injection • Better Mobile Open
========================================================= */

(function () {
  "use strict";

  /* ---------------- CONFIG ---------------- */

  const PROFILE_PHOTO =
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEglwaii2_xBr47JtUxESk3iekPLl1TSI5B6RuwqNOs_8zk9iGlLqw3d_WprAhKKp3m9F1eO4XBh_JfU_jj6Ad759bHWsqU0evz1SdsG_XBJPc7nXmkbGHO2glvshLTd0fOaKlIGfEVHlEeltJcg2Azc70rVoswRtvH-QiohpHrAuuPEE1uwA9CToBM9foE/s400/me.jpg";

  const SOURCES = {
    tip: "https://varanasi-software-junction.github.io/search/daily-tip.json",
    puzzle: "https://varanasi-software-junction.github.io/search/daily-puzzle.json",
    link: "https://varanasi-software-junction.github.io/search/daily-link.json"
  };

  const PANEL_MARGIN = 20;
  const MOBILE_BREAKPOINT = 600;

  /* ---------------- UTILS ---------------- */

  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeItem(item) {
    if (!item || typeof item !== "object") {
      return { title: "Untitled", content: "No content available.", link: "" };
    }

    return {
      title:
        typeof item.title === "string" && item.title.trim()
          ? item.title.trim()
          : "Untitled",
      content:
        typeof item.content === "string"
          ? item.content
          : item.content == null
            ? "No content available."
            : String(item.content),
      link: typeof item.link === "string" ? item.link.trim() : ""
    };
  }

  function safePick(list) {
    if (!Array.isArray(list) || list.length === 0) return null;
    return normalizeItem(rand(list));
  }

  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  function getEventPoint(e) {
    if (e && typeof e.clientX === "number" && typeof e.clientY === "number") {
      return { x: e.clientX, y: e.clientY };
    }

    if (e && e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }

    if (e && e.changedTouches && e.changedTouches[0]) {
      return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    }

    return {
      x: Math.round(window.innerWidth / 2),
      y: Math.round(window.innerHeight / 2)
    };
  }

  /* ---------------- FONT ---------------- */

  const font = document.createElement("link");
  font.rel = "stylesheet";
  font.href =
    "https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&display=swap";
  document.head.appendChild(font);

  /* ---------------- PYODIDE ---------------- */

  const pyScript = document.createElement("script");
  pyScript.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
  pyScript.async = true;
  document.head.appendChild(pyScript);

  let pyodide = null;
  let pyReady = false;
  let pyLoadingPromise = null;

  async function initPyodide() {
    if (pyReady && pyodide) return pyodide;
    if (pyLoadingPromise) return pyLoadingPromise;

    pyLoadingPromise = new Promise(async (resolve, reject) => {
      try {
        if (typeof loadPyodide !== "function") {
          await new Promise((res, rej) => {
            let tries = 0;
            const maxTries = 200;
            const timer = setInterval(() => {
              tries += 1;
              if (typeof loadPyodide === "function") {
                clearInterval(timer);
                res();
              } else if (tries >= maxTries) {
                clearInterval(timer);
                rej(new Error("Pyodide script did not load."));
              }
            }, 100);
          });
        }

        pyodide = await loadPyodide();
        pyReady = true;
        resolve(pyodide);
      } catch (err) {
        pyReady = false;
        pyLoadingPromise = null;
        reject(err);
      }
    });

    return pyLoadingPromise;
  }

  /* ---------------- STYLES ---------------- */

  const style = document.createElement("style");
  style.textContent = `
  :root{
    --pp-saffron-1:#f59e0b;
    --pp-saffron-2:#d97706;
    --pp-saffron-3:#fbbf24;
    --pp-cream:#fffaf2;
    --pp-panel-line:#fde68a;
    --pp-deep:#7c2d12;
  }

  .pp-float-wrap{
    position:fixed;
    top:20px;
    left:20px;
    width:86px;
    height:86px;
    z-index:999999;
    cursor:pointer;
    animation:
      pp-move-3d 30s linear infinite,
      pp-bob-3d 3.8s ease-in-out infinite,
      pp-tilt-3d 5.5s ease-in-out infinite;
    transform-style:preserve-3d;
    perspective:1000px;
    -webkit-tap-highlight-color:transparent;
  }

  .pp-float-wrap.paused{
    animation-play-state:paused;
  }

  .pp-float-wrap::before{
    content:"";
    position:absolute;
    inset:-16px;
    border-radius:50%;
    background:
      radial-gradient(circle at 30% 30%, rgba(255,255,255,.85), rgba(255,255,255,0) 35%),
      radial-gradient(circle, rgba(251,191,36,.36), rgba(245,158,11,.14) 45%, rgba(217,119,6,0) 72%);
    filter:blur(6px);
    animation:pp-aura 4.5s ease-in-out infinite;
    pointer-events:none;
  }

  .pp-float-wrap::after{
    content:"";
    position:absolute;
    left:12px;
    right:12px;
    bottom:-18px;
    height:18px;
    border-radius:50%;
    background:radial-gradient(circle, rgba(0,0,0,.28), rgba(0,0,0,0) 72%);
    filter:blur(5px);
    transform:translateZ(-1px);
    animation:pp-shadow-breathe 3.8s ease-in-out infinite;
    pointer-events:none;
  }

  .pp-float{
    position:relative;
    width:86px;
    height:86px;
    border-radius:50%;
    overflow:hidden;
    background-image:url('${PROFILE_PHOTO}');
    background-size:cover;
    background-position:center;
    border:3px solid rgba(217,119,6,.95);
    outline:2px solid rgba(255,255,255,.95);
    outline-offset:-5px;
    box-shadow:
      0 4px 10px rgba(255,255,255,.65) inset,
      0 -10px 18px rgba(0,0,0,.14) inset,
      0 10px 24px rgba(0,0,0,.24),
      0 0 0 2px rgba(217,119,6,.2),
      0 0 20px rgba(245,158,11,.35),
      0 0 36px rgba(251,191,36,.28);
    transform-style:preserve-3d;
    backface-visibility:hidden;
  }

  .pp-float::before{
    content:"";
    position:absolute;
    inset:0;
    border-radius:50%;
    background:
      radial-gradient(circle at 28% 22%, rgba(255,255,255,.95), rgba(255,255,255,.28) 16%, rgba(255,255,255,0) 34%),
      linear-gradient(145deg, rgba(255,255,255,.18), rgba(255,255,255,0) 38%, rgba(0,0,0,.08) 100%);
    mix-blend-mode:screen;
    pointer-events:none;
  }

  .pp-float::after{
    content:"";
    position:absolute;
    inset:-7px;
    border-radius:50%;
    border:1.8px solid rgba(255,255,255,.55);
    box-shadow:
      0 0 0 2px rgba(251,191,36,.2),
      0 0 18px rgba(251,191,36,.3);
    transform:translateZ(14px);
    opacity:.9;
    pointer-events:none;
    animation:pp-ring-rotate 9s linear infinite;
  }

  .pp-orbit{
    position:absolute;
    inset:-12px;
    border-radius:50%;
    pointer-events:none;
    border-top:2px solid rgba(255,255,255,.85);
    border-right:2px solid rgba(245,158,11,.75);
    border-bottom:2px solid rgba(251,191,36,.2);
    border-left:2px solid rgba(255,255,255,.15);
    filter:drop-shadow(0 0 8px rgba(245,158,11,.35));
    animation:pp-orbit-spin 7s linear infinite;
  }

  .pp-orbit.pp-orbit-2{
    inset:-18px;
    border-top-color:rgba(251,191,36,.95);
    border-right-color:rgba(255,255,255,.65);
    border-bottom-color:rgba(217,119,6,.15);
    border-left-color:rgba(255,255,255,.15);
    animation-duration:11s;
    animation-direction:reverse;
    opacity:.7;
  }

  @keyframes pp-move-3d{
    0%   { top:20px; left:20px; }
    25%  { top:24px; left:calc(100vw - 110px); }
    50%  { top:calc(100vh - 130px); left:calc(100vw - 110px); }
    75%  { top:calc(100vh - 130px); left:20px; }
    100% { top:20px; left:20px; }
  }

  @keyframes pp-bob-3d{
    0%,100%{ transform:translateY(0) scale(1) rotateZ(0deg); }
    25%{ transform:translateY(-6px) scale(1.03) rotateZ(.6deg); }
    50%{ transform:translateY(-10px) scale(1.05) rotateZ(0deg); }
    75%{ transform:translateY(-5px) scale(1.025) rotateZ(-.6deg); }
  }

  @keyframes pp-tilt-3d{
    0%,100%{ filter:brightness(1) saturate(1.02); }
    25%{ filter:brightness(1.04) saturate(1.08); }
    50%{ filter:brightness(1.07) saturate(1.12); }
    75%{ filter:brightness(1.03) saturate(1.05); }
  }

  @keyframes pp-aura{
    0%,100%{ transform:scale(1); opacity:.78; }
    50%{ transform:scale(1.08); opacity:1; }
  }

  @keyframes pp-shadow-breathe{
    0%,100%{ transform:scale(1) translateY(0); opacity:.42; }
    50%{ transform:scale(.82) translateY(2px); opacity:.26; }
  }

  @keyframes pp-ring-rotate{
    from{ transform:translateZ(14px) rotate(0deg); }
    to{ transform:translateZ(14px) rotate(360deg); }
  }

  @keyframes pp-orbit-spin{
    from{ transform:rotate(0deg); }
    to{ transform:rotate(360deg); }
  }

  .pp-panel{
    position:fixed;
    width:360px;
    max-width:calc(100vw - 40px);
    max-height:calc(100vh - 40px);
    display:flex;
    flex-direction:column;
    background:linear-gradient(180deg, #fffdf8 0%, #fff8ea 100%);
    border-radius:22px;
    box-shadow:
      0 18px 50px rgba(0,0,0,.18),
      0 2px 0 rgba(255,255,255,.7) inset,
      0 -2px 0 rgba(217,119,6,.05) inset;
    font-family:'Lora', serif;
    z-index:999999;
    overflow:hidden;
    border:1px solid #fde68a;
    transform-origin:center center;
    animation:pp-panel-in .28s ease-out;
  }

  @keyframes pp-panel-in{
    0%{
      opacity:0;
      transform:translateY(12px) scale(.96);
    }
    100%{
      opacity:1;
      transform:translateY(0) scale(1);
    }
  }

  .pp-header{
    position:sticky;
    top:0;
    z-index:2;
    display:grid;
    grid-template-columns:1fr auto;
    align-items:center;
    gap:10px;
    background:
      radial-gradient(circle at top left, rgba(255,255,255,.35), transparent 35%),
      linear-gradient(135deg, #fbbf24, #f59e0b 40%, #d97706 100%);
    color:#fff;
    padding:12px 14px;
    min-height:58px;
    font-weight:700;
    box-shadow:0 8px 20px rgba(217,119,6,.18);
  }

  .pp-title{
    line-height:1.2;
    font-size:16px;
    text-shadow:0 1px 1px rgba(0,0,0,.12);
  }

  .pp-control-btn{
    width:44px;
    height:44px;
    border-radius:14px;
    background:rgba(255,255,255,.22);
    color:#fff;
    border:none;
    font-size:22px;
    cursor:pointer;
    display:grid;
    place-items:center;
    transition:transform .15s ease, background .15s ease, box-shadow .15s ease;
    box-shadow:0 4px 12px rgba(0,0,0,.08);
  }

  .pp-control-btn:hover{
    transform:scale(1.05);
    background:rgba(255,255,255,.32);
    box-shadow:0 8px 18px rgba(0,0,0,.12);
  }

  .pp-body{
    overflow:auto;
    flex:1;
  }

  .pp-accordion{
    border-top:1px solid #fde68a;
  }

  .pp-acc-header{
    padding:14px 16px;
    background:linear-gradient(180deg, #fff5dc 0%, #fff0cb 100%);
    cursor:pointer;
    font-weight:600;
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:10px;
    user-select:none;
    transition:background .18s ease, transform .18s ease;
  }

  .pp-acc-header:hover{
    background:linear-gradient(180deg, #fff3d6 0%, #ffeab6 100%);
  }

  .pp-acc-header span{
    font-size:18px;
    font-weight:800;
    min-width:18px;
    text-align:center;
  }

  .pp-acc-content{
    display:none;
    padding:14px 16px;
    background:linear-gradient(180deg, rgba(255,255,255,.65), rgba(255,248,234,.8));
  }

  .pp-accordion.active .pp-acc-content{
    display:block;
  }

  .pp-block-title{
    font-weight:700;
    color:#7c2d12;
    display:block;
    margin-bottom:10px;
  }

  textarea, pre{
    width:100%;
    box-sizing:border-box;
    border-radius:12px;
    border:1px solid #fde68a;
    padding:12px;
    font-family:monospace;
    white-space:pre-wrap;
    overflow-wrap:anywhere;
    background:
      linear-gradient(180deg, #fffefb 0%, #fffaf0 100%);
    box-shadow:
      0 1px 0 rgba(255,255,255,.8) inset,
      0 4px 10px rgba(0,0,0,.03);
  }

  textarea{
    resize:vertical;
    min-height:150px;
  }

  .pp-btn{
    background:linear-gradient(135deg, #f59e0b, #d97706);
    color:#fff;
    border:none;
    border-radius:12px;
    padding:10px 14px;
    margin-top:10px;
    cursor:pointer;
    font-weight:700;
    box-shadow:0 8px 18px rgba(217,119,6,.2);
  }

  .pp-btn:disabled{
    opacity:.7;
    cursor:wait;
  }

  .pp-output{
    background:linear-gradient(180deg, #101010 0%, #181818 100%);
    color:#a7ffb0;
    padding:12px;
    border-radius:12px;
    margin-top:10px;
    font-family:monospace;
    white-space:pre-wrap;
    overflow-wrap:anywhere;
    min-height:52px;
    border:1px solid #222;
    box-shadow:0 6px 14px rgba(0,0,0,.18) inset;
  }

  .pp-link{
    display:inline-block;
    margin-top:10px;
    color:#d97706;
    font-weight:700;
    text-decoration:none;
    word-break:break-word;
  }

  .pp-error{
    color:#991b1b;
    background:#fef2f2;
    border:1px solid #fecaca;
    border-radius:12px;
    padding:10px;
    white-space:pre-wrap;
  }

  .pp-muted{
    color:#6b7280;
  }

  @media (max-width:600px){
    .pp-float-wrap{
      width:72px;
      height:72px;
    }

    .pp-float{
      width:72px;
      height:72px;
    }

    .pp-panel{
      width:92vw;
      max-width:92vw;
      max-height:calc(100vh - 80px);
      border-radius:18px;
    }

    .pp-header{
      padding:10px 12px;
    }

    .pp-title{
      font-size:15px;
    }
  }

  @media (prefers-reduced-motion:reduce){
    .pp-float-wrap,
    .pp-float-wrap::before,
    .pp-float-wrap::after,
    .pp-float::after,
    .pp-orbit{
      animation:none !important;
    }
  }
  `;
  document.head.appendChild(style);

  /* ---------------- FLOATING PHOTO ---------------- */

  const floaterWrap = document.createElement("div");
  floaterWrap.title = "Welcome to Programmer's Picnic. Click to get tips.";
  floaterWrap.className = "pp-float-wrap";
  floaterWrap.innerHTML = `
    <div class="pp-orbit"></div>
    <div class="pp-orbit pp-orbit-2"></div>
    <div class="pp-float"></div>
  `;
  document.body.appendChild(floaterWrap);

  floaterWrap.addEventListener("mouseenter", () => floaterWrap.classList.add("paused"));
  floaterWrap.addEventListener("mouseleave", () => floaterWrap.classList.remove("paused"));
  floaterWrap.addEventListener(
    "touchstart",
    () => floaterWrap.classList.add("paused"),
    { passive: true }
  );

  /* ---------------- PANEL ---------------- */

  const panel = document.createElement("div");
  panel.className = "pp-panel";
  panel.style.display = "none";
  panel.innerHTML = `
    <div class="pp-header">
      <div class="pp-title">🌼 Today @ Programmer’s Picnic</div>
      <button class="pp-control-btn pp-collapse" aria-label="Close panel" title="Close">×</button>
    </div>

    <div class="pp-body">
      <div class="pp-accordion" data-key="tip">
        <div class="pp-acc-header">🧠 Daily Tip <span>+</span></div>
        <div class="pp-acc-content"><div class="pp-muted">Loading...</div></div>
      </div>

      <div class="pp-accordion active" data-key="puzzle">
        <div class="pp-acc-header">🧩 Python Puzzle <span>−</span></div>
        <div class="pp-acc-content"><div class="pp-muted">Loading...</div></div>
      </div>

      <div class="pp-accordion" data-key="link">
        <div class="pp-acc-header">🌐 LearnWithChampak <span>+</span></div>
        <div class="pp-acc-content"><div class="pp-muted">Loading...</div></div>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  /* ---------------- SMART OPEN ---------------- */

  let lastOpenPoint = {
    x: Math.round(window.innerWidth / 2),
    y: Math.round(window.innerHeight / 2)
  };

  function positionPanel(x, y) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const m = PANEL_MARGIN;

    const pw = panel.offsetWidth || 360;
    const ph = panel.offsetHeight || 320;

    let left;
    let top;

    if (isMobile()) {
      left = (vw - pw) / 2;
      top = clamp((vh - ph) / 2, m, vh - ph - m);
    } else {
      left = x - pw / 2;
      top = y - ph / 2;

      if (x < pw + m) left = x + m;
      else if (x > vw - pw - m) left = x - pw - m;

      if (y < ph + m) top = y + m;
      else if (y > vh - ph - m) top = y - ph - m;

      left = clamp(left, m, vw - pw - m);
      top = clamp(top, m, vh - ph - m);
    }

    panel.style.left = `${Math.round(left)}px`;
    panel.style.top = `${Math.round(top)}px`;
  }

  function openPanelSmart(x, y) {
    lastOpenPoint = { x, y };
    panel.style.display = "flex";
    floaterWrap.style.display = "none";

    requestAnimationFrame(() => {
      positionPanel(x, y);
      requestAnimationFrame(() => {
        positionPanel(x, y);
      });
    });
  }

  function closePanel() {
    panel.style.display = "none";
    floaterWrap.style.display = "block";
    floaterWrap.classList.remove("paused");
  }

  floaterWrap.addEventListener("click", (e) => {
    const point = getEventPoint(e);
    floaterWrap.classList.add("paused");
    openPanelSmart(point.x, point.y);
  });

  floaterWrap.addEventListener(
    "touchend",
    (e) => {
      const point = getEventPoint(e);
      floaterWrap.classList.add("paused");
      openPanelSmart(point.x, point.y);
    },
    { passive: true }
  );

  panel.querySelector(".pp-collapse").addEventListener("click", closePanel);

  window.addEventListener("resize", () => {
    if (panel.style.display !== "none") {
      positionPanel(lastOpenPoint.x, lastOpenPoint.y);
    }
  });

  /* ---------------- ACCORDION ---------------- */

  function setActiveAccordion(key) {
    panel.querySelectorAll(".pp-accordion").forEach((acc) => {
      const active = acc.dataset.key === key;
      acc.classList.toggle("active", active);
      const sign = acc.querySelector(".pp-acc-header span");
      if (sign) sign.textContent = active ? "−" : "+";
    });

    if (panel.style.display !== "none") {
      requestAnimationFrame(() => {
        positionPanel(lastOpenPoint.x, lastOpenPoint.y);
      });
    }
  }

  panel.querySelectorAll(".pp-acc-header").forEach((header) => {
    header.addEventListener("click", () => {
      const acc = header.closest(".pp-accordion");
      if (!acc) return;
      if (acc.classList.contains("active")) return;
      setActiveAccordion(acc.dataset.key);
    });
  });

  setActiveAccordion("puzzle");

  /* ---------------- CONTENT RENDER ---------------- */

  function renderError(box, message) {
    box.innerHTML = `<div class="pp-error">${escapeHtml(message)}</div>`;
  }

  function renderTipOrLink(box, chosen) {
    const safeTitle = escapeHtml(chosen.title);
    const safeContent = escapeHtml(chosen.content);
    const safeLink = escapeHtml(chosen.link);

    box.innerHTML = `
      <strong class="pp-block-title">${safeTitle}</strong>
      <pre>${safeContent}</pre>
      ${safeLink ? `<a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="pp-link">🔗 Open</a>` : ""}
    `;
  }

  function renderPuzzle(box, chosen) {
    box.innerHTML = `
      <strong class="pp-block-title">${escapeHtml(chosen.title)}</strong>
      <textarea rows="8" spellcheck="false">${escapeHtml(chosen.content)}</textarea>
      <button class="pp-btn run" type="button">▶ Run</button>
      <div class="pp-output"></div>
    `;

    const out = box.querySelector(".pp-output");
    const editor = box.querySelector("textarea");
    const runBtn = box.querySelector(".run");

    runBtn.addEventListener("click", async () => {
      runBtn.disabled = true;
      out.textContent = "Loading Python runtime...";

      try {
        const py = await initPyodide();
        out.textContent = "Running...";

        py.globals.set("USER_CODE", editor.value);

        const result = await py.runPythonAsync(`
import sys
import traceback
from io import StringIO

_stdout = sys.stdout
_stderr = sys.stderr
buffer = StringIO()

sys.stdout = buffer
sys.stderr = buffer

try:
    exec(USER_CODE, {})
except Exception:
    traceback.print_exc()
finally:
    sys.stdout = _stdout
    sys.stderr = _stderr

buffer.getvalue()
        `);

        const text = String(result || "").replace(/\\s+$/g, "");
        out.textContent = text || "(No output)";
      } catch (err) {
        out.textContent = "Error:\\n" + (err && err.message ? err.message : String(err));
      } finally {
        runBtn.disabled = false;
      }
    });
  }

  async function loadSection(key, url) {
    const box = panel.querySelector(`.pp-accordion[data-key="${key}"] .pp-acc-content`);
    if (!box) return;

    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Could not load ${key}. HTTP ${response.status}`);
      }

      const list = await response.json();
      const chosen = safePick(list);

      if (!chosen) {
        throw new Error(`No valid ${key} items found.`);
      }

      if (key === "puzzle") {
        renderPuzzle(box, chosen);
      } else {
        renderTipOrLink(box, chosen);
      }
    } catch (err) {
      renderError(
        box,
        `Sorry, ${key} could not be loaded.\n${err && err.message ? err.message : String(err)}`
      );
    } finally {
      if (panel.style.display !== "none") {
        requestAnimationFrame(() => {
          positionPanel(lastOpenPoint.x, lastOpenPoint.y);
        });
      }
    }
  }

  /* ---------------- LOAD CONTENT ---------------- */

  Object.entries(SOURCES).forEach(([key, url]) => {
    loadSection(key, url);
  });
})();