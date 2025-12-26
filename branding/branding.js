/* =========================================================
   Programmer’s Picnic — Branding v2.3
   Random Daily Content + Collapse + Floating Avatar
========================================================= */

(function () {
  "use strict";

  /* ---------- CONFIG ---------- */
  const STORAGE_KEY = "pp_daily_random_state";
  const TODAY = new Date().toDateString();

  const SOURCES = {
    tip: "https://varanasi-software-junction.github.io/search/daily-tip.json",
    puzzle: "https://varanasi-software-junction.github.io/search/daily-puzzle.json",
    link: "https://varanasi-software-junction.github.io/search/daily-link.json"
  };

  /* ---------- UTIL ---------- */
  const rand = a => a[Math.floor(Math.random() * a.length)];

  function loadState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
    catch { return null; }
  }

  function saveState(s) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }

  let state = loadState();
  if (!state || state.date !== TODAY) {
    state = { date: TODAY, tipId: null, puzzleId: null, linkId: null };
    saveState(state);
  }

  /* ---------- FONT ---------- */
  const font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&display=swap";
  document.head.appendChild(font);

  /* ---------- PYODIDE ---------- */
  const pyScript = document.createElement("script");
  pyScript.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
  document.head.appendChild(pyScript);

  let pyodide, pyReady = false;
  async function initPy() {
    if (pyReady) return;
    pyodide = await loadPyodide();
    pyReady = true;
  }

  /* ---------- STYLES ---------- */
  const style = document.createElement("style");
  style.textContent = `
  .pp-panel{
    position:fixed;bottom:20px;right:20px;width:360px;
    background:#fffaf2;border-radius:18px;
    box-shadow:0 12px 30px rgba(0,0,0,.15);
    font-family:'Lora',serif;z-index:999999;overflow:hidden
  }
  .pp-header{
    background:linear-gradient(135deg,#f59e0b,#d97706);
    color:#fff;padding:14px 16px;font-weight:700;
    display:flex;justify-content:space-between;
    cursor:move
  }
  .pp-close{cursor:pointer;font-size:22px}
  .pp-section{border-top:1px solid #fde68a}
  .pp-section h3{
    margin:0;padding:12px 16px;cursor:pointer;
    background:#fff3d6;display:flex;justify-content:space-between
  }
  .pp-content{padding:14px 16px}
  textarea, pre{
    width:100%;border-radius:10px;
    border:1px solid #fde68a;padding:10px;
    font-family:monospace;white-space:pre-wrap
  }
  .pp-btn{
    background:#d97706;color:#fff;
    border:none;border-radius:8px;
    padding:8px 12px;margin-top:8px;margin-right:6px;
    cursor:pointer
  }
  .pp-btn.secondary{background:#92400e}
  .pp-output{
    background:#111;color:#0f0;padding:8px;
    border-radius:8px;margin-top:8px
  }
  .pp-link{color:#d97706;font-weight:600;text-decoration:none}

  /* Floating Bubble */
  .pp-bubble{
    position:fixed;width:64px;height:64px;
    border-radius:50%;
    background:linear-gradient(135deg,#f59e0b,#d97706);
    box-shadow:0 10px 25px rgba(0,0,0,.25);
    display:flex;align-items:center;justify-content:center;
    color:white;font-size:30px;cursor:pointer;
    z-index:999999;
    animation:pp-float 18s linear infinite
  }
  @keyframes pp-float{
    0%{top:20px;left:20px}
    25%{top:20px;left:80%}
    50%{top:80%;left:80%}
    75%{top:80%;left:20px}
    100%{top:20px;left:20px}
  }
  `;
  document.head.appendChild(style);

  /* ---------- PANEL ---------- */
  const panel = document.createElement("div");
  panel.className = "pp-panel";
  panel.innerHTML = `
    <div class="pp-header">
      🌼 Today @ Programmer’s Picnic
      <span class="pp-close">×</span>
    </div>
    <div class="pp-section" data-key="tip"><h3>🧠 Tip <span>−</span></h3><div class="pp-content"></div></div>
    <div class="pp-section" data-key="puzzle"><h3>🧩 Puzzle <span>−</span></h3><div class="pp-content"></div></div>
    <div class="pp-section" data-key="link"><h3>🌐 Learn <span>−</span></h3><div class="pp-content"></div></div>
  `;
  document.body.appendChild(panel);

  /* ---------- FLOATING BUBBLE ---------- */
  const bubble = document.createElement("div");
  bubble.className = "pp-bubble";
  bubble.textContent = "🍊";
  bubble.style.display = "none";
  document.body.appendChild(bubble);

  bubble.onclick = () => {
    bubble.style.display = "none";
    panel.style.display = "block";
  };

  panel.querySelector(".pp-close").onclick = () => {
    panel.style.display = "none";
    bubble.style.display = "flex";
  };

  /* ---------- DRAG ---------- */
  let drag = false, dx = 0, dy = 0;
  const header = panel.querySelector(".pp-header");

  header.onmousedown = e => {
    drag = true;
    dx = e.clientX - panel.offsetLeft;
    dy = e.clientY - panel.offsetTop;
  };
  document.onmousemove = e => {
    if (!drag) return;
    panel.style.left = e.clientX - dx + "px";
    panel.style.top = e.clientY - dy + "px";
    panel.style.right = "auto";
    panel.style.bottom = "auto";
  };
  document.onmouseup = () => drag = false;

  /* ---------- LOAD CONTENT ---------- */
  Object.entries(SOURCES).forEach(([key, url]) => {
    fetch(url).then(r => r.json()).then(list => {
      let chosen = state[key + "Id"]
        ? list.find(x => x.id === state[key + "Id"])
        : rand(list);

      state[key + "Id"] = chosen.id;
      saveState(state);

      const box = panel.querySelector(`[data-key="${key}"] .pp-content`);

      if (key === "puzzle") {
        box.innerHTML = `
          <strong>${chosen.title}</strong><br><br>
          <textarea rows="6">${chosen.content}</textarea>
          <button class="pp-btn run">▶ Run</button>
          <button class="pp-btn secondary share">Share</button>
          <div class="pp-output"></div>
        `;
        box.querySelector(".run").onclick = async () => {
          const out = box.querySelector(".pp-output");
          out.textContent = "Running...";
          await initPy();
          try { out.textContent = await pyodide.runPythonAsync(box.querySelector("textarea").value) || "✔ Done"; }
          catch(e){ out.textContent = e; }
        };
        box.querySelector(".share").onclick = () => share(chosen);
      } else {
        box.innerHTML = `
          <strong>${chosen.title}</strong><br><br>
          <pre>${chosen.content}</pre>
          <a href="${chosen.link}" target="_blank" class="pp-link">Open</a>
          <button class="pp-btn secondary share">Share</button>
        `;
        box.querySelector(".share").onclick = () => share(chosen);
      }
    });
  });

  function share(item){
    const txt = `${item.title}\n\n${item.content}\n\n${item.link}`;
    navigator.share ? navigator.share({text:txt,url:item.link}) :
    navigator.clipboard.writeText(txt);
  }

})();