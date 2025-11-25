const arena = document.getElementById("arena");
const player = document.getElementById("player");
const orb = document.getElementById("orb");
const startGameButton = document.getElementById("startGame");
const scoreField = document.getElementById("score");
const streakField = document.getElementById("streak");
const timerField = document.getElementById("timer");
const callout = document.getElementById("callout");

const PLAYER_SIZE = 42;
const ORB_SIZE = 30;
const STEP = 18;
const ROUND_LENGTH = 45;

let running = false;
let score = 0;
let combo = 0;
let timer = ROUND_LENGTH;
let timerId = null;
let playerPos = { x: 0, y: 0 };
let orbPos = { x: 0, y: 0 };

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const updateScoreboard = () => {
  scoreField.textContent = score;
  streakField.textContent = `x${combo}`;
  timerField.textContent = `${timer}s`;
};

const centerPlayer = () => {
  const { width, height } = arena.getBoundingClientRect();
  playerPos = {
    x: (width - PLAYER_SIZE) / 2,
    y: (height - PLAYER_SIZE) / 2,
  };
  player.style.left = `${playerPos.x}px`;
  player.style.top = `${playerPos.y}px`;
};

const placeOrb = () => {
  const padding = 20;
  const { width, height } = arena.getBoundingClientRect();
  const xRange = Math.max(width - ORB_SIZE - padding * 2, 0);
  const yRange = Math.max(height - ORB_SIZE - padding * 2, 0);
  orbPos = {
    x: Math.random() * xRange + padding,
    y: Math.random() * yRange + padding,
  };
  orb.style.left = `${orbPos.x}px`;
  orb.style.top = `${orbPos.y}px`;
};

const handleCollect = () => {
  score += 10;
  combo += 1;
  player.classList.add("flash");
  setTimeout(() => player.classList.remove("flash"), 200);
  callout.textContent = combo % 5 === 0
    ? `Combo x${combo}! Keep the rhythm going.`
    : `${timer}s left · keep moving!`;
  placeOrb();
  updateScoreboard();
};

const checkCollision = () => {
  const playerCenter = {
    x: playerPos.x + PLAYER_SIZE / 2,
    y: playerPos.y + PLAYER_SIZE / 2,
  };
  const orbCenter = {
    x: orbPos.x + ORB_SIZE / 2,
    y: orbPos.y + ORB_SIZE / 2,
  };
  const distance = Math.hypot(
    playerCenter.x - orbCenter.x,
    playerCenter.y - orbCenter.y
  );

  if (distance < (PLAYER_SIZE + ORB_SIZE) / 2) {
    handleCollect();
  }
};

const movePlayer = (dx, dy) => {
  const { width, height } = arena.getBoundingClientRect();
  playerPos.x = clamp(playerPos.x + dx, 0, width - PLAYER_SIZE);
  playerPos.y = clamp(playerPos.y + dy, 0, height - PLAYER_SIZE);

  player.style.left = `${playerPos.x}px`;
  player.style.top = `${playerPos.y}px`;
  checkCollision();
};

const resetGame = () => {
  clearInterval(timerId);
  running = false;
  score = 0;
  combo = 0;
  timer = ROUND_LENGTH;
  updateScoreboard();
  callout.textContent = "Collect as many energy orbs as you can before the timer hits zero.";
  startGameButton.textContent = "Start run";
  startGameButton.disabled = false;
  centerPlayer();
  placeOrb();
};

const endGame = () => {
  running = false;
  clearInterval(timerId);
  callout.textContent = `Nice run! Final score: ${score}. Try to beat it!`;
  startGameButton.textContent = "Run again";
  startGameButton.disabled = false;
};

const startTimer = () => {
  timerId = setInterval(() => {
    timer -= 1;
    updateScoreboard();
    if (timer <= 0) {
      endGame();
    }
  }, 1000);
};

const startGame = () => {
  if (running) {
    return;
  }
  resetGame();
  running = true;
  startGameButton.disabled = true;
  startGameButton.textContent = "Running…";
  callout.textContent = "Flow state locked in. Collect every orb!";
  startTimer();
  arena.focus();
};

const handleKeyDown = (event) => {
  const key = event.key.toLowerCase();
  if (key === "r") {
    event.preventDefault();
    resetGame();
    return;
  }

  if (!running) {
    return;
  }

  const directions = {
    arrowup: [0, -STEP],
    w: [0, -STEP],
    arrowdown: [0, STEP],
    s: [0, STEP],
    arrowleft: [-STEP, 0],
    a: [-STEP, 0],
    arrowright: [STEP, 0],
    d: [STEP, 0],
  };

  if (directions[key]) {
    event.preventDefault();
    const [dx, dy] = directions[key];
    movePlayer(dx, dy);
  }
};

startGameButton.addEventListener("click", startGame);
document.addEventListener("keydown", handleKeyDown);
window.addEventListener("resize", () => {
  centerPlayer();
  movePlayer(0, 0); // clamp positions to new bounds
});

resetGame();
