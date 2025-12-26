/* ==========================================================
   branding.js — Programmer’s Picnic Daily Widget v2.3
   FIX: content visibility bug (mobile + fixed + transform)
   Author: Champak Roy
   ========================================================== */

(function () {
  "use strict";

  const WIDGET_ID = "pp-daily-widget";
  const STORAGE = {
    collapsed: "ppWidgetCollapsed",
    pos: "ppWidgetPosV3"
  };

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function safeParse(v, f){ try{ return JSON.parse(v);}catch{ return f;} }

  /* ================= CSS ================= */
  const style = document.createElement("style");
  style.textContent = `
#${WIDGET_ID}{
  position:fixed;
  top:16px;
  left:16px;
  transform: translate3d(0px, 64px, 0);
  width:340px;
  max-height:90vh;
  background:linear-gradient(145deg,#fffdf6,#fff2d6);
  border-radius:18px;
  box-shadow:0 12px 30px rgba(0,0,0,.12);
  z-index:999999;
  font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
  overflow:hidden;
}

/* collapsed */
#${WIDGET_ID}.collapsed{
  height:52px;
}

/* header */
.pp-header{
  height:52px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 14px;
  background:linear-gradient(135deg,#ffe8b0,#ffd36a);
  font-weight:700;
  color:#7c3a00;
}

.pp-actions{
  display:flex;
  gap:8px;
}

.pp-btn{
  border:none;
  background:#fff3c4;
  border-radius:12px;
  padding:6px 10px;
  font-size:16px;
  cursor:pointer;
  box-shadow:0 4px 10px rgba(0,0,0,.12);
}

/* IMPORTANT FIX */
.pp-content{
  height:calc(90vh - 52px);
  overflow-y:auto;
  -webkit-overflow-scrolling:touch;
  padding:14px;
  color:#1f2937;
  line-height:1.6;
  display:block;
}

#${WIDGET_ID}.collapsed .pp-content{
  display:none;
}

/* mobile */
.pp-mobile-controls{
  display:none;
  justify-content:center;
  gap:14px;
  margin:12px 0;
}

.pp-mobile-controls button{
  border:none;
  background:linear-gradient(135deg,#ffe9b3,#ffd36a);
  color:#7c3a00;
  font-size:18px;
  padding:10px 14px;
  border-radius:14px;
  box-shadow:0 6px 16px rgba(0,0,0,.15);
  cursor:pointer;
}

@media(max-width:768px){
  #${WIDGET_ID}{
    width:92vw;
    max-height:85vh;
  }
  .pp-content{
    height:calc(85vh - 52px);
  }
  .pp-mobile-controls{
    display:flex;
  }
}
`;
  document.head.appendChild(style);

  /* ================= HTML ================= */
  const widget = document.createElement("div");
  widget.id = WIDGET_ID;
  widget.innerHTML = `
  <div class="pp-header">
    <span>🌼 Today at Programmer’s Picnic</span>
    <div class="pp-actions">
      <button class="pp-btn" id="ppCollapseTop">⬇</button>
      <button class="pp-btn" id="ppMoveTop">☰</button>
    </div>
  </div>

  <div class="pp-content">
    <p><strong>Daily Tip</strong><br>
    10 minutes daily beats 2 hours once a week.</p>

    <div class="pp-mobile-controls">
      <button id="ppCollapseMid">⬇ Collapse</button>
      <button id="ppMoveMid">☰ Move</button>
    </div>

    <p><strong>Daily Puzzle</strong></p>
    <pre style="background:#fff7df;padding:10px;border-radius:12px;white-space:pre-wrap">
x = [1, 2, 3]
print(x[::-1])
    </pre>

    <p><strong>Learn More</strong><br>
      <a href="https://learnwithchampak.live" target="_blank">
        learnwithchampak.live
      </a>
    </p>

    <p style="margin-top:400px">(scroll test)</p>
  </div>
  `;
  document.body.appendChild(widget);

  /* ================= COLLAPSE ================= */
  const collapseTop = widget.querySelector("#ppCollapseTop");
  const collapseMid = widget.querySelector("#ppCollapseMid");

  function toggleCollapse(){
    widget.classList.toggle("collapsed");
    localStorage.setItem(
      STORAGE.collapsed,
      widget.classList.contains("collapsed")
    );
  }

  collapseTop.onclick = toggleCollapse;
  collapseMid.onclick = toggleCollapse;

  if(localStorage.getItem(STORAGE.collapsed) === "true"){
    widget.classList.add("collapsed");
  }

  /* ================= POSITION ================= */
  let pos = { x: 0, y: 64 };
  const saved = safeParse(localStorage.getItem(STORAGE.pos), null);
  if(saved){ pos = saved; }

  function applyPos(){
    widget.style.transform =
      `translate3d(${pos.x}px, ${pos.y}px, 0)`;
  }

  applyPos();

  function savePos(){
    localStorage.setItem(STORAGE.pos, JSON.stringify(pos));
  }

  /* ================= DRAG ================= */
  const moveTop = widget.querySelector("#ppMoveTop");
  const moveMid = widget.querySelector("#ppMoveMid");

  let dragging = false, sx = 0, sy = 0, bx = 0, by = 0;

  function startDrag(x,y){
    dragging = true;
    sx = x; sy = y;
    bx = pos.x; by = pos.y;
    document.documentElement.style.userSelect = "none";
  }

  function dragTo(x,y){
    if(!dragging) return;
    pos.x = bx + (x - sx);
    pos.y = by + (y - sy);

    const maxX = window.innerWidth - widget.offsetWidth - 20;
    const maxY = window.innerHeight - widget.offsetHeight - 20;

    pos.x = clamp(pos.x, -10, maxX);
    pos.y = clamp(pos.y, -10, maxY);

    applyPos();
  }

  function endDrag(){
    if(!dragging) return;
    dragging = false;
    document.documentElement.style.userSelect = "";
    savePos();
  }

  moveTop.onmousedown = e => { e.preventDefault(); startDrag(e.clientX,e.clientY); };
  moveMid.onmousedown = e => { e.preventDefault(); startDrag(e.clientX,e.clientY); };

  document.addEventListener("mousemove", e => dragTo(e.clientX,e.clientY));
  document.addEventListener("mouseup", endDrag);

  [moveTop,moveMid].forEach(btn=>{
    btn.addEventListener("touchstart",e=>{
      const t=e.touches[0];
      startDrag(t.clientX,t.clientY);
    },{passive:true});

    btn.addEventListener("touchmove",e=>{
      if(!dragging) return;
      e.preventDefault();
      const t=e.touches[0];
      dragTo(t.clientX,t.clientY);
    },{passive:false});

    btn.addEventListener("touchend",endDrag);
  });

})();