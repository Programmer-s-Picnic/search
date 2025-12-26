/* =========================================================
   Programmer’s Picnic — Branding v2.4.2
   Mobile-FIXED Controls (Move / Collapse Visible)
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
    puzzle: "https://varanasi-software-junction.github.io/search/daily-puzzle.json",
    link: "https://varanasi-software-junction.github.io/search/daily-link.json"
  };

  /* ---------------- UTILS ---------------- */
  const rand = a => a[Math.floor(Math.random() * a.length)];
  const load = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
  const save = (k,v) => localStorage.setItem(k, JSON.stringify(v));

  let daily = load(STORAGE_KEY);
  if (!daily || daily.date !== TODAY) {
    daily = { date: TODAY, tipId:null, puzzleId:null, linkId:null };
    save(STORAGE_KEY, daily);
  }

  /* ---------------- FONT ---------------- */
  const font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&display=swap";
  document.head.appendChild(font);

  /* ---------------- PYODIDE ---------------- */
  const pyScript = document.createElement("script");
  pyScript.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
  document.head.appendChild(pyScript);

  let pyodide, pyReady = false;
  async function initPyodide(){
    if(pyReady) return;
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

  /* Header layout FIX */
  .pp-header{
    display:grid;
    grid-template-columns:1fr auto;
    align-items:center;
    background:linear-gradient(135deg,#f59e0b,#d97706);
    color:#fff;
    padding:12px 12px 12px 16px;
    font-weight:700;
    min-height:56px;
  }

  .pp-title{
    font-size:16px;
    line-height:1.2;
  }

  .pp-controls{
    display:flex;
    gap:10px;
  }

  /* Buttons now REAL buttons */
  .pp-control-btn{
    width:44px;
    height:44px;
    border-radius:12px;
    display:flex;
    align-items:center;
    justify-content:center;
    background:rgba(255,255,255,.2);
    color:white;
    font-size:20px;
    cursor:pointer;
    user-select:none;
  }

  .pp-control-btn:active{
    background:rgba(255,255,255,.35);
  }

  .pp-section{border-top:1px solid #fde68a}
  .pp-section h3{
    margin:0;padding:12px 16px;
    background:#fff3d6;
    display:flex;
    justify-content:space-between;
    cursor:pointer
  }
  .pp-content{padding:14px 16px}

  textarea,pre{
    width:100%;
    border-radius:10px;
    border:1px solid #fde68a;
    padding:10px;
    font-family:monospace;
    white-space:pre-wrap
  }

  .pp-btn{
    background:#d97706;
    color:white;
    border:none;
    border-radius:8px;
    padding:10px 14px;
    margin-top:8px;
    margin-right:6px;
    font-size:15px;
    cursor:pointer
  }
  .pp-btn.secondary{background:#92400e}

  .pp-output{
    background:#111;
    color:#0f0;
    padding:10px;
    border-radius:8px;
    margin-top:8px;
    font-family:monospace
  }

  .pp-link{color:#d97706;font-weight:600;text-decoration:none}

  /* Bubble */
  .pp-bubble{
    position:fixed;
    width:56px;height:56px;
    border-radius:50%;
    background:linear-gradient(135deg,#f59e0b,#d97706);
    box-shadow:0 10px 25px rgba(0,0,0,.25);
    display:flex;
    align-items:center;
    justify-content:center;
    color:white;
    font-size:26px;
    cursor:pointer;
    z-index:999999;
    animation:pp-float 18s linear infinite
  }

  @keyframes pp-float{
    0%{top:20px;left:20px}
    25%{top:20px;left:75%}
    50%{top:75%;left:75%}
    75%{top:75%;left:20px}
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
    .pp-panel{
      width:92vw;
      right:4vw;
      bottom:14px;
    }
  }
  `;
  document.head.appendChild(style);

  /* ---------------- PANEL ---------------- */
  const panel = document.createElement("div");
  panel.className = "pp-panel";
  panel.innerHTML = `
    <div class="pp-header">
      <div class="pp-title">🌼 Today @ Programmer’s Picnic</div>
      <div class="pp-controls">
        <div class="pp-control-btn pp-move" title="Move">⠿</div>
        <div class="pp-control-btn pp-collapse" title="Collapse">▾</div>
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

  /* ---------------- MOVE (TOUCH + MOUSE) ---------------- */
  let dragging=false, ox=0, oy=0;
  const moveBtn = panel.querySelector(".pp-move");

  function startDrag(x,y){
    dragging=true;
    ox=x-panel.offsetLeft;
    oy=y-panel.offsetTop;
  }

  moveBtn.onmousedown = e => startDrag(e.clientX,e.clientY);
  moveBtn.ontouchstart = e => startDrag(e.touches[0].clientX,e.touches[0].clientY);

  document.onmousemove = e => {
    if(!dragging) return;
    panel.style.left=e.clientX-ox+"px";
    panel.style.top=e.clientY-oy+"px";
    panel.style.right="auto";
    panel.style.bottom="auto";
  };

  document.ontouchmove = e => {
    if(!dragging) return;
    panel.style.left=e.touches[0].clientX-ox+"px";
    panel.style.top=e.touches[0].clientY-oy+"px";
    panel.style.right="auto";
    panel.style.bottom="auto";
  };

  document.onmouseup = document.ontouchend = () => {
    if(!dragging) return;
    dragging=false;
    save(PANEL_POS_KEY,{left:panel.style.left,top:panel.style.top});
  };

  const pos=load(PANEL_POS_KEY);
  if(pos){
    panel.style.left=pos.left;
    panel.style.top=pos.top;
    panel.style.right="auto";
    panel.style.bottom="auto";
  }

  /* ---------------- GLOW ---------------- */
  if(localStorage.getItem(LAST_SEEN_KEY)!==TODAY){
    panel.classList.add("pp-glow");
    bubble.classList.add("pp-glow");
  }

  if(localStorage.getItem(PANEL_STATE_KEY)==="collapsed"){
    panel.style.display="none";
    bubble.style.display="flex";
  }

  /* ---------------- CONTENT ---------------- */
  Object.entries(SOURCES).forEach(([key,url])=>{
    fetch(url).then(r=>r.json()).then(list=>{
      let chosen=daily[key+"Id"]?list.find(x=>x.id===daily[key+"Id"]):rand(list);
      daily[key+"Id"]=chosen.id;
      save(STORAGE_KEY,daily);

      const box=panel.querySelector(\`[data-key="\${key}"] .pp-content\`);

      if(key==="puzzle"){
        box.innerHTML=\`
<strong>\${chosen.title}</strong><br><br>
<textarea rows="6">\${chosen.content}</textarea>
<button class="pp-btn run">▶ Run</button>
<button class="pp-btn secondary share">Share</button>
<div class="pp-output"></div>\`;

        const out=box.querySelector(".pp-output");
        box.querySelector(".run").onclick=async()=>{
          out.textContent="Running...";
          await initPyodide();

          const code=box.querySelector("textarea").value
            .replace(/\\\\/g,"\\\\\\\\")
            .replace(/"""/g,'\\\\\"\\\\\"\\\\\"');

          const wrapped=\`
import sys
from io import StringIO
_stdout=sys.stdout
sys.stdout=StringIO()
try:
    exec("""\${code}""")
    result=sys.stdout.getvalue()
except Exception as e:
    result=str(e)
finally:
    sys.stdout=_stdout
result
\`;

          try{
            out.textContent=(await pyodide.runPythonAsync(wrapped)).trim()||"✔ (No output)";
          }catch(e){out.textContent=e.toString();}
        };
        box.querySelector(".share").onclick=()=>share(chosen);
      }else{
        box.innerHTML=\`
<strong>\${chosen.title}</strong><br><br>
<pre>\${chosen.content}</pre>
<a href="\${chosen.link}" target="_blank" class="pp-link">🔗 Open</a>
<button class="pp-btn secondary share">Share</button>\`;
        box.querySelector(".share").onclick=()=>share(chosen);
      }
    });
  });

  function share(item){
    const text=\`\${item.title}\\n\\n\${item.content}\\n\\n\${item.link}\`;
    navigator.share?navigator.share({text,url:item.link}):navigator.clipboard.writeText(text);
  }

})();