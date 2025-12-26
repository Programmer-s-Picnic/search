/* ==========================================================
   branding.js — Programmer’s Picnic Daily Widget v2.2
   FIXED: reliable expand + scroll + mobile drag
   Author: Champak Roy
   ========================================================== */

(function () {
  "use strict";

  const WIDGET_ID = "pp-daily-widget";
  const STORAGE = {
    collapsed: "ppWidgetCollapsed",
    pos: "ppWidgetPosV2" // new key to avoid old-broken positions
  };

  // ---------- Helpers ----------
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function safeParse(json, fallback) {
    try { return JSON.parse(json); } catch { return fallback; }
  }

  // ---------- CSS ----------
  const style = document.createElement("style");
  style.textContent = `
#${WIDGET_ID}{
  position:fixed;
  top:16px;
  left:16px; /* we will move it via transform */
  transform: translate3d(0px, 64px, 0);
  width:340px;
  max-height:90vh;
  display:flex;
  flex-direction:column;
  background:linear-gradient(145deg,#fffdf6,#fff2d6);
  border-radius:18px;
  box-shadow:0 12px 30px rgba(0,0,0,.12);
  z-index:999999;
  font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
  overflow:hidden;
}

#${WIDGET_ID}.collapsed{
  max-height:none;
  height:52px;
}

.pp-header{
  flex:0 0 auto;
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:12px 14px;
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

.pp-content{
  flex:1 1 auto;
  overflow:auto;
  -webkit-overflow-scrolling:touch;
  padding:14px;
  color:#1f2937;
  line-height:1.6;
}

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

.pp-link{
  color:#92400e;
  font-weight:700;
  text-decoration:none;
}
.pp-link:hover{ text-decoration:underline; }

@media(max-width:768px){
  #${WIDGET_ID}{
    width:92vw;
    max-height:85vh;
  }
  .pp-mobile-controls{
    display:flex;
  }
}
  `;
  document.head.appendChild(style);

  // ---------- HTML ----------
  const widget = document.createElement("div");
  widget.id = WIDGET_ID;
  widget.innerHTML = `
  <div class="pp-header">
    <span>🌼 Today at Programmer’s Picnic</span>
    <div class="pp-actions">
      <button class="pp-btn" id="ppCollapseTop" title="Collapse/Expand">⬇</button>
      <button class="pp-btn" id="ppMoveTop" title="Move">☰</button>
    </div>
  </div>

  <div class="pp-content" id="ppContent">
    <p><strong>Daily Tip</strong><br>
    Practice 10 minutes daily. Consistency wins.</p>

    <div class="pp-mobile-controls">
      <button id="ppCollapseMid" title="Collapse/Expand">⬇ Collapse</button>
      <button id="ppMoveMid" title="Move">☰ Move</button>
    </div>

    <p><strong>Daily Puzzle</strong></p>
    <pre style="background:#fff7df;padding:10px;border-radius:12px;white-space:pre-wrap;margin:0 0 12px 0;">
x = [1,2,3]
print(x[::-1])
    </pre>

    <p><strong>Learn More</strong><br>
      <a class="pp-link" href="https://learnwithchampak.live" target="_blank" rel="noopener">
        learnwithchampak.live
      </a>
    </p>
  </div>
  `;
  document.body.appendChild(widget);

  const collapseTop = widget.querySelector("#ppCollapseTop");
  const collapseMid = widget.querySelector("#ppCollapseMid");
  const moveTop = widget.querySelector("#ppMoveTop");
  const moveMid = widget.querySelector("#ppMoveMid");

  // ---------- Collapse ----------
  function applyCollapsedState(isCollapsed) {
    widget.classList.toggle("collapsed", !!isCollapsed);
  }

  function toggleCollapse() {
    const next = !widget.classList.contains("collapsed");
    applyCollapsedState(next);
    localStorage.setItem(STORAGE.collapsed, String(next));
  }

  collapseTop.addEventListener("click", toggleCollapse);
  collapseMid.addEventListener("click", toggleCollapse);

  applyCollapsedState(localStorage.getItem(STORAGE.collapsed) === "true");

  // ---------- Position via transform ----------
  // We store x,y translation values (px)
  let pos = { x: 0, y: 64 };

  const saved = safeParse(localStorage.getItem(STORAGE.pos), null);
  if (saved && typeof saved.x === "number" && typeof saved.y === "number") {
    pos.x = saved.x;
    pos.y = saved.y;
  }

  function setTransform(x, y) {
    pos.x = x;
    pos.y = y;
    widget.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  // Keep widget on-screen
  function clampToViewport(x, y) {
    const rect = widget.getBoundingClientRect();
    // rect is current; but we want limits based on size
    const w = rect.width;
    const h = rect.height;
    const margin = 8;

    const maxX = window.innerWidth - w - margin - 16; // considering left:16px base
    const maxY = window.innerHeight - h - margin - 16;

    return {
      x: clamp(x, -8, maxX),
      y: clamp(y, -8, maxY)
    };
  }

  function persistPos() {
    localStorage.setItem(STORAGE.pos, JSON.stringify({ x: pos.x, y: pos.y }));
  }

  // Initial transform apply
  setTransform(pos.x, pos.y);

  // Re-clamp on resize/orientation
  window.addEventListener("resize", () => {
    const c = clampToViewport(pos.x, pos.y);
    setTransform(c.x, c.y);
    persistPos();
  });

  // ---------- Drag only from move buttons ----------
  let dragging = false;
  let startClientX = 0, startClientY = 0;
  let startX = 0, startY = 0;

  function startDrag(clientX, clientY) {
    dragging = true;
    startClientX = clientX;
    startClientY = clientY;
    startX = pos.x;
    startY = pos.y;
    // avoid text selection while dragging
    document.documentElement.style.userSelect = "none";
  }

  function dragTo(clientX, clientY) {
    if (!dragging) return;
    const dx = clientX - startClientX;
    const dy = clientY - startClientY;
    const next = clampToViewport(startX + dx, startY + dy);
    setTransform(next.x, next.y);
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    document.documentElement.style.userSelect = "";
    persistPos();
  }

  // Desktop mouse drag
  function wireMouse(btn) {
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
    });
  }
  wireMouse(moveTop);
  wireMouse(moveMid);

  document.addEventListener("mousemove", (e) => dragTo(e.clientX, e.clientY));
  document.addEventListener("mouseup", endDrag);

  // Mobile touch drag (IMPORTANT: passive:false so preventDefault works)
  function wireTouch(btn) {
    btn.addEventListener("touchstart", (e) => {
      const t = e.touches[0];
      startDrag(t.clientX, t.clientY);
    }, { passive: true });

    btn.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      e.preventDefault(); // stop page scroll while dragging
      const t = e.touches[0];
      dragTo(t.clientX, t.clientY);
    }, { passive: false });

    btn.addEventListener("touchend", endDrag, { passive: true });
    btn.addEventListener("touchcancel", endDrag, { passive: true });
  }
  wireTouch(moveTop);
  wireTouch(moveMid);

})();