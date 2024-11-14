const grid = document.getElementById("grid");
const scoreDisplay = document.getElementById("score");
const streakDisplay = document.getElementById("streak");
const background_audio = '/music/Me_Gustas.mp3';
const width = 8;
const candyColors = ["red", "blue", "green", "yellow", "purple"];
let score = 0;
let longestStreak = 0;
let currentStreak = 0;
let lastMilestone = 0; // Keeps track of the last milestone (e.g., 20, 40, etc.)


let candies = [];
let isSwipeInProgress = false;
let swipeStartX, swipeStartY, swipeEndX, swipeEndY, direction;
let squareIdBeingSwiped;
const celebration_sound = new Audio('/music/applause.mp3');

window.addEventListener("DOMContentLoaded", () => {
  // Music Controls
  const playNextButton = document.getElementById("play-next-music");
  const toggleMusicButton = document.getElementById("toggle-music");
  const resetButton = document.getElementById("reset-button");

  // Event listener for play next music button
  playNextButton.addEventListener("click", playNextTrack);

  // Event listener for toggle music button
  toggleMusicButton.addEventListener("click", toggleMusic);

  // Event listener for reset game button
  resetButton.addEventListener("click", resetGame);
});


// Prevent default scrolling or other actions on touch within the game grid\
document.getElementById("grid").addEventListener("touchstart", (e) => {
  e.preventDefault();  // Prevent page scrolling
  e.stopPropagation(); // Prevent event bubbling to parent elements
}, { passive: false });


document.getElementById("grid").addEventListener("touchmove", (e) => {
  e.preventDefault();  // Prevent page scrolling or gesture actions
  e.stopPropagation(); // Prevent event bubbling to parent elements
}, { passive: false });

document.getElementById("grid").addEventListener("touchend", (e) => {
  e.preventDefault();  // Prevent page refresh or default action
  e.stopPropagation(); // Prevent event bubbling to parent elements
}, { passive: false });



function loadSavedData() {
  score = parseInt(localStorage.getItem('score')) || 0;
  currentStreak = parseInt(localStorage.getItem('currentStreak')) || 0;
  longestStreak = parseInt(localStorage.getItem('longestStreak')) || 0;

  // Update the displayed score and streaks
  scoreDisplay.textContent = score;
  streakDisplay.textContent = currentStreak;
}

// Call this function to load data when the game starts
loadSavedData();



// Sound effects and background music
const matchSound = new Audio('/music/game_bonus.mp3');
//const backgroundMusic = new Audio('/audio/Me_Gustas.mp3');
//backgroundMusic.loop = true;
//backgroundMusic.play();/
const backgroundMusic = new Audio();
const musicTracks = [
  '/music/Me_Gustas.mp3',
  '/music/wonki.mp3',
  '/music/Bronski_Beat.mp3'
];

let currentTrackIndex = 0;
let isMusicPlaying = true;

const musicControls = document.getElementById("music-controls");
const settingControls = document.getElementById("setting-controls")
const playNextButton = document.getElementById("play-next-music");
const toggleMusicButton = document.getElementById("toggle-music");
const musicToggle = document.getElementById("music-toggle");
const toggleButton = document.getElementById("toggle-button");


// Play the current track
function playMusic() {
  backgroundMusic.src = musicTracks[currentTrackIndex];
  backgroundMusic.loop = false;

  // Attempt to play the music and catch errors for auto-play restrictions
  backgroundMusic.play().catch((error) => {
    toggleMusicButton.textContent = "Play Music";
    isMusicPlaying = false; // Set flag to false if play was blocked
  });
}

playMusic();

// Change to the next track in the array
function playNextTrack() {
  currentTrackIndex = (currentTrackIndex + 1) % musicTracks.length;
  playMusic();
}


