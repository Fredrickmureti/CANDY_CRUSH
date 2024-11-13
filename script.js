const grid = document.getElementById("grid");
const scoreDisplay = document.getElementById("score");
const streakDisplay = document.getElementById("streak");
const background_audio = '/audio/Me_Gustas.mp3';
const width = 8;
const candyColors = ["red", "blue", "green", "yellow", "purple"];
let score = 0;
let longestStreak = 0;
let currentStreak = 0;

let candies = [];
let isSwipeInProgress = false;
let swipeStartX, swipeStartY, swipeEndX, swipeEndY, direction;
let squareIdBeingSwiped;

// Sound effects and background music
const matchSound = new Audio('match-sound.mp3');
const backgroundMusic = new Audio(background_audio);
backgroundMusic.loop = true;
backgroundMusic.play();

// Create the board
function createBoard() {
  for (let i = 0; i < width * width; i++) {
    const candy = document.createElement("div");
    candy.classList.add("candy", candyColors[Math.floor(Math.random() * candyColors.length)]);
    candy.setAttribute("id", i);

    candy.addEventListener("touchstart", swipeStart);
    candy.addEventListener("touchend", swipeEnd);

    grid.appendChild(candy);
    candies.push(candy);
  }
}

// Start swipe tracking
function swipeStart(e) {
  if (isSwipeInProgress) return; // Ignore if a swipe is already in progress
  swipeStartX = e.touches[0].clientX;
  swipeStartY = e.touches[0].clientY;
  squareIdBeingSwiped = parseInt(e.target.id);
}

// End swipe tracking
function swipeEnd(e) {
  swipeEndX = e.changedTouches[0].clientX;
  swipeEndY = e.changedTouches[0].clientY;
  isSwipeInProgress = false;

  const deltaX = swipeEndX - swipeStartX;
  const deltaY = swipeEndY - swipeStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    direction = deltaX > 0 ? "right" : "left";
  } else {
    direction = deltaY > 0 ? "down" : "up";
  }

  moveCandy(direction);
}

// Move candy based on swipe direction
function moveCandy(direction) {
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

  // Only swap if it's a valid move
  if (isValidMove(targetId)) {
    const colorBeingSwiped = candies[squareIdBeingSwiped].className;
    const colorBeingReplaced = candies[targetId].className;

    candies[squareIdBeingSwiped].className = colorBeingReplaced;
    candies[targetId].className = colorBeingSwiped;
    isSwipeInProgress = true;
    checkForMatches();
  }
}

// Validate move within grid bounds
function isValidMove(targetId) {
  if (targetId < 0 || targetId >= width * width) return false;
  const isAdjacent = Math.abs(targetId - squareIdBeingSwiped) === 1 || Math.abs(targetId - squareIdBeingSwiped) === width;
  return isAdjacent;
}

// Check for matches (3 or more in a row/column)
function checkForMatches() {
  let matchesFound = false;

  // Check rows for matches
  for (let i = 0; i < width * width; i++) {
    if (i % width > 5) continue;
    const row = [i, i + 1, i + 2];
    const color = candies[i].className;
    if (row.every(index => candies[index].className === color)) {
      row.forEach(index => candies[index].classList.add("matched"));
      score += 3;
      matchesFound = true;
      matchSound.play();
    }
  }

  // Check columns for matches
  for (let i = 0; i < width * (width - 2); i++) {
    const column = [i, i + width, i + width * 2];
    const color = candies[i].className;
    if (column.every(index => candies[index].className === color)) {
      column.forEach(index => candies[index].classList.add("matched"));
      score += 3;
      matchesFound = true;
      matchSound.play();
    }
  }

  if (matchesFound) {
    currentStreak++;
    updateScoreAndStreak();
    setTimeout(replaceMatches, 500); // Replace matches after a small delay
  } else {
    // No matches, reset the swipe action
    isSwipeInProgress = false;
  }
}

// Replace matched candies and apply gravity
function replaceMatches() {
  // Remove matched candies
  for (let i = 0; i < width * width; i++) {
    if (candies[i].classList.contains("matched")) {
      candies[i].classList.remove("matched");
      candies[i].className = "candy " + candyColors[Math.floor(Math.random() * candyColors.length)];
    }
  }

  // Apply gravity: Let candies fall to fill empty spaces
  applyGravity();

  // Recheck for new matches after gravity
  setTimeout(checkForMatches, 500);
}

// Apply gravity: candies should fall to fill empty spaces
function applyGravity() {
  for (let i = width * width - width - 1; i >= 0; i--) {
    if (candies[i].classList.contains("candy")) {
      let currentCandy = i;
      let emptySpace = currentCandy;

      while (currentCandy < width * width && candies[currentCandy + width] && !candies[currentCandy + width].classList.contains("matched")) {
        emptySpace = currentCandy + width;
        currentCandy = emptySpace;
      }

      if (currentCandy !== emptySpace) {
        candies[emptySpace].className = candies[currentCandy].className;
        candies[currentCandy].className = "candy " + candyColors[Math.floor(Math.random() * candyColors.length)];
      }
    }
  }
}

// Update score and streak
function updateScoreAndStreak() {
  scoreDisplay.textContent = score;
  streakDisplay.textContent = currentStreak;

  // Trigger celebration at streak 20
  if (currentStreak % 20 === 0 && currentStreak !== 0) {
    triggerCelebration();
  }

  // Update longest streak if necessary
  longestStreak = Math.max(longestStreak, currentStreak);
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
