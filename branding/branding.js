/* =========================================================
   Programmer’s Picnic — Branding v2.4.1
   Random Daily Content • Pyodide Output FIXED
   Memory + Glow + Move + Collapse
   Mobile-first, Blogger-safe
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

  function load(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  }
  function save(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

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
    position:fixed;bottom:20px;right:20px;width:360px;
    background:#fffaf2;border-radius:18px;
    box-shadow:0 12px 30px rgba(0,0,0,.15);
    font-family:'Lora',serif;z-index:999999;overflow:hidden
  }
  .pp-header{
    background:linear-gradient(135deg,#f59e0b,#d97706);
    color:#fff;padding:14px 16px;
    display:flex;justify-content:space-between;
    align-items:center;font-weight:700
  }
  .pp-controls span{
    cursor:pointer;margin-left:10px;font-size:18px;
    user-select:none
  }
  .pp-section{border-top:1px solid #fde68a}
  .pp-section h3{
    margin:0;padding:12px 16px;
    background:#fff3d6;cursor:pointer;
    display:flex;justify-content:space-between
  }
  .pp-content{padding:14px 16px}
  textarea, pre{
    width:100%;border-radius:10px;
    border:1px solid #fde68a;
    padding:10px;font-family:monospace;
    white-space:pre-wrap
  }
  .pp-btn{
    background:#d97706;color:#fff;
    border:none;border-radius:8px;
    padding:8px 12px;margin-top:8px;margin-right:6px;
    cursor:pointer
  }
  .pp-btn.secondary{background:#92400e}
  .pp-output{
    background:#111;color:#0f0;
    padding:8px;border-radius:8px;
    margin-top:8px;font-family:monospace
  }
  .pp-link{color:#d97706;font-weight:600;text-decoration:none}

  /* Bubble */
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

  /* Glow */
  .pp-glow{
    animation:ppGlow 2.5s ease-in-out infinite
  }
  @keyframes ppGlow{
    0%{box-shadow:0 0 0 rgba(0,0,0,0)}
    50%{box-shadow:0 0 22px rgba(217,119,6,.55)}
    100%{box-shadow:0 0 0 rgba(0,0,0,0)}
  }

  @media(max-width:600px){
    .pp-panel{width:92vw;right:4vw}
    .pp-bubble{width:56px;height:56px;font-size:26px}
  }
  `;
  document.head.appendChild(style);

  /* ---------------- PANEL ---------------- */
  const panel = document.createElement("div");
  panel.className = "pp-panel";
  panel.innerHTML = `
    <div class="pp-header">
      <span>🌼 Today @ Programmer’s Picnic</span>
      <div class="pp-controls">
        <span class="pp-move" title="Move">⠿</span>
        <span class="pp-collapse" title="Collapse">▾</span>
      </div>
    </div>

    <div class="pp-section" data-key="tip">
      <h3>🧠 Daily Tip <span>−</span></h3>
      <div class="pp-content"></div>
    </div>

    <div class="pp-section" data-key="puzzle">
      <h3>🧩 Python Puzzle <span>−</span></h3>
      <div class="pp-content"></div>
    </div>

    <div class="pp-section" data-key="link">
      <h3>🌐 LearnWithChampak <span>−</span></h3>
      <div class="pp-content"></div>
    </div>
  `;
  document.body.appendChild(panel);

  /* ---------------- BUBBLE ---------------- */
  const bubble = document.createElement("div");
  bubble.className = "pp-bubble";
  bubble.textContent = "🍊";
  bubble.style.display = "none";
  document.body.appendChild(bubble);

  /* ---------------- COLLAPSE / REVIVE ---------------- */
  panel.querySelector(".pp-collapse").onclick = () => {
    panel.style.display = "none";
    bubble.style.display = "flex";
    localStorage.setItem(PANEL_STATE_KEY, "collapsed");
  };

  bubble.onclick = () => {
    bubble.style.display = "none";
    panel.style.display = "block";
    panel.classList.remove("pp-glow");
    bubble.classList.remove("pp-glow");
    localStorage.setItem(PANEL_STATE_KEY, "expanded");
    localStorage.setItem(LAST_SEEN_KEY, TODAY);
  };

  /* ---------------- MOVE (DRAG) ---------------- */
  let dragging = false,
    ox = 0,
    oy = 0;
  const moveHandle = panel.querySelector(".pp-move");

  moveHandle.onmousedown = (e) => {
    dragging = true;
    ox = e.clientX - panel.offsetLeft;
    oy = e.clientY - panel.offsetTop;
  };
  document.onmousemove = (e) => {
    if (!dragging) return;
    panel.style.left = e.clientX - ox + "px";
    panel.style.top = e.clientY - oy + "px";
    panel.style.right = "auto";
    panel.style.bottom = "auto";
  };
  document.onmouseup = () => {
    if (!dragging) return;
    dragging = false;
    save(PANEL_POS_KEY, { left: panel.style.left, top: panel.style.top });
  };

  const savedPos = load(PANEL_POS_KEY);
  if (savedPos) {
    panel.style.left = savedPos.left;
    panel.style.top = savedPos.top;
    panel.style.right = "auto";
    panel.style.bottom = "auto";
  }

  /* ---------------- GLOW LOGIC ---------------- */
  const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
  if (lastSeen !== TODAY) {
    panel.classList.add("pp-glow");
    bubble.classList.add("pp-glow");
  }

  if (localStorage.getItem(PANEL_STATE_KEY) === "collapsed") {
    panel.style.display = "none";
    bubble.style.display = "flex";
  }

  /* ---------------- LOAD CONTENT ---------------- */
  Object.entries(SOURCES).forEach(([key, url]) => {
    fetch(url)
      .then((r) => r.json())
      .then((list) => {
        let chosen = daily[key + "Id"]
          ? list.find((x) => x.id === daily[key + "Id"])
          : rand(list);

        daily[key + "Id"] = chosen.id;
        save(STORAGE_KEY, daily);

        const box = panel.querySelector(`[data-key="${key}"] .pp-content`);

        if (key === "puzzle") {
          box.innerHTML = `
          <strong>${chosen.title}</strong><br><br>
          <textarea rows="6">${chosen.content}</textarea>
          <div>
            <button class="pp-btn run">▶ Run</button>
            <button class="pp-btn secondary share">Share</button>
          </div>
          <div class="pp-output"></div>
        `;

          const run = box.querySelector(".run");
          const out = box.querySelector(".pp-output");
          const editor = box.querySelector("textarea");

          run.onclick = async () => {
            out.textContent = "Running...";
            await initPyodide();

            const code = editor.value
              .replace(/\\/g, "\\\\")
              .replace(/"""/g, '\\"\\"\\"');

            const wrapped = `
import sys
from io import StringIO
_stdout = sys.stdout
sys.stdout = StringIO()
try:
    exec("""${code}""")
    result = sys.stdout.getvalue()
except Exception as e:
    result = str(e)
finally:
    sys.stdout = _stdout
result
`;

            try {
              const res = await pyodide.runPythonAsync(wrapped);
              out.textContent = res.trim() || "✔ (No output)";
            } catch (e) {
              out.textContent = e.toString();
            }
          };

          box.querySelector(".share").onclick = () => share(chosen);
        } else {
          box.innerHTML = `
          <strong>${chosen.title}</strong><br><br>
          <pre>${chosen.content}</pre>
          <a href="${chosen.link}" target="_blank" class="pp-link">🔗 Open</a>
          <button class="pp-btn secondary share">Share</button>
        `;
          box.querySelector(".share").onclick = () => share(chosen);
        }
      });
  });

  /* ---------------- SHARE ---------------- */
  function share(item) {
    const text = `${item.title}\n\n${item.content}\n\n${item.link}`;
    if (navigator.share) {
      navigator.share({ title: item.title, text, url: item.link });
    } else {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard");
    }
  }
})();
