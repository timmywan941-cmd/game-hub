const games = [
  {
    id: 'snake',
    title: 'Retro Snake',
    tagline: 'Arcade classic',
    difficulty: 'Chill',
    accent: '#7efcfc',
    description: 'Glide through a neon grid and snack on glowing pixels. Wrap around the board to outsmart yourself and build the longest snake possible.',
    controls: ['Arrow keys to move', 'Space to restart after a crash'],
  },
  {
    id: 'paddle',
    title: 'Neon Paddle',
    tagline: 'Rhythm reflex',
    difficulty: 'Medium',
    accent: '#ff9f7b',
    description: 'Keep the energy orb alive by sliding the paddle. Each bounce speeds things up and adds to your streak.',
    controls: ['Left / Right arrows to move', 'Space to relaunch if you drop the orb'],
  },
  {
    id: 'dodge',
    title: 'Meteor Dodge',
    tagline: 'Endless survival',
    difficulty: 'Spicy',
    accent: '#b18bff',
    description: 'Pilot a tiny defender through a meteor shower. Each meteor you slip past pumps your score higher.',
    controls: ['Arrow keys to move anywhere', 'Space to restart when you collide'],
  },
];

const selectors = {
  grid: document.getElementById('gameGrid'),
  resultCount: document.getElementById('resultCount'),
  search: document.getElementById('searchInput'),
  modal: document.getElementById('gameModal'),
  modalTitle: document.getElementById('modalTitle'),
  modalTagline: document.getElementById('modalTagline'),
  modalDescription: document.getElementById('modalDescription'),
  controlList: document.getElementById('controlList'),
  scoreValue: document.getElementById('scoreValue'),
  bestValue: document.getElementById('bestValue'),
  statusValue: document.getElementById('statusValue'),
  canvas: document.getElementById('gameCanvas'),
};

let activeGameId = null;
let controller = null;
let bestScores = {};

try {
  bestScores = JSON.parse(localStorage.getItem('neon-arcade-scores')) || {};
} catch (error) {
  bestScores = {};
}

function renderGames(filterText = '') {
  const normalized = filterText.trim().toLowerCase();
  const filtered = games.filter((game) => {
    if (!normalized) return true;
    return (
      game.title.toLowerCase().includes(normalized) ||
      game.tagline.toLowerCase().includes(normalized) ||
      game.difficulty.toLowerCase().includes(normalized)
    );
  });

  selectors.grid.innerHTML = filtered
    .map(
      (game) => `
        <article class="game-card" style="--card-accent:${game.accent}">
          <p class="eyebrow">${game.tagline}</p>
          <strong>${game.title}</strong>
          <p class="muted">${game.description}</p>
          <div class="meta">
            <span>${game.difficulty} mode</span>
            <span>${game.controls.length} controls</span>
          </div>
          <button class="play-btn" data-play="${game.id}">Play now</button>
        </article>
      `
    )
    .join('');

  selectors.resultCount.textContent = filtered.length.toString();

  if (!filtered.length) {
    selectors.grid.innerHTML = '<p class="muted">No games match that filter. Try "retro" or "dodge".</p>';
  }
}

renderGames();

selectors.grid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-play]');
  if (!button) return;
  openModal(button.dataset.play);
});

selectors.search.addEventListener('input', (event) => {
  renderGames(event.target.value);
});

document.getElementById('randomGameBtn').addEventListener('click', () => playRandom());
document.querySelectorAll('[data-random]').forEach((button) => button.addEventListener('click', () => playRandom()));

function playRandom() {
  const random = games[Math.floor(Math.random() * games.length)];
  openModal(random.id);
}

function openModal(gameId) {
  const game = games.find((item) => item.id === gameId);
  if (!game) return;
  activeGameId = gameId;

  selectors.modalTitle.textContent = game.title;
  selectors.modalTagline.textContent = `${game.tagline} • ${game.difficulty}`;
  selectors.modalDescription.textContent = game.description;
  selectors.controlList.innerHTML = game.controls.map((line) => `<li>${line}</li>`).join('');
  selectors.scoreValue.textContent = '0';
  selectors.bestValue.textContent = (bestScores[gameId] || 0).toString();
  selectors.statusValue.textContent = 'Loading…';

  selectors.modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  startGame(gameId);
}

function closeModal() {
  stopGame();
  selectors.modal.classList.add('hidden');
  document.body.style.overflow = '';
}

selectors.modal.addEventListener('click', (event) => {
  if (event.target === selectors.modal || event.target.closest('[data-close]')) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !selectors.modal.classList.contains('hidden')) {
    closeModal();
  }
});

function updateScore(score) {
  if (!activeGameId) return;
  selectors.scoreValue.textContent = score.toString();
  const best = Math.max(score, bestScores[activeGameId] || 0);
  bestScores[activeGameId] = best;
  selectors.bestValue.textContent = best.toString();
  try {
    localStorage.setItem('neon-arcade-scores', JSON.stringify(bestScores));
  } catch (error) {
    // localStorage may fail in some environments; ignore silently
  }
}

