/* =========================================================
   Programmer’s Picnic — Branding v2.9
   Moving Profile Photo • Smart Panel Direction
   Accordion • Pyodide SAFE • Correct Line Breaks
========================================================= */

(function () {
  "use strict";

  /* ---------------- CONFIG ---------------- */

  // 🔁 CHANGE THIS IMAGE URL ANYTIME
  const PROFILE_PHOTO =
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEglwaii2_xBr47JtUxESk3iekPLl1TSI5B6RuwqNOs_8zk9iGlLqw3d_WprAhKKp3m9F1eO4XBh_JfU_jj6Ad759bHWsqU0evz1SdsG_XBJPc7nXmkbGHO2glvshLTd0fOaKlIGfEVHlEeltJcg2Azc70rVoswRtvH-QiohpHrAuuPEE1uwA9CToBM9foE/s400/me.jpg";

  const SOURCES = {
    tip: "https://varanasi-software-junction.github.io/search/daily-tip.json",
    puzzle:
      "https://varanasi-software-junction.github.io/search/daily-puzzle.json",
    link: "https://varanasi-software-junction.github.io/search/daily-link.json",
  };

  /* ---------------- UTILS ---------------- */
  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

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
  /* FLOATING PROFILE PHOTO */
  
/* FLOATING PROFILE PHOTO */
.pp-float{
  position:fixed;
  top:20px; left:20px;
  width:64px; height:64px;
  border-radius:50%;

  /* Profile image */
  background-image:url('${PROFILE_PHOTO}');
  background-size:cover;
  background-position:center;

  /* 🟠 Saffron border + inner ring */
  border:3px solid #d97706;                 /* saffron border */
  outline:2px solid rgba(255,255,255,0.9);  /* clean inner ring */
  outline-offset:-4px;

  /* Glow */
  box-shadow:
    0 0 0 2px rgba(217,119,6,0.35),
    0 10px 25px rgba(0,0,0,.25);

  cursor:pointer;
  z-index:999999;
  animation:pp-move 30s linear infinite;
}

/* Pause animation */
.pp-float.paused{
  animation-play-state: paused;
}




  @keyframes pp-move{
    0%   { top:20px; left:20px; }
    25%  { top:20px; left:calc(100vw - 90px); }
    50%  { top:calc(100vh - 110px); left:calc(100vw - 90px); }
    75%  { top:calc(100vh - 110px); left:20px; }
    100% { top:20px; left:20px; }
  }

  /* PANEL */
  .pp-panel{
    position:fixed;
    width:360px;
    max-height:calc(100vh - 40px);
    display:flex;
    flex-direction:column;
    background:#fffaf2;
    border-radius:18px;
    box-shadow:0 12px 30px rgba(0,0,0,.15);
    font-family:'Lora',serif;
    z-index:999999;
    overflow:hidden;
  }

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

  .pp-control-btn{
    width:44px;height:44px;border-radius:12px;
    background:rgba(255,255,255,.25);
    color:#fff;border:none;font-size:20px;
    cursor:pointer;
  }

  .pp-body{ overflow:auto; flex:1; }

  /* ACCORDION */
  .pp-accordion{ border-top:1px solid #fde68a; }
  .pp-acc-header{
    padding:14px 16px;
    background:#fff3d6;
    cursor:pointer;
    font-weight:600;
    display:flex;
    justify-content:space-between;
    align-items:center;
  }
  .pp-acc-header span{ font-size:18px; font-weight:800; }
  .pp-acc-content{ display:none; padding:14px 16px; }
  .pp-accordion.active .pp-acc-content{ display:block; }

  textarea, pre{
    width:100%;
    border-radius:10px;
    border:1px solid #fde68a;
    padding:10px;
    font-family:monospace;
    white-space:pre-wrap;
  }

  .pp-btn{
    background:#d97706;
    color:#fff;
    border:none;
    border-radius:10px;
    padding:10px 14px;
    margin-top:10px;
    cursor:pointer;
  }

  /* 🔥 OUTPUT FIX */
  .pp-output{
    background:#111;
    color:#0f0;
    padding:10px;
    border-radius:10px;
    margin-top:10px;
    font-family:monospace;
    white-space:pre-wrap; /* <-- THIS FIXES LINE BREAKS */
  }

  .pp-link{
    color:#d97706;
    font-weight:700;
    text-decoration:none;
  }

  @media(max-width:600px){
    .pp-panel{
      width:92vw;
      max-height:calc(100vh - 80px);
    }
    .pp-float{
      width:56px; height:56px;
    }
  }
  `;
  document.head.appendChild(style);

  /* ---------------- FLOATING PHOTO ---------------- */
  const floater = document.createElement("div");
  floater.title = "Welcome to Programmer's Picnic. Click to get tips.";
  floater.className = "pp-float";
  document.body.appendChild(floater);

  floater.addEventListener("mouseenter", () => floater.classList.add("paused"));
  floater.addEventListener("mouseleave", () =>
    floater.classList.remove("paused")
  );
  floater.addEventListener(
    "touchstart",
    () => floater.classList.add("paused"),
    { passive: true }
  );

  /* ---------------- PANEL ---------------- */
  const panel = document.createElement("div");
  panel.className = "pp-panel";
  panel.style.display = "none";
  panel.innerHTML = `
    <div class="pp-header">
      <div>🌼 Today @ Programmer’s Picnic</div>
      <button class="pp-control-btn pp-collapse">▾</button>
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

  /* ---------------- SMART OPEN ---------------- */
  function openPanelSmart(x, y) {
    panel.style.display = "flex";
    const pw = panel.offsetWidth;
    const ph = panel.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const m = 20;

    let left = x - pw / 2;
    let top = y - ph / 2;

    if (x < pw + m) left = x + m;
    else if (x > vw - pw - m) left = x - pw - m;

    if (y < ph + m) top = y + m;
    else if (y > vh - ph - m) top = y - ph - m;

    panel.style.left = clamp(left, m, vw - pw - m) + "px";
    panel.style.top = clamp(top, m, vh - ph - m) + "px";

    floater.style.display = "none";
  }

  function closePanel() {
    panel.style.display = "none";
    floater.style.display = "block";
    floater.classList.remove("paused");
  }

  floater.addEventListener("click", (e) => {
    floater.classList.add("paused");
    openPanelSmart(e.clientX, e.clientY);
  });

  panel.querySelector(".pp-collapse").onclick = closePanel;

  /* ---------------- ACCORDION ---------------- */
  function setActiveAccordion(key) {
    panel.querySelectorAll(".pp-accordion").forEach((acc) => {
      const active = acc.dataset.key === key;
      acc.classList.toggle("active", active);
      acc.querySelector("span").textContent = active ? "−" : "+";
    });
  }

  panel.querySelectorAll(".pp-acc-header").forEach((h) => {
    h.onclick = () => {
      const acc = h.closest(".pp-accordion");
      if (acc.classList.contains("active")) return;
      setActiveAccordion(acc.dataset.key);
    };
  });

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
<div class="pp-output"></div>
`;
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
            out.textContent = (result || "").trim();
          };
        } else {
          box.innerHTML = `
<strong>${chosen.title}</strong><br><br>
<pre>${chosen.content}</pre>
<a href="${chosen.link}" target="_blank" class="pp-link">🔗 Open</a>
`;
        }
      });
  });
})();
