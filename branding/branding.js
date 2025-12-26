/* =========================================================
   Programmer’s Picnic — Branding v2.5.1 (Syntax Safe)
   Accordion UI • Pyodide Output FIXED (SAFE)
========================================================= */

(function () {
  "use strict";

  /* ---------------- CONFIG ---------------- */
  const STORAGE_KEY = "pp_daily_random_state";
  const PANEL_STATE_KEY = "pp_panel_state";
  const PANEL_POS_KEY = "pp_panel_position";
  const LAST_SEEN_KEY = "pp_last_seen_day";
  const TODAY = new Date().toDateString();

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

  /* ---------------- DAILY STATE ---------------- */
  let daily = load(STORAGE_KEY);
  if (!daily || daily.date !== TODAY) {
    daily = { date: TODAY, tipId: null, puzzleId: null, linkId: null };
    save(STORAGE_KEY, daily);
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
  .pp-panel{
    position:fixed;bottom:20px;right:20px;
    width:360px;max-height:calc(100vh - 40px);
    display:flex;flex-direction:column;
    background:#fffaf2;border-radius:18px;
    box-shadow:0 12px 30px rgba(0,0,0,.15);
    font-family:'Lora',serif;z-index:999999;
  }
  .pp-header{
    display:grid;grid-template-columns:1fr auto;
    align-items:center;
    background:linear-gradient(135deg,#f59e0b,#d97706);
    color:#fff;padding:12px 14px;
    min-height:56px;font-weight:700;
    flex-shrink:0;
  }
  .pp-controls{display:flex;gap:8px;}
  .pp-control-btn{
    width:44px;height:44px;border-radius:12px;
    background:rgba(255,255,255,.25);
    color:#fff;border:none;font-size:20px;
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;
  }
  .pp-body{overflow:auto;flex:1;}

  .pp-accordion{border-top:1px solid #fde68a;}
  .pp-acc-header{
    padding:14px 16px;background:#fff3d6;
    cursor:pointer;font-weight:600;
    display:flex;justify-content:space-between;
    align-items:center;
    user-select:none;
  }
  .pp-acc-header span{
    font-weight:800;
    font-size:18px;
    line-height:1;
  }
  .pp-acc-content{display:none;padding:14px 16px;}
  .pp-accordion.active .pp-acc-content{display:block;}

  textarea,pre{
    width:100%;border-radius:10px;
    border:1px solid #fde68a;padding:10px;
    font-family:monospace;white-space:pre-wrap;
  }
  .pp-btn{
    background:#d97706;color:#fff;
    border:none;border-radius:8px;
    padding:10px 14px;margin-top:8px;
    margin-right:6px;cursor:pointer;
  }
  .pp-btn.secondary{background:#92400e;}
  .pp-output{
    background:#111;color:#0f0;
    padding:10px;border-radius:8px;
    margin-top:8px;font-family:monospace;
  }
  .pp-link{color:#d97706;font-weight:600;text-decoration:none;}
  `;
  document.head.appendChild(style);

  /* ---------------- PANEL ---------------- */
  const panel = document.createElement("div");
  panel.className = "pp-panel";
  panel.innerHTML = `
    <div class="pp-header">
      <div>🌼 Today @ Programmer’s Picnic</div>
      <div class="pp-controls">
        <button class="pp-control-btn pp-move" title="Move">⠿</button>
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

        // Keep one always open: if already active, do nothing.
        if (acc.classList.contains("active")) return;

        setActiveAccordion(key);
      },
      { passive: true }
    );
  });

  // Ensure default open is puzzle (even if HTML changes later)
  setActiveAccordion("puzzle");

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
<div class="pp-output"></div>`;

          const out = box.querySelector(".pp-output");
          const editor = box.querySelector("textarea");

          box.querySelector(".run").onclick = async () => {
            out.textContent = "Running...";
            await initPyodide();

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
            out.textContent = result.trim() || "✔ (No output)";
          };
        } else {
          box.innerHTML = `
<strong>${chosen.title}</strong><br><br>
<pre>${chosen.content}</pre>
<a href="${chosen.link}" target="_blank" class="pp-link">🔗 Open</a>`;
        }
      });
  });
})();