function updateStatus(message) {
  selectors.statusValue.textContent = message;
}

function startGame(id) {
  stopGame();
  const engine = gameEngines[id];
  if (!engine) {
    updateStatus('Coming soon');
    return;
  }
  controller = engine({
    canvas: selectors.canvas,
    reportScore: updateScore,
    reportStatus: updateStatus,
  });
}

function stopGame() {
  if (controller && typeof controller.stop === 'function') {
    controller.stop();
  }
  controller = null;
}

const gameEngines = {
  snake: (env) => createSnakeGame(env),
  paddle: (env) => createPaddleGame(env),
  dodge: (env) => createDodgeGame(env),
};

function createSnakeGame({ canvas, reportScore, reportStatus }) {
  const ctx = canvas.getContext('2d');
  const tileSize = 18;
  const columns = Math.floor(canvas.width / tileSize);
  const rows = Math.floor(canvas.height / tileSize);
  const dirMap = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
  };

  let snake = [];
  let direction = dirMap.ArrowRight;
  let pendingDirection = direction;
  let food = null;
  let score = 0;
  let frameDelay = 130;
  let lastFrame = 0;
  let animationFrame;
  let running = true;

  function reset() {
    snake = [{ x: Math.floor(columns / 2), y: Math.floor(rows / 2) }];
    direction = dirMap.ArrowRight;
    pendingDirection = direction;
    food = randomFood();
    score = 0;
    frameDelay = 130;
    running = true;
    reportScore(score);
    reportStatus('Collect the glowing snacks!');
    draw();
  }

  function randomFood() {
    let position;
    do {
      position = {
        x: Math.floor(Math.random() * columns),
        y: Math.floor(Math.random() * rows),
      };
    } while (snake.some((segment) => segment.x === position.x && segment.y === position.y));
    return position;
  }

  function loop(timestamp) {
    animationFrame = requestAnimationFrame(loop);
    if (timestamp - lastFrame < frameDelay) return;
    lastFrame = timestamp;
    if (!running) return;

    direction = pendingDirection;
    const head = {
      x: (snake[0].x + direction.x + columns) % columns,
      y: (snake[0].y + direction.y + rows) % rows,
    };

    const hitsSelf = snake.some((segment, index) => index && segment.x === head.x && segment.y === head.y);

    if (hitsSelf) {
      running = false;
      reportStatus('Snake crash! Press Space to restart.');
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 5;
      reportScore(score);
      food = randomFood();
      if (frameDelay > 70) frameDelay -= 3;
    } else {
      snake.pop();
    }

    draw();
  }

  function draw() {
    ctx.fillStyle = '#01060f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x < columns; x++) {
      ctx.beginPath();
      ctx.moveTo(x * tileSize, 0);
      ctx.lineTo(x * tileSize, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * tileSize);
      ctx.lineTo(canvas.width, y * tileSize);
      ctx.stroke();
    }

    ctx.fillStyle = '#ff80d0';
    ctx.fillRect(food.x * tileSize + 4, food.y * tileSize + 4, tileSize - 8, tileSize - 8);

    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#f8ffb3' : '#7efcfc';
      ctx.fillRect(segment.x * tileSize + 2, segment.y * tileSize + 2, tileSize - 4, tileSize - 4);
    });
  }

  function handleKey(event) {
    if (event.key === ' ') {
      if (!running) {
        reset();
      }
      event.preventDefault();
      return;
    }
    const next = dirMap[event.key];
    if (!next) return;
    if (next.x === -direction.x && next.y === -direction.y) return;
    pendingDirection = next;
  }

  document.addEventListener('keydown', handleKey);
  reset();
  animationFrame = requestAnimationFrame(loop);

  return {
    stop() {
      cancelAnimationFrame(animationFrame);
      document.removeEventListener('keydown', handleKey);
    },
  };
}

