/* =========================================================
   Programmer’s Picnic — Branding v2.6.1
   MOVING ICON (old style) • Panel open/close
   Accordion (one open) • Pyodide SAFE output
   Localhost + Mobile stable
========================================================= */

(function () {
  "use strict";

  /* ---------------- CONFIG ---------------- */
  const PANEL_STATE_KEY = "pp_panel_state_v2";
  const SOURCES = {
    tip: "https://varanasi-software-junction.github.io/search/daily-tip.json",
    puzzle:
      "https://varanasi-software-junction.github.io/search/daily-puzzle.json",
    link: "https://varanasi-software-junction.github.io/search/daily-link.json",
  };

  /* ---------------- UTILS ---------------- */
  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const load = (k) => {
    try {
      return JSON.parse(localStorage.getItem(k));
    } catch {
      return null;
    }
  };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  /* ---------------- FONT ---------------- */
  const font = document.createElement("link");
  font.rel = "stylesheet";
  font.href =
    "https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&display=swap";
  document.head.appendChild(font);

  /* ---------------- PYODIDE ---------------- */
  const pyScript = document.createElement("script");
  pyScript.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
  document.head.appendChild(pyScript);

  let pyodide,
    pyReady = false;
  async function initPyodide() {
    if (pyReady) return;
    pyodide = await loadPyodide();
    pyReady = true;
  }

  /* ---------------- STYLES ---------------- */
  const style = document.createElement("style");
  style.textContent = `
  /* PANEL */
  .pp-panel{
    position:fixed;
    right:12px;
    bottom:12px;
    width:360px;
    max-height:calc(100vh - 24px);
    display:flex;
    flex-direction:column;
    background:#fffaf2;
    border-radius:18px;
    box-shadow:0 12px 30px rgba(0,0,0,.15);
    font-family:'Lora',serif;
    z-index:999999;
    overflow:hidden;
  }

  /* STICKY HEADER so buttons NEVER disappear */
  .pp-header{
    position:sticky;
    top:0;
    z-index:2;
    display:grid;
    grid-template-columns:1fr auto;
    align-items:center;
    background:linear-gradient(135deg,#f59e0b,#d97706);
    color:#fff;
    padding:12px 14px;
    min-height:56px;
    font-weight:700;
  }
  .pp-controls{display:flex;gap:8px;}
  .pp-control-btn{
    width:44px;height:44px;border-radius:12px;
    background:rgba(255,255,255,.25);
    color:#fff;border:none;font-size:18px;
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;
  }

  .pp-body{overflow:auto;flex:1;}

  /* ACCORDION */
  .pp-accordion{border-top:1px solid #fde68a;}
  .pp-acc-header{
    padding:14px 16px;background:#fff3d6;
    cursor:pointer;font-weight:600;
    display:flex;justify-content:space-between;align-items:center;
    user-select:none;
  }
  .pp-acc-header span{font-size:18px;font-weight:800;line-height:1;}
  .pp-acc-content{display:none;padding:14px 16px;}
  .pp-accordion.active .pp-acc-content{display:block;}

  textarea, pre{
    width:100%;
    border-radius:10px;
    border:1px solid #fde68a;
    padding:10px;
    font-family:monospace;
    white-space:pre-wrap;
  }

  .pp-btn{
    background:#d97706;color:#fff;
    border:none;border-radius:10px;
    padding:10px 14px;margin-top:10px;
    cursor:pointer;
    font-weight:700;
  }

  .pp-output{
    background:#111;color:#0f0;
    padding:10px;border-radius:10px;
    margin-top:10px;font-family:monospace;
    min-height:22px;
  }

  .pp-link{color:#d97706;font-weight:700;text-decoration:none;}

  /* MOVING ICON (old style) */
  .pp-float{
    position:fixed;
    top:18px;
    left:18px;
    width:64px;
    height:64px;
    border-radius:50%;
    background:linear-gradient(135deg,#f59e0b,#d97706);
    box-shadow:0 10px 25px rgba(0,0,0,.25);
    display:flex;
    align-items:center;
    justify-content:center;
    color:#fff;
    font-size:28px;
    cursor:pointer;
    z-index:999999;
    user-select:none;
    -webkit-tap-highlight-color: transparent;
    animation: pp-move-around 18s linear infinite;
  }

  /* pause animation when user is dragging */
  .pp-float.pp-dragging{ animation:none !important; }

  @keyframes pp-move-around{
    0%   { top:16px; left:16px; }
    25%  { top:16px; left:calc(100vw - 90px); }
    50%  { top:calc(100vh - 110px); left:calc(100vw - 90px); }
    75%  { top:calc(100vh - 110px); left:16px; }
    100% { top:16px; left:16px; }
  }

  @media(max-width:600px){
    .pp-panel{
      width:92vw;
      right:4vw;
      bottom:10px;
      max-height:calc(100vh - 20px);
    }
    .pp-float{
      width:56px;height:56px;font-size:24px;
    }
  }
  `;
  document.head.appendChild(style);

  /* ---------------- MOVING ICON ---------------- */
  const floater = document.createElement("div");
  floater.className = "pp-float";
  floater.title = "Open Programmer’s Picnic";
  floater.textContent = "🍊";
  document.body.appendChild(floater);

  /* ---------------- PANEL ---------------- */
  const panel = document.createElement("div");
  panel.className = "pp-panel";
  panel.style.display = "none"; // start hidden (icon only)
  panel.innerHTML = `
    <div class="pp-header">
      <div>🌼 Today @ Programmer’s Picnic</div>
      <div class="pp-controls">
        <button class="pp-control-btn pp-collapse" title="Collapse">▾</button>
      </div>
    </div>

    <div class="pp-body">
      <div class="pp-accordion" data-key="tip">
        <div class="pp-acc-header">🧠 Daily Tip <span>+</span></div>
        <div class="pp-acc-content"></div>
      </div>

      <div class="pp-accordion active" data-key="puzzle">
        <div class="pp-acc-header">🧩 Python Puzzle <span>−</span></div>
        <div class="pp-acc-content"></div>
      </div>

      <div class="pp-accordion" data-key="link">
        <div class="pp-acc-header">🌐 LearnWithChampak <span>+</span></div>
        <div class="pp-acc-content"></div>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  /* ---------------- OPEN / CLOSE ---------------- */
  function openPanel() {
    panel.style.display = "flex";
    floater.style.display = "none";
    save(PANEL_STATE_KEY, "open");
  }

  function closePanel() {
    panel.style.display = "none";
    floater.style.display = "flex";
    save(PANEL_STATE_KEY, "closed");
  }

  panel.querySelector(".pp-collapse").addEventListener("click", (e) => {
    e.preventDefault();
    closePanel();
  });

  // tap icon opens panel (but not when dragging)
  let justDragged = false;
  floater.addEventListener("click", () => {
    if (justDragged) {
      justDragged = false;
      return;
    }
    openPanel();
  });

  // restore last state
  if (load(PANEL_STATE_KEY) === "open") openPanel();

  /* ---------------- ACCORDION (ONE OPEN AT A TIME) ---------------- */
  function setActiveAccordion(activeKey) {
    panel.querySelectorAll(".pp-accordion").forEach((acc) => {
      const isActive = acc.getAttribute("data-key") === activeKey;
      acc.classList.toggle("active", isActive);
      const icon = acc.querySelector(".pp-acc-header span");
      if (icon) icon.textContent = isActive ? "−" : "+";
    });
  }

  panel.querySelectorAll(".pp-accordion .pp-acc-header").forEach((header) => {
    header.addEventListener(
      "click",
      () => {
        const acc = header.closest(".pp-accordion");
        const key = acc.getAttribute("data-key");
        if (acc.classList.contains("active")) return; // keep one always open
        setActiveAccordion(key);
      },
      { passive: true }
    );
  });

  setActiveAccordion("puzzle");

  /* ---------------- DRAG THE MOVING ICON (optional + stable) ---------------- */
  // If user drags it, we stop animation and set exact position.
  // After drag ends, it stays where dropped (no animation restart).
  if (window.PointerEvent) {
    let dragging = false,
      ox = 0,
      oy = 0;

    floater.addEventListener("pointerdown", (e) => {
      dragging = true;
      justDragged = false;

      const r = floater.getBoundingClientRect();
      floater.classList.add("pp-dragging");
      floater.style.top = r.top + "px";
      floater.style.left = r.left + "px";

      ox = e.clientX - r.left;
      oy = e.clientY - r.top;

      floater.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    floater.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      e.preventDefault();

      const w = floater.offsetWidth;
      const h = floater.offsetHeight;

      const maxX = window.innerWidth - w - 6;
      const maxY = window.innerHeight - h - 6;

      const x = Math.max(6, Math.min(maxX, e.clientX - ox));
      const y = Math.max(6, Math.min(maxY, e.clientY - oy));

      floater.style.left = x + "px";
      floater.style.top = y + "px";
      justDragged = true;
    });

    floater.addEventListener("pointerup", (e) => {
      if (!dragging) return;
      dragging = false;
      try {
        floater.releasePointerCapture(e.pointerId);
      } catch {}
      setTimeout(() => {
        /* keep dropped position */
      }, 0);
    });

    floater.addEventListener("pointercancel", () => {
      dragging = false;
    });
  }

  /* ---------------- LOAD CONTENT ---------------- */
  Object.entries(SOURCES).forEach(([key, url]) => {
    fetch(url)
      .then((r) => r.json())
      .then((list) => {
        const chosen = rand(list);
        const box = panel.querySelector(
          `.pp-accordion[data-key="${key}"] .pp-acc-content`
        );

        if (key === "puzzle") {
          box.innerHTML = `
<strong>${chosen.title}</strong><br><br>
<textarea rows="6">${chosen.content}</textarea>
<button class="pp-btn run">▶ Run</button>
<div class="pp-output"></div>
`;
          const out = box.querySelector(".pp-output");
          const editor = box.querySelector("textarea");

          box.querySelector(".run").onclick = async () => {
            out.textContent = "Running...";
            await initPyodide();

            // SAFE: do NOT interpolate code into JS template literals
            pyodide.globals.set("USER_CODE", editor.value);

            const result = await pyodide.runPythonAsync(`
import sys
from io import StringIO
_stdout=sys.stdout
sys.stdout=StringIO()
try:
    exec(USER_CODE)
    output=sys.stdout.getvalue()
except Exception as e:
    output=str(e)
finally:
    sys.stdout=_stdout
output
`);
            out.textContent = (result || "").trim() || "✔ (No output)";
          };
        } else {
          box.innerHTML = `
<strong>${chosen.title}</strong><br><br>
<pre>${chosen.content}</pre>
<a href="${chosen.link}" target="_blank" class="pp-link">🔗 Open</a>
`;
        }
      })
      .catch((err) => console.warn("PP fetch failed:", key, err));
  });
})();
