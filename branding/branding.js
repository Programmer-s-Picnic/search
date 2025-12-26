/* ==========================================================
   branding.js — Programmer’s Picnic Daily Widget v2.1
   FIX: Full content visibility + internal scrolling
   Author: Champak Roy
   ========================================================== */

(function () {
  "use strict";

  const WIDGET_ID = "pp-daily-widget";
  const STORAGE_COLLAPSE = "ppWidgetCollapsed";
  const STORAGE_POS = "ppWidgetPos";

  /* ================= CSS ================= */
  const style = document.createElement("style");
  style.textContent = `
  #${WIDGET_ID}{
    position:fixed;
    top:80px;
    right:16px;
    width:340px;
    max-height:90vh;
    display:flex;
    flex-direction:column;
    background:linear-gradient(145deg,#fffdf6,#fff2d6);
    border-radius:18px;
    box-shadow:0 12px 30px rgba(0,0,0,.12);
    z-index:999999;
    font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
  }

  /* collapsed */
  #${WIDGET_ID}.collapsed{
    height:52px;
    overflow:hidden;
  }

  /* header */
  .pp-header{
    flex-shrink:0;
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:12px 14px;
    background:linear-gradient(135deg,#ffe8b0,#ffd36a);
    border-radius:18px 18px 0 0;
    font-weight:600;
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

  /* content scroll area */
  .pp-content{
    flex:1;
    overflow-y:auto;
    -webkit-overflow-scrolling:touch;
    padding:14px;
    color:#1f2937;
    line-height:1.6;
  }

  /* mobile mid controls */
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
      right:4vw;
      max-height:85vh;
    }
    .pp-mobile-controls{
      display:flex;
    }
  }

  /* glow */
  #${WIDGET_ID}.glow{
    animation:ppGlow 1.4s ease-out;
  }

  @keyframes ppGlow{
    0%{box-shadow:0 0 0 0 rgba(249,115,22,.6)}
    100%{box-shadow:0 0 0 18px rgba(249,115,22,0)}
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
      Small daily practice compounds into mastery.</p>

      <div class="pp-mobile-controls">
        <button id="ppCollapseMid">⬇ Collapse</button>
        <button id="ppMoveMid">☰ Move</button>
      </div>

      <p><strong>Daily Puzzle</strong></p>
      <pre style="background:#fff7df;padding:10px;border-radius:12px">
nums = [1,2,3]
print(nums[::-1])
      </pre>

      <p><strong>Learn More</strong><br>
        <a href="https://learnwithchampak.live" target="_blank">
          learnwithchampak.live
        </a>
      </p>

      <p style="margin-top:600px">
        (Extra space test — scrolling should still work)
      </p>
    </div>
  `;
  document.body.appendChild(widget);

  /* ================= COLLAPSE ================= */
  const collapseTop = widget.querySelector("#ppCollapseTop");
  const collapseMid = widget.querySelector("#ppCollapseMid");

  function toggleCollapse(){
    widget.classList.toggle("collapsed");
    localStorage.setItem(
      STORAGE_COLLAPSE,
      widget.classList.contains("collapsed")
    );
  }

  collapseTop.onclick = toggleCollapse;
  collapseMid.onclick = toggleCollapse;

  if(localStorage.getItem(STORAGE_COLLAPSE) === "true"){
    widget.classList.add("collapsed");
  }

  /* ================= DRAG ================= */
  const moveTop = widget.querySelector("#ppMoveTop");
  const moveMid = widget.querySelector("#ppMoveMid");

  let dragging = false, startX = 0, startY = 0;

  function startDrag(x,y){
    dragging = true;
    startX = x - widget.offsetLeft;
    startY = y - widget.offsetTop;
    widget.classList.add("glow");
  }

  function moveDrag(x,y){
    if(!dragging) return;
    widget.style.left = (x - startX) + "px";
    widget.style.top  = (y - startY) + "px";
    widget.style.right = "auto";
  }

  function endDrag(){
    if(dragging){
      localStorage.setItem(
        STORAGE_POS,
        JSON.stringify({
          left: widget.style.left,
          top: widget.style.top
        })
      );
    }
    dragging = false;
  }

  /* mouse */
  moveTop.onmousedown = e => startDrag(e.clientX,e.clientY);
  moveMid.onmousedown = e => startDrag(e.clientX,e.clientY);
  document.addEventListener("mousemove", e => moveDrag(e.clientX,e.clientY));
  document.addEventListener("mouseup", endDrag);

  /* touch */
  [moveTop,moveMid].forEach(btn=>{
    btn.addEventListener("touchstart",e=>{
      const t=e.touches[0];
      startDrag(t.clientX,t.clientY);
    },{passive:true});
  });

  document.addEventListener("touchmove",e=>{
    if(!dragging) return;
    const t=e.touches[0];
    moveDrag(t.clientX,t.clientY);
  },{passive:true});

  document.addEventListener("touchend",endDrag);

  /* restore position */
  const savedPos = localStorage.getItem(STORAGE_POS);
  if(savedPos){
    const p = JSON.parse(savedPos);
    widget.style.left = p.left;
    widget.style.top  = p.top;
    widget.style.right = "auto";
  }

})();