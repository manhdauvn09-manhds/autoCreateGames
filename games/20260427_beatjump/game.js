import { Input } from '../../engine/input.js';
import { Audio } from '../../engine/audio.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

Input.init();
Audio.init();

let gameState = {
  score: 0,
  combo: 0,
  gameRunning: false,
  gamePaused: false,
  playerY: canvas.height * 0.7,
  playerX: canvas.width / 2,
  playerSize: 30,
  beatTime: 0,
  beatCounter: 0,
  soundEnabled: true
};

const platforms = [];
let beat = 0;
const beatInterval = 0.5; // Beat every 0.5 seconds

class Platform {
  constructor(x, y, isBeat = false) {
    this.x = x;
    this.y = y;
    this.width = 80;
    this.height = 10;
    this.isBeat = isBeat;
    this.color = isBeat ? '#ff00ff' : '#00ff88';
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
    if (this.isBeat) {
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x - this.width / 2, this.y, this.width, this.height);
    }
  }

  update() {
    this.y += 3;
  }
}

function startGame() {
  document.getElementById('tutorial').remove();
  gameState.gameRunning = true;
  gameState.beatTime = 0;
  gameState.beatCounter = 0;
  platforms.length = 0;
  gameState.score = 0;
  gameState.combo = 0;
}

function togglePause() {
  gameState.gamePaused = !gameState.gamePaused;
  document.getElementById('pause-overlay').classList.toggle('hidden');
}

document.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    if (!gameState.gameRunning) startGame();
    else jump();
  }
  if (e.key === 'p' || e.key === 'P') togglePause();
});

canvas.addEventListener('click', () => {
  if (!gameState.gameRunning) startGame();
  else jump();
});

document.getElementById('resume-btn').addEventListener('click', togglePause);
document.getElementById('restart-btn').addEventListener('click', () => {
  gameState.gameRunning = true;
  gameState.gamePaused = false;
  startGame();
  document.getElementById('pause-overlay').classList.add('hidden');
});

document.getElementById('sound-toggle').addEventListener('change', (e) => {
  gameState.soundEnabled = e.target.checked;
  Audio.enabled = gameState.soundEnabled;
});

let playerVelocity = 0;
let isJumping = false;

function jump() {
  if (!gameState.gameRunning || gameState.gamePaused) return;
  if (isJumping) return;

  isJumping = true;
  playerVelocity = -15;

  if (gameState.soundEnabled) Audio.pop();

  // Show feedback
  const feedback = document.getElementById('feedback');
  feedback.textContent = '⭐ PERFECT!';
  feedback.style.opacity = '1';
  feedback.style.color = '#00ff88';
  setTimeout(() => (feedback.style.opacity = '0'), 200);

  gameState.combo++;
  gameState.score += 10 + Math.floor(gameState.combo * 2);
}

function generatePlatforms() {
  if (platforms.length < 15) {
    const isBeat = gameState.beatCounter % 4 === 0;
    const platform = new Platform(
      Math.random() * (canvas.width - 100) + 50,
      -20,
      isBeat
    );
    platforms.push(platform);
    gameState.beatCounter++;
  }
}

function update(deltaTime) {
  if (!gameState.gameRunning || gameState.gamePaused) return;

  gameState.beatTime += deltaTime;

  // Player physics
  playerVelocity += 0.6;
  gameState.playerY += playerVelocity;

  // Collision detection
  let onPlatform = false;
  platforms.forEach((platform) => {
    if (
      gameState.playerY + gameState.playerSize >= platform.y &&
      gameState.playerY + gameState.playerSize <= platform.y + platform.height + 10 &&
      gameState.playerX + gameState.playerSize / 2 >= platform.x - platform.width / 2 &&
      gameState.playerX + gameState.playerSize / 2 <= platform.x + platform.width / 2 &&
      playerVelocity >= 0
    ) {
      onPlatform = true;
      isJumping = false;
      if (gameState.soundEnabled) Audio.beep(800, 0.05);
    }
  });

  // Generate new platforms
  generatePlatforms();

  // Update and remove off-screen platforms
  platforms.forEach((p, i) => {
    p.update();
    if (p.y > canvas.height) {
      platforms.splice(i, 1);
    }
  });

  // Game over
  if (gameState.playerY > canvas.height) {
    gameState.gameRunning = false;
    gameState.combo = 0;
  }

  // Horizontal movement
  if (Input.isPressed('arrowleft') || Input.isPressed('a')) {
    gameState.playerX -= 5;
  }
  if (Input.isPressed('arrowright') || Input.isPressed('d')) {
    gameState.playerX += 5;
  }

  // Boundary
  gameState.playerX = Math.max(30, Math.min(canvas.width - 30, gameState.playerX));

  // Update UI
  document.getElementById('score').textContent = `Score: ${gameState.score}`;
  document.getElementById('combo').textContent = `Combo: ${gameState.combo}x`;
}

let lastTime = 0;
function gameLoop(timestamp) {
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  update(deltaTime);
  draw();
  requestAnimationFrame(gameLoop);
}

function draw() {
  // Background
  ctx.fillStyle = '#0f3460';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid background
  ctx.strokeStyle = 'rgba(0,255,136,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i < canvas.width; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }

  // Draw platforms
  platforms.forEach((p) => p.draw(ctx));

  // Draw player
  ctx.fillStyle = '#00ff88';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 20;
  ctx.fillRect(
    gameState.playerX - gameState.playerSize / 2,
    gameState.playerY,
    gameState.playerSize,
    gameState.playerSize
  );
  ctx.shadowBlur = 0;

  // Game over screen
  if (!gameState.gameRunning) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 2em Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
    ctx.font = '1.2em Arial';
    ctx.fillText(`Final Score: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Tap to restart', canvas.width / 2, canvas.height / 2 + 60);
  }
}

requestAnimationFrame(gameLoop);
