const grid = document.getElementById("grid");
const scoreDisplay = document.getElementById("score");
const streakDisplay = document.getElementById("streak");
const width = 8;
const candyColors = ["red", "blue", "green", "yellow", "purple"];
let score = 0;
let longestStreak = 0;
let currentStreak = 0;

let candies = [];
let swipeStartX, swipeStartY, swipeEndX, swipeEndY;
let candyBeingSwiped, squareIdBeingSwiped, direction;

// Sound effects and background music
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

    // Attach swipe events
    candy.addEventListener("touchstart", swipeStart);
    candy.addEventListener("touchend", swipeEnd);

    grid.appendChild(candy);
    candies.push(candy);
  }
}

// Start tracking swipe position
function swipeStart(e) {
  swipeStartX = e.touches[0].clientX;
  swipeStartY = e.touches[0].clientY;
  squareIdBeingSwiped = parseInt(e.target.id);
}

// Calculate swipe direction on touch end
function swipeEnd(e) {
  swipeEndX = e.changedTouches[0].clientX;
  swipeEndY = e.changedTouches[0].clientY;
  determineSwipeDirection();
  moveCandy();
}

// Determine swipe direction
function determineSwipeDirection() {
  const deltaX = swipeEndX - swipeStartX;
  const deltaY = swipeEndY - swipeStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    direction = deltaX > 0 ? "right" : "left";
  } else {
    direction = deltaY > 0 ? "down" : "up";
  }
}

// Move candy based on swipe direction
function moveCandy() {
  let targetId;
  switch (direction) {
    case "right":
      targetId = squareIdBeingSwiped + 1;
      break;
    case "left":
      targetId = squareIdBeingSwiped - 1;
      break;
    case "down":
      targetId = squareIdBeingSwiped + width;
      break;
    case "up":
      targetId = squareIdBeingSwiped - width;
      break;
  }

  // Check for valid moves and swap candies if valid
  if (isValidMove(targetId)) {
    candies[squareIdBeingSwiped].className = candies[targetId].className;
    candies[targetId].className = candyBeingSwiped;
    checkForMatches();
  }
}

// Validate move within grid bounds
function isValidMove(targetId) {
  if (targetId < 0 || targetId >= width * width) return false;

  const isAdjacent = Math.abs(targetId - squareIdBeingSwiped) === 1 || Math.abs(targetId - squareIdBeingSwiped) === width;
  return isAdjacent;
}

// Check for matches in the grid
function checkForMatches() {
  let matchesFound = false;

  // Check rows and columns for matches, similar to before
  for (let i = 0; i < width * width; i++) {
    // Check rows
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

  // Check columns
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

// Replace matched candies
function replaceMatches() {
  for (let i = 0; i < width * width; i++) {
    if (candies[i].classList.contains("matched")) {
      candies[i].classList.remove("matched");
      candies[i].className = "candy " + candyColors[Math.floor(Math.random() * candyColors.length)];
    }
  }
  checkForMatches();
}

// Update score and longest streak
function updateScoreAndStreak() {
  currentStreak++;
  longestStreak = Math.max(longestStreak, currentStreak);
  scoreDisplay.textContent = score;
  streakDisplay.textContent = longestStreak;

  if (score % 50 === 0) triggerCelebration();
}

// Trigger celebration effect
function triggerCelebration() {
  for (let i = 0; i < 30; i++) {
    setTimeout(createFirework, i * 100);
  }
}

// Create a firework for celebration
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