// Set up music controls and event listeners
function setupMusicControls() {
  // Automatically start playing music when the game opens
  playMusic();

  // When the music ends, play the next track
  backgroundMusic.addEventListener('ended', playNextTrack);

  // Play next track when button clicked
  playNextButton.addEventListener('click', playNextTrack);

  // Toggle music on/off when button clicked
  toggleMusicButton.addEventListener('click', toggleMusic);

  // Toggle visibility of music controls
  toggleButton.addEventListener('click', () => {
    musicControls.style.display = musicControls.style.display === "none" ? "flex" : "none";
  });
}

// Call the function to set up music controls when the game starts
setupMusicControls();
// Toggle music on/off
function toggleMusic() {
  if (isMusicPlaying) {
    backgroundMusic.pause();
    toggleMusicButton.textContent = "Play Music";
  } else {
    playMusic();
    toggleMusicButton.textContent = "Pause Music";
  }
  isMusicPlaying = !isMusicPlaying;
}

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
  e.preventDefault(); // Prevent any default behavior
  if (isSwipeInProgress) return;

  swipeStartX = e.touches[0].clientX;
  swipeStartY = e.touches[0].clientY;
  squareIdBeingSwiped = parseInt(e.target.id);
}

// End swipe tracking
function swipeEnd(e) {
  e.preventDefault(); // Prevent any default behavior (important for mobile)
  if (isSwipeInProgress) return;

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


// Prevent browser default behavior for touch events like swipe-to-refresh
document.addEventListener("touchstart", function (e) {
  e.preventDefault();
}, { passive: false });

document.addEventListener("touchmove", function (e) {
  e.preventDefault();
}, { passive: false });

// Touch event listeners
grid.addEventListener("touchstart", swipeStart);
grid.addEventListener("touchend", swipeEnd);

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
      targetId = squareIdBeingSwiped + width; // Moving down by width (next row)
      break;
    case "up":
      targetId = squareIdBeingSwiped - width; // Moving up by width (previous row)
      break;
  }

  // Only swap if it's a valid move
  if (isValidMove(targetId, direction)) {
    const colorBeingSwiped = candies[squareIdBeingSwiped].className;
    const colorBeingReplaced = candies[targetId].className;

    candies[squareIdBeingSwiped].className = colorBeingReplaced;
    candies[targetId].className = colorBeingSwiped;
    isSwipeInProgress = true;
    checkForMatches();
  }
}

// Validate move within grid bounds
function isValidMove(targetId, direction) {
  if (targetId < 0 || targetId >= width * width) return false; // Out of bounds

  // Ensure that the move is adjacent, check rows or columns
  const isAdjacent = Math.abs(targetId - squareIdBeingSwiped) === 1 || Math.abs(targetId - squareIdBeingSwiped) === width;
  if (direction === "down" && targetId >= width * (width - 1)) {
    // Prevent moving downward out of bounds
    return false;
  }

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

  // Trigger celebration only when reaching a new multiple of 20
  if (currentStreak % 20 === 0 && currentStreak > lastMilestone) {
    celebration_sound.play();
    triggerCelebration();
    lastMilestone = currentStreak; // Update the last milestone to the current streak
  }

  // Update longest streak if necessary
  longestStreak = Math.max(longestStreak, currentStreak);

  // Save score, current streak, and longest streak to localStorage
  localStorage.setItem('score', score);
  localStorage.setItem('currentStreak', currentStreak);
  localStorage.setItem('longestStreak', longestStreak);
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


// Reset the game
function resetGame() {
  score = 0;
  currentStreak = 0;
  longestStreak = 0;
  lastMilestone = 0;

  // Update displayed values
  scoreDisplay.textContent = score;
  streakDisplay.textContent = currentStreak;

  // Clear localStorage values
  localStorage.removeItem('score');
  localStorage.removeItem('currentStreak');
  localStorage.removeItem('longestStreak');

  // Reset board (you can choose to reset the candies and game grid here)
  createBoard(); // You may want to call a function to reinitialize the board
}

// Add an event listener to the reset button
document.getElementById("reset-button").addEventListener("click", resetGame);




