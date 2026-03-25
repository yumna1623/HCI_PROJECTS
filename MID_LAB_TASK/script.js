const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const modeText = document.getElementById("mode");
const colorContainer = document.getElementById("color-palette");

let polylines = [];
let currentPolyline = null;
let mode = "none";
let dragging = false;
let selectedPoint = null;
let selectedShape = null;
let offset = {x:0, y:0};
let undoStack = [];
let redoStack = [];
let currentColor = "cyan";
let currentThickness = 2;
const MAX_POLYLINES = 200;

// COLORS 1x16
const colors = ["cyan","red","yellow","green","blue","magenta","orange","white","pink","lime","purple","teal","brown","gray","gold","silver"];
colors.forEach(color=>{
  const btn = document.createElement("div");
  btn.className = "palette-button";
  btn.style.backgroundColor = color;
  btn.onclick = () => { currentColor = color; updateSelection(); };
  colorContainer.appendChild(btn);
});
function updateSelection(){
  document.querySelectorAll("#color-palette .palette-button").forEach(btn=>{
    btn.classList.toggle("selected", btn.style.backgroundColor===currentColor);
  });
}
updateSelection();

// SAVE STATE
function saveState(){ undoStack.push(JSON.stringify(polylines)); redoStack=[]; }

// DRAW
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  polylines.forEach(poly=>{
    ctx.beginPath();
    poly.forEach((p,i)=> i===0? ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
    ctx.strokeStyle = poly.color || "cyan";
    ctx.lineWidth = poly.thickness || 2;
    ctx.stroke();
    poly.forEach(p=>{
      ctx.beginPath();
      ctx.arc(p.x,p.y,5,0,Math.PI*2);
      ctx.fillStyle="white";
      ctx.fill();
    });
  });
}

// NEAREST POINT
function getNearestPoint(x,y){
  let minDist=Infinity,result=null;
  polylines.forEach((poly,pi)=>{
    poly.forEach((p,i)=>{
      const dist=Math.hypot(p.x-x,p.y-y);
      if(dist<minDist){ minDist=dist; result={pi,i}; }
    });
  });
  return result;
}

// NEAREST SHAPE
function getNearestShape(x,y){
  for(let pi=0; pi<polylines.length; pi++){
    const poly = polylines[pi];
    for(let p of poly){
      if(Math.hypot(p.x-x,p.y-y)<=6) return {pi, poly};
    }
  }
  return null;
}

// DISTANCE TO SEGMENT (for INSERT)
function pointToLineDistance(px,py,x1,y1,x2,y2){
  const A=px-x1,B=py-y1,C=x2-x1,D=y2-y1;
  const dot=A*C+B*D;
  const lenSq=C*C+D*D;
  let param = dot/lenSq;
  if(param<0) param=0; else if(param>1) param=1;
  const xx=x1+param*C, yy=y1+param*D;
  return {dist:Math.hypot(px-xx,py-yy), proj:{x:xx,y:yy}};
}

// INSERT POINT
function insertPoint(x,y){
  let best=null;
  let minDist=10;
  polylines.forEach((poly,pi)=>{
    for(let i=0;i<poly.length-1;i++){
      const p1=poly[i], p2=poly[i+1];
      const res=pointToLineDistance(x,y,p1.x,p1.y,p2.x,p2.y);
      if(res.dist<minDist){
        minDist=res.dist;
        best={pi,index:i+1,pos:{x:x,y:y}};
      }
    }
  });
  if(best){ saveState(); polylines[best.pi].splice(best.index,0,best.pos); draw(); }
}
function refreshCanvas(){
    // finalize current polyline if it exists
    if(currentPolyline && currentPolyline.length>0){
        // Already in polylines array, no need to push again
        currentPolyline = null;  // stop drawing
    }
    draw(); // redraw everything
    alert("Canvas refreshed!");
}

// MOUSE EVENTS
canvas.addEventListener("mousedown",(e)=>{
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if(mode==="begin"){
    if(polylines.length>=MAX_POLYLINES){ alert("Max 200 polylines reached"); return; }
    saveState();
    if(!currentPolyline){
      currentPolyline = [];
      currentPolyline.color = currentColor;
      currentPolyline.thickness = currentThickness;
      polylines.push(currentPolyline);
    }
    currentPolyline.push({x,y});
    draw();
  }
  else if(mode==="delete"){
    const nearest = getNearestPoint(x,y);
    if(nearest){
      saveState();
      polylines[nearest.pi].splice(nearest.i,1);
      draw();
    }
  }
  else if(mode==="move"){
    selectedPoint = getNearestPoint(x,y);
    if(selectedPoint){ saveState(); dragging=true; }
  }
  else if(mode==="moveShape"){
    const shape = getNearestShape(x,y);
    if(shape){ saveState(); dragging=true; selectedShape=shape; offset={x:x,y:y}; }
  }
  else if(mode==="insert"){
    insertPoint(x,y);
  }
  
});

canvas.addEventListener("mousemove",(e)=>{
  if(!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if(mode==="move" && selectedPoint){
    const {pi,i} = selectedPoint;
    polylines[pi][i] = {x,y};
    draw();
  }
  else if(mode==="moveShape" && selectedShape){
    const dx = x - offset.x;
    const dy = y - offset.y;
    selectedShape.poly.forEach(p=>{p.x+=dx; p.y+=dy;});
    offset={x:x,y:y};
    draw();
  }
});

canvas.addEventListener("mouseup",()=>{
  dragging=false;
  selectedPoint=null;
  selectedShape=null;
});

// UNDO / REDO / CLEAR / SAVE / LOAD
function undo(){ if(undoStack.length){ redoStack.push(JSON.stringify(polylines)); polylines=JSON.parse(undoStack.pop()); draw(); } }
function redo(){ if(redoStack.length){ undoStack.push(JSON.stringify(polylines)); polylines=JSON.parse(redoStack.pop()); draw(); } }
function clearCanvas(){ saveState(); polylines=[]; draw(); }
function saveData(){ localStorage.setItem("polylines",JSON.stringify(polylines)); alert("Saved!"); }
function loadData(){ const data=localStorage.getItem("polylines"); if(data){ polylines=JSON.parse(data); draw(); } }

// MODE SETTER
function setMode(m){ mode=m; modeText.textContent=m; currentPolyline=null; }

// KEYBOARD SHORTCUTS
window.addEventListener("keydown",(e)=>{
  const key = e.key.toLowerCase();
  if(key==="b") setMode("begin");
  else if(key==="d") setMode("delete");
  else if(key==="m") setMode("move");
  else if(key==="f") { // F for refresh
      refreshCanvas();
  }
  else if(key==="q"){ alert("Exiting editor"); window.close(); }
});

draw();