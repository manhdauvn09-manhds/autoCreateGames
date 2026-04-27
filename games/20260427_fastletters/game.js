const wordList = [
  'cat', 'dog', 'bird', 'fish', 'tree', 'star', 'moon', 'sun', 'wind', 'rain',
  'fire', 'water', 'earth', 'air', 'rock', 'sand', 'snow', 'ice', 'sea', 'sky',
  'game', 'play', 'jump', 'run', 'walk', 'dance', 'sing', 'eat', 'drink', 'sleep',
  'love', 'hate', 'good', 'bad', 'fast', 'slow', 'big', 'small', 'hot', 'cold',
  'yes', 'no', 'go', 'stop', 'wait', 'help', 'fun', 'cool', 'nice', 'sweet'
];

let gameState = {
  score: 0,
  timeLeft: 60,
  lives: 3,
  gameRunning: false,
  currentLetters: [],
  submittedWords: new Set()
};

const inputEl = document.getElementById('word-input');
const submitBtn = document.getElementById('submit-btn');
const tutorialEl = document.getElementById('tutorial');
const gameOverEl = document.getElementById('game-over-screen');

function generateLetters() {
  const count = Math.random() > 0.5 ? 5 : 6;
  const letters = [];
  for (let i = 0; i < count; i++) {
    letters.push(String.fromCharCode(65 + Math.floor(Math.random() * 26)));
  }
  return letters;
}

function renderLetters() {
  const pool = document.getElementById('letters-pool');
  pool.innerHTML = '';
  gameState.currentLetters.forEach((letter) => {
    const div = document.createElement('div');
    div.className = 'letter';
    div.textContent = letter;
    div.addEventListener('click', () => {
      inputEl.value += letter;
      inputEl.focus();
    });
    pool.appendChild(div);
  });
}

function canFormWord(word) {
  const needed = {};
  for (const char of word.toUpperCase()) {
    needed[char] = (needed[char] || 0) + 1;
  }

  const available = {};
  for (const char of gameState.currentLetters) {
    available[char] = (available[char] || 0) + 1;
  }

  for (const char in needed) {
    if (!available[char] || available[char] < needed[char]) {
      return false;
    }
  }
  return true;
}

function submitWord() {
  const word = inputEl.value.trim().toLowerCase();
  inputEl.value = '';
  const feedback = document.getElementById('feedback');

  if (!word) return;

  if (gameState.submittedWords.has(word)) {
    feedback.textContent = '❌ Already used!';
    return;
  }

  if (!wordList.includes(word)) {
    feedback.textContent = '❌ Not a word!';
    gameState.lives--;
    if (gameState.lives <= 0) endGame();
    updateUI();
    return;
  }

  if (!canFormWord(word)) {
    feedback.textContent = '❌ Can\'t form it!';
    gameState.lives--;
    if (gameState.lives <= 0) endGame();
    updateUI();
    return;
  }

  gameState.submittedWords.add(word);
  const points = word.length * (5 + gameState.submittedWords.size);
  gameState.score += points;
  feedback.textContent = `✨ +${points} points!`;

  // Refresh letters
  gameState.currentLetters = generateLetters();
  renderLetters();
  updateUI();
}

function startGame() {
  tutorialEl.classList.add('hidden');
  gameState.gameRunning = true;
  gameState.score = 0;
  gameState.timeLeft = 60;
  gameState.lives = 3;
  gameState.submittedWords.clear();
  gameState.currentLetters = generateLetters();
  renderLetters();
  updateUI();
  inputEl.focus();

  const timer = setInterval(() => {
    if (gameState.gameRunning) {
      gameState.timeLeft--;
      updateUI();
      if (gameState.timeLeft <= 0) {
        clearInterval(timer);
        endGame();
      }
    }
  }, 1000);
}

function endGame() {
  gameState.gameRunning = false;
  gameOverEl.classList.remove('hidden');
  document.getElementById('final-score').textContent = `Score: ${gameState.score}`;
}

function updateUI() {
  document.getElementById('score').textContent = `Score: ${gameState.score}`;
  document.getElementById('timer').textContent = `⏱️ Time: ${gameState.timeLeft}s`;
  document.getElementById('health').textContent = `❤️ Lives: ${gameState.lives}`;
}

submitBtn.addEventListener('click', submitWord);
inputEl.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') submitWord();
});

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', () => {
  gameOverEl.classList.add('hidden');
  startGame();
});

updateUI();
