let selectedShape = '';
let score = 0;
let lives = 3;
let timeLeft = 15;
let correct = 0;
let wrong = 0;

let box = document.getElementById("box");
let gameArea = document.getElementById("gameArea");

let boxX = 150;
let gameInterval, timerInterval;

function startGame(shape) {
  selectedShape = shape;
  score = 0; lives = 3; timeLeft = 15;
  correct = 0; wrong = 0;

  updateStats();
  document.getElementById("time").innerText = timeLeft;
  document.getElementById("progressBar").style.width = "100%";

  clearInterval(gameInterval);
  clearInterval(timerInterval);

  gameInterval = setInterval(createShape, 700);

  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("time").innerText = timeLeft;

    let percent = (timeLeft / 15) * 100;
    document.getElementById("progressBar").style.width = percent + "%";

    if (timeLeft <= 0) endGame();
  }, 1000);
}

/* Move Basket */
document.addEventListener("mousemove", e => {
  let rect = gameArea.getBoundingClientRect();
  boxX = e.clientX - rect.left - 45;
  if (boxX < 0) boxX = 0;
  if (boxX > 310) boxX = 310;
  box.style.left = boxX + "px";
});

/* Create Shapes */
function createShape() {
  if (lives <= 0 || timeLeft <= 0) return;
  let shapes = ['🔺','🔵','⭐'];
  let randomShape = shapes[Math.floor(Math.random()*shapes.length)];

  let el = document.createElement("div");
  el.className = "shape"; el.innerText = randomShape;

  let x = Math.random() * 360;
  el.style.left = x + "px"; el.style.top = "0px";

  gameArea.appendChild(el);

  let fall = setInterval(() => {
    let top = parseInt(el.style.top);
    el.style.top = top + 6 + "px";

    if (top > 430 && x > boxX && x < boxX + 90) {
      if (randomShape === selectedShape) { score++; correct++; flash("correct"); }
      else { lives--; wrong++; flash("wrong"); }

      updateStats(); el.remove(); clearInterval(fall);
    }

    if (top > 500) { el.remove(); clearInterval(fall); }
    if (lives <= 0) endGame();

  }, 30);
}

function updateStats() {
  document.getElementById("score").innerText = score;
  document.getElementById("lives").innerText = lives;
  document.getElementById("correct").innerText = correct;
  document.getElementById("wrong").innerText = wrong;
  let total = correct + wrong;
  let acc = total ? Math.round((correct/total)*100) : 0;
  document.getElementById("accuracy").innerText = acc + "%";
}

function flash(type) {
  box.classList.add(type);
  setTimeout(()=> box.classList.remove(type), 250);
}

// ... (rest of your existing script.js logic remains the same) ...

function endGame() {
  clearInterval(gameInterval); 
  clearInterval(timerInterval);

  let total = correct + wrong;
  let acc = total ? Math.round((correct/total)*100) : 0;

  // Updated to match new HTML IDs
  document.getElementById("finalScoreDisplay").innerText = score;
  
  let msg = acc >= 80 ? "🔥 Untouchable!" :
            acc >= 50 ? "👍 Solid Effort!" :
            "😅 Keep Practicing";

  document.getElementById("performance").innerText = `Accuracy: ${acc}% — ${msg}`;
  document.getElementById("resultScreen").style.display = "flex";
}