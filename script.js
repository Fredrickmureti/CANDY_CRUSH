const grid = document.getElementById("grid");
const scoreDisplay = document.getElementById("score");
const streakDisplay = document.getElementById("streak");
const width = 8;
const candyColors = ["red", "blue", "green", "yellow", "purple"];
let score = 0;
let longestStreak = 0;
let currentStreak = 0;

let candies = [];
let colorBeingDragged, colorBeingReplaced, squareIdBeingDragged, squareIdBeingReplaced;

const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
const dragStartEvent = isTouchDevice ? "touchstart" : "dragstart";
const dragEndEvent = isTouchDevice ? "touchend" : "dragend";

const matchSound = new Audio('match-sound.mp3');
const backgroundMusic = new Audio('background-music.mp3');
backgroundMusic.loop = true;
backgroundMusic.play();

// Create the board
function createBoard() {
  for (let i = 0; i < width * width; i++) {
    const candy = document.createElement("div");
    candy.classList.add("candy", candyColors[Math.floor(Math.random() * candyColors.length)]);
    candy.setAttribute("id", i);

    // Attach drag/touch events for mobile or desktop
    candy.addEventListener(dragStartEvent, dragStart);
    candy.addEventListener(dragEndEvent, dragEnd);
    candy.addEventListener("touchmove", dragOver);
    
    grid.appendChild(candy);
    candies.push(candy);
  }
}

function dragStart(e) {
  colorBeingDragged = this.className;
  squareIdBeingDragged = parseInt(this.id);
}

function dragOver(e) {
  e.preventDefault();
  if (isTouchDevice) {
    let touchLocation = e.targetTouches[0];
    let element = document.elementFromPoint(touchLocation.clientX, touchLocation.clientY);
    if (element && element.classList.contains("candy")) {
      colorBeingReplaced = element.className;
      squareIdBeingReplaced = parseInt(element.id);
    }
  }
}

function dragEnd() {
  const validMoves = [squareIdBeingDragged - 1, squareIdBeingDragged + 1, squareIdBeingDragged - width, squareIdBeingDragged + width];
  if (squareIdBeingReplaced && validMoves.includes(squareIdBeingReplaced)) {
    candies[squareIdBeingDragged].className = colorBeingReplaced;
    candies[squareIdBeingReplaced].className = colorBeingDragged;
    checkForMatches();
  } else {
    candies[squareIdBeingDragged].className = colorBeingDragged;
    candies[squareIdBeingReplaced].className = colorBeingReplaced;
  }
  squareIdBeingReplaced = null;
}

function checkForMatches() {
  let matchesFound = false;

  for (let i = 0; i < width * width; i++) {
    if (i % width > 5) continue;
    let row = [i, i + 1, i + 2];
    let color = candies[i].className;
    if (row.every(index => candies[index].className === color)) {
      row.forEach(index => candies[index].className = "matched");
      score += 3;
      matchesFound = true;
      matchSound.play();
      updateScoreAndStreak();
    }
  }

  for (let i = 0; i < width * (width - 2); i++) {
    let column = [i, i + width, i + width * 2];
    let color = candies[i].className;
    if (column.every(index => candies[index].className === color)) {
      column.forEach(index => candies[index].className = "matched");
      score += 3;
      matchesFound = true;
      matchSound.play();
      updateScoreAndStreak();
    }
  }
  if (matchesFound) setTimeout(replaceMatches, 500);
}

function replaceMatches() {
  for (let i = 0; i < width * width; i++) {
    if (candies[i].classList.contains("matched")) {
      candies[i].classList.remove("matched");
      candies[i].className = "candy " + candyColors[Math.floor(Math.random() * candyColors.length)];
    }
  }
  checkForMatches();
}

function updateScoreAndStreak() {
  currentStreak++;
  longestStreak = Math.max(longestStreak, currentStreak);
  scoreDisplay.textContent = score;
  streakDisplay.textContent = longestStreak;

  if (score % 50 === 0) triggerCelebration();
}

function triggerCelebration() {
  for (let i = 0; i < 30; i++) {
    setTimeout(createFirework, i * 100);
  }
}

function createFirework() {
  const firework = document.createElement("div");
  firework.classList.add("firework");
  firework.style.left = `${Math.random() * window.innerWidth}px`;
  firework.style.top = `${Math.random() * window.innerHeight}px`;
  firework.style.backgroundColor = candyColors[Math.floor(Math.random() * candyColors.length)];
  document.body.appendChild(firework);
  setTimeout(() => firework.remove(), 1000);
}

createBoard();