function createPaddleGame({ canvas, reportScore, reportStatus }) {
  const ctx = canvas.getContext('2d');
  const paddle = { width: 110, height: 14, x: canvas.width / 2 - 55, speed: 7 };
  const ball = { x: canvas.width / 2, y: canvas.height / 3, radius: 9, vx: 3.5, vy: 3.2 };
  const pressed = new Set();
  let score = 0;
  let animationFrame;
  let running = true;

  function reset() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 1.2);
    ball.vy = 3 + Math.random() * 1.2;
    running = true;
    score = 0;
    reportScore(score);
    reportStatus('Keep the neon orb alive!');
  }

  function loop() {
    animationFrame = requestAnimationFrame(loop);
    ctx.fillStyle = '#06030f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    if (pressed.has('ArrowLeft')) paddle.x -= paddle.speed;
    if (pressed.has('ArrowRight')) paddle.x += paddle.speed;
    paddle.x = Math.max(12, Math.min(canvas.width - paddle.width - 12, paddle.x));

    if (running) {
      ball.x += ball.vx;
      ball.y += ball.vy;
    }

    if (ball.x - ball.radius <= 10 || ball.x + ball.radius >= canvas.width - 10) {
      ball.vx *= -1;
    }
    if (ball.y - ball.radius <= 10) {
      ball.vy *= -1;
    }

    const paddleTop = canvas.height - 40;
    if (
      ball.y + ball.radius >= paddleTop &&
      ball.y + ball.radius <= paddleTop + paddle.height &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + paddle.width &&
      ball.vy > 0
    ) {
      const offset = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
      ball.vy *= -1;
      ball.vx = offset * 4.2;
      score += 1;
      reportScore(score);
      reportStatus(score % 5 === 0 ? 'Combo streak!' : 'Bounce!');
    }

    if (ball.y - ball.radius > canvas.height) {
      running = false;
      reportStatus('Missed! Press Space to relaunch.');
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(paddle.x, paddleTop, paddle.width, paddle.height);

    ctx.beginPath();
    ctx.fillStyle = running ? '#ffb2f0' : '#555c92';
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function handleKeyDown(event) {
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
      pressed.add(event.code);
    }
    if (event.code === 'Space' && !running) {
      reset();
      event.preventDefault();
    }
  }

  function handleKeyUp(event) {
    pressed.delete(event.code);
  }

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  reset();
  animationFrame = requestAnimationFrame(loop);

  return {
    stop() {
      cancelAnimationFrame(animationFrame);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    },
  };
}

function createDodgeGame({ canvas, reportScore, reportStatus }) {
  const ctx = canvas.getContext('2d');
  const player = { x: canvas.width / 2 - 16, y: canvas.height - 80, size: 28, speed: 5 };
  const keys = new Set();
  let meteors = [];
  let animationFrame;
  let score = 0;
  let running = true;
  let lastTime = 0;
  let spawnTimer = 0;

  function reset() {
    player.x = canvas.width / 2 - player.size / 2;
    player.y = canvas.height - 80;
    meteors = [];
    score = 0;
    running = true;
    spawnTimer = 0;
    lastTime = 0;
    reportScore(score);
    reportStatus('Dodge the falling meteors!');
  }

  function spawnMeteor() {
    const size = 16 + Math.random() * 20;
    meteors.push({
      x: Math.random() * (canvas.width - size),
      y: -size,
      size,
      speed: 2 + Math.random() * 2.5,
    });
  }

  function loop(timestamp = 0) {
    animationFrame = requestAnimationFrame(loop);
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    ctx.fillStyle = '#03030c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let i = 0; i < 60; i++) {
      const starX = (i * 73) % canvas.width;
      const starY = (i * 37) % canvas.height;
      ctx.fillRect(starX, starY, 1, 1);
    }

    if (running) {
      if (keys.has('ArrowLeft')) player.x -= player.speed;
      if (keys.has('ArrowRight')) player.x += player.speed;
      if (keys.has('ArrowUp')) player.y -= player.speed;
      if (keys.has('ArrowDown')) player.y += player.speed;

      player.x = Math.max(10, Math.min(canvas.width - player.size - 10, player.x));
      player.y = Math.max(10, Math.min(canvas.height - player.size - 10, player.y));

      spawnTimer += delta;
      if (spawnTimer > 600) {
        spawnMeteor();
        spawnTimer = 0;
      }

      meteors.forEach((meteor) => {
        meteor.y += meteor.speed;
      });

      for (let i = meteors.length - 1; i >= 0; i -= 1) {
        if (meteors[i].y > canvas.height + meteors[i].size) {
          meteors.splice(i, 1);
          score += 1;
          reportScore(score);
        }
      }

      const collision = meteors.some((meteor) => {
        return (
          meteor.x < player.x + player.size &&
          meteor.x + meteor.size > player.x &&
          meteor.y < player.y + player.size &&
          meteor.y + meteor.size > player.y
        );
      });

      if (collision) {
        running = false;
        reportStatus('Meteor hit! Press Space to restart.');
      }
    }

    drawPlayer();
    drawMeteors();
  }

  function drawPlayer() {
    const gradient = ctx.createLinearGradient(player.x, player.y, player.x + player.size, player.y + player.size);
    gradient.addColorStop(0, '#7efcfc');
    gradient.addColorStop(1, '#ff8fb7');
    ctx.fillStyle = gradient;
    ctx.fillRect(player.x, player.y, player.size, player.size);
  }

  function drawMeteors() {
    meteors.forEach((meteor) => {
      ctx.fillStyle = '#b18bff';
      ctx.beginPath();
      ctx.arc(meteor.x + meteor.size / 2, meteor.y + meteor.size / 2, meteor.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.stroke();
    });
  }

  function handleKeyDown(event) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
      keys.add(event.code);
      event.preventDefault();
    }
    if (event.code === 'Space' && !running) {
      reset();
      event.preventDefault();
    }
  }

  function handleKeyUp(event) {
    keys.delete(event.code);
  }

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  reset();
  animationFrame = requestAnimationFrame(loop);

  return {
    stop() {
      cancelAnimationFrame(animationFrame);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    },
  };
}
