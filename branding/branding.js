/* =========================================================
   Programmer’s Picnic — Branding v2.2
   Random Daily Content (Per User)
   Tip • Python Puzzle (Pyodide) • LearnWithChampak
========================================================= */

(function () {
  "use strict";

  /* ---------- CONFIG ---------- */
  const STORAGE_KEY = "pp_daily_random_state";
  const TODAY = new Date().toDateString(); // human-safe daily key

  const SOURCES = {
    tip: "https://varanasi-software-junction.github.io/search/daily-tip.json",
    puzzle: "https://varanasi-software-junction.github.io/search/daily-puzzle.json",
    link: "https://varanasi-software-junction.github.io/search/daily-link.json"
  };

  /* ---------- UTIL ---------- */
  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  /* ---------- INIT DAILY STATE ---------- */
  let state = loadState();

  if (!state || state.date !== TODAY) {
    state = {
      date: TODAY,
      tipId: null,
      puzzleId: null,
      linkId: null
    };
    saveState(state);
  }

  /* ---------- Fonts ---------- */
  const font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&display=swap";
  document.head.appendChild(font);

  /* ---------- Pyodide ---------- */
  const pyodideScript = document.createElement("script");
  pyodideScript.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
  document.head.appendChild(pyodideScript);

  let pyodide, pyodideReady = false;
  async function initPyodide() {
    if (pyodideReady) return;
    pyodide = await loadPyodide();
    pyodideReady = true;
  }

  /* ---------- Styles ---------- */
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
      font-size:18px;font-weight:700;
      display:flex;justify-content:space-between
    }
    .pp-close{cursor:pointer;font-size:22px}
    .pp-section{border-top:1px solid #fde68a}
    .pp-section h3{
      margin:0;padding:12px 16px;cursor:pointer;
      background:#fff3d6;font-size:16px;
      display:flex;justify-content:space-between
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
      background:#111;color:#0f0;
      padding:8px;border-radius:8px;
      margin-top:8px
    }
    .pp-link{color:#d97706;font-weight:600;text-decoration:none}
  `;
  document.head.appendChild(style);

  /* ---------- Panel ---------- */
  const panel = document.createElement("div");
  panel.className = "pp-panel";
  panel.innerHTML = `
    <div class="pp-header">
      🌼 Today @ Programmer’s Picnic
      <span class="pp-close">&times;</span>
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

  /* ---------- Load & Render ---------- */
  Object.entries(SOURCES).forEach(([key, url]) => {
    fetch(url).then(r => r.json()).then(list => {
      let chosen;

      if (!state[key + "Id"]) {
        chosen = pickRandom(list);
        state[key + "Id"] = chosen.id;
        saveState(state);
      } else {
        chosen = list.find(x => x.id === state[key + "Id"]) || pickRandom(list);
      }

      const box = panel.querySelector(`[data-key="${key}"] .pp-content`);

      if (key === "puzzle") {
        box.innerHTML = `
          <strong>${chosen.title}</strong><br><br>
          <textarea rows="6">${chosen.content}</textarea>
          <div>
            <button class="pp-btn run">▶ Run</button>
            <button class="pp-btn secondary share">🔗 Share</button>
          </div>
          <div class="pp-output"></div>
        `;

        const run = box.querySelector(".run");
        const out = box.querySelector(".pp-output");
        const editor = box.querySelector("textarea");

        run.onclick = async () => {
          out.textContent = "Running...";
          await initPyodide();
          try {
            const r = await pyodide.runPythonAsync(editor.value);
            out.textContent = r ?? "✔ Executed";
          } catch (e) {
            out.textContent = e;
          }
        };

        box.querySelector(".share").onclick = () => share(chosen);

      } else {
        box.innerHTML = `
          <strong>${chosen.title}</strong><br><br>
          <pre>${chosen.content}</pre>
          <p>
            <a href="${chosen.link}" target="_blank" class="pp-link">🔗 Open</a>
            <button class="pp-btn secondary share">Share</button>
          </p>
        `;
        box.querySelector(".share").onclick = () => share(chosen);
      }
    });
  });

  /* ---------- Share ---------- */
  function share(item) {
    const text = `${item.title}\n\n${item.content}\n\n${item.link}`;
    if (navigator.share) {
      navigator.share({ title: item.title, text, url: item.link });
    } else {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard");
    }
  }

  /* ---------- Collapse ---------- */
  panel.querySelectorAll(".pp-section h3").forEach(h => {
    h.onclick = () => {
      const c = h.nextElementSibling;
      const i = h.querySelector("span");
      const open = c.style.display !== "none";
      c.style.display = open ? "none" : "block";
      i.textContent = open ? "+" : "−";
    };
  });

  /* ---------- Close ---------- */
  panel.querySelector(".pp-close").onclick = () => panel.remove();

})();
