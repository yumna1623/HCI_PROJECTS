let stimulusEl = document.getElementById("stimulus");
let startBtn = document.getElementById("startBtn");
let trialsEl = document.getElementById("trials");
let correctEl = document.getElementById("correct");
let avgEl = document.getElementById("avgRT");

let stimulus = "";
let expectedKey = "";
let startTime = null;
let trials = 0;
let correct = 0;
let sumRT = 0;
const maxTrials = 10;

function generateStimulus() {
  const isLetter = Math.random() < 0.5;
  if (isLetter) {
    const letters = ["B", "K", "M", "T"];
    stimulus = letters[Math.floor(Math.random() * letters.length)];
    expectedKey = "A";
  } else {
    const digits = ["2", "5", "7", "9"];
    stimulus = digits[Math.floor(Math.random() * digits.length)];
    expectedKey = "L";
  }
  stimulusEl.textContent = stimulus;
  startTime = Date.now();
}

function updateStats() {
  trialsEl.textContent = `${trials} / ${maxTrials}`;
  correctEl.textContent = correct;
  let avgRT = trials > 0 ? (sumRT / trials).toFixed(2) : 0;
  avgEl.textContent = `${avgRT} ms`;
}

function handleKeyPress(event) {
  if (trials >= maxTrials || !stimulus) return;

  const pressedKey = event.key.toUpperCase();
  const reactionTime = Date.now() - startTime;

  trials++;
  sumRT += reactionTime;

  if (pressedKey === expectedKey) correct++;

  if (trials < maxTrials) {
    generateStimulus();
  } else {
    stimulusEl.textContent = "Experiment Finished";
    stimulusEl.style.fontSize = "3rem";
  }

  updateStats();
}

function startExperiment() {
  trials = 0;
  correct = 0;
  sumRT = 0;
  stimulusEl.style.fontSize = "6rem";
  generateStimulus();
  updateStats();
}

startBtn.addEventListener("click", startExperiment);
window.addEventListener("keydown", handleKeyPress);