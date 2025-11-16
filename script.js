const games = [
  {
    title: 'Pixel Snake',
    url: 'games/pixel-snake/index.html',
    icon: '🐍',
    description: 'Bundled retro snake with tighter turns, scoreboard, and instant restarts.',
    tags: ['arcade', 'retro', 'built-in'],
    added: '2024-03-20',
    featuredRank: 1,
    bundled: true
  },
  {
    title: 'Neon Runner',
    url: 'games/neon-runner/index.html',
    icon: '🚀',
    description: 'Tap-friendly endless runner with glowy walls and rising speed.',
    tags: ['runner', 'endless', 'built-in'],
    added: '2024-03-20',
    featuredRank: 2,
    bundled: true
  },
  {
    title: 'Orbital Shooter',
    url: 'games/orbital-shooter/index.html',
    icon: '🛰️',
    description: 'Dual-stick vibes—strafe with WASD while blasting waves of drones.',
    tags: ['shooter', 'survival', 'built-in'],
    added: '2024-03-20',
    featuredRank: 3,
    bundled: true
  },
  {
    title: 'Memory Flip',
    url: 'games/memory-flip/index.html',
    icon: '🧠',
    description: 'Calm card-matching puzzle with best-move tracking saved locally.',
    tags: ['puzzle', 'calm', 'built-in'],
    added: '2024-03-20',
    featuredRank: 4,
    bundled: true
  },
  {
    title: 'Retro Bowl',
    url: 'https://retro-bowlgames.github.io/',
    icon: '🏈',
    description: 'Build a dynasty in this fan-favorite retro football manager.',
    tags: ['sports', 'retro', 'football'],
    added: '2023-11-01',
    featuredRank: 5
  },
  {
    title: 'Drift Hunters',
    url: 'https://mathadventure1.github.io/drift-hunters/',
    icon: '🚗',
    description: 'Collect cars and slide around neon tracks with buttery drift physics.',
    tags: ['racing', '3d', 'cars'],
    added: '2024-02-10',
    featuredRank: 6
  },
  {
    title: 'Slope',
    url: 'https://ubg9.github.io/games/slope/',
    icon: '🌀',
    description: 'Fast-paced downhill survival. Dodge obstacles as the slope speeds up.',
    tags: ['arcade', 'reflex', 'endless'],
    added: '2024-01-15',
    featuredRank: 7
  },
  {
    title: '1v1.LOL',
    url: 'https://1v1lolunblockedgames.github.io/',
    icon: '🎯',
    description: 'Quick-build and shoot duels with matchmaking that works on school Wi-Fi.',
    tags: ['shooter', 'competitive', 'multiplayer'],
    added: '2024-03-02',
    featuredRank: 8
  },
  {
    title: 'Moto X3M Pool Party',
    url: 'https://ubg77.github.io/moto-x3m-pool-party/',
    icon: '🏍️',
    description: 'Loop-de-loop stunt biking through waterpark themed tracks.',
    tags: ['bikes', 'stunts', 'skill'],
    added: '2023-12-12',
    featuredRank: 9
  },
  {
    title: 'Cookie Clicker Holiday',
    url: 'https://unblocked-games.s3.amazonaws.com/xmas-cookie-clicker.html',
    icon: '🍪',
    description: 'Festive idle clicker fun with endless upgrades and sugary chaos.',
    tags: ['idle', 'clicker', 'holiday'],
    added: '2023-12-01',
    featuredRank: 10
  },
  {
    title: 'Basketball Stars',
    url: 'https://mathadventure1.github.io/basketball-stars/',
    icon: '🏀',
    description: 'Two-player streetball legend with dunks, alleyoops, and powerups.',
    tags: ['sports', 'multiplayer'],
    added: '2024-02-28',
    featuredRank: 11
  },
  {
    title: 'Stickman Hook',
    url: 'https://ubg365.github.io/stickman-hook/',
    icon: '🪢',
    description: 'Swing through minimalist courses and stick the landing with style.',
    tags: ['physics', 'arcade'],
    added: '2024-01-25',
    featuredRank: 12
  },
  {
    title: 'Fireboy & Watergirl: Forest',
    url: 'https://ubg365.github.io/fireboy-and-watergirl-forest-temple/',
    icon: '🔥💧',
    description: 'Co-op puzzle-platformer perfection for solo multitasking or a friend.',
    tags: ['co-op', 'puzzle', 'platformer'],
    added: '2023-11-18',
    featuredRank: 13
  },
  {
    title: 'Subway Surfers: Seoul',
    url: 'https://ubg9.github.io/games/subway-surfers-seoul/',
    icon: '🚉',
    description: 'Dash, dodge, and collect in the Seoul edition of Subway Surfers.',
    tags: ['endless', 'runner'],
    added: '2024-03-10',
    featuredRank: 14
  },
  {
    title: 'Smash Karts',
    url: 'https://geometry-game.github.io/smashkarts/',
    icon: '💥',
    description: 'Battle-royale kart chaos with powerups, friends, and private rooms.',
    tags: ['multiplayer', 'racing', 'battle'],
    added: '2024-01-08',
    featuredRank: 15
  },
  {
    title: 'Geometry Dash Lite',
    url: 'https://ubg365.github.io/geometry-dash-lite/',
    icon: '📐',
    description: 'Iconic rhythm platformer with custom levels and instant restarts.',
    tags: ['rhythm', 'hardcore', 'platformer'],
    added: '2024-02-05',
    featuredRank: 16
  }
];

const frame = document.getElementById('game-frame');
const placeholder = document.getElementById('viewer-placeholder');
const gameList = document.getElementById('game-list');
const countLabel = document.getElementById('game-count');
const searchInput = document.getElementById('search-input');
const tagFilters = document.getElementById('tag-filters');
const sortSelect = document.getElementById('sort-select');
const clearButton = document.getElementById('clear-btn');

const state = {
  search: '',
  tags: new Set(),
  sort: 'featured'
};

function uniqueTags() {
  return [...new Set(games.flatMap(game => game.tags))].sort();
}

function renderTagFilters() {
  tagFilters.innerHTML = '';
  uniqueTags().forEach(tag => {
    const button = document.createElement('button');
    button.className = 'tag-chip';
    button.type = 'button';
    button.textContent = `#${tag}`;
    button.dataset.tag = tag;
    button.addEventListener('click', () => toggleTag(tag, button));
    tagFilters.appendChild(button);
  });
}

function toggleTag(tag, button) {
  if (state.tags.has(tag)) {
    state.tags.delete(tag);
    button.dataset.active = 'false';
  } else {
    state.tags.add(tag);
    button.dataset.active = 'true';
  }
  renderGames();
}

function clearFilters() {
  state.search = '';
  state.tags.clear();
  state.sort = 'featured';
  searchInput.value = '';
  sortSelect.value = 'featured';
  [...tagFilters.children].forEach(chip => {
    chip.dataset.active = 'false';
  });
  renderGames();
}

function matchesSearch(game) {
  const target = `${game.title} ${game.description} ${game.tags.join(' ')}`.toLowerCase();
  return target.includes(state.search.trim().toLowerCase());
}

function matchesTags(game) {
  if (state.tags.size === 0) return true;
  return [...state.tags].every(tag => game.tags.includes(tag));
}

function sortGames(list) {
  if (state.sort === 'az') {
    return list.sort((a, b) => a.title.localeCompare(b.title));
  }
  if (state.sort === 'newest') {
    return list.sort((a, b) => new Date(b.added) - new Date(a.added));
  }
  return list.sort((a, b) => a.featuredRank - b.featuredRank);
}

function renderGames() {
  const filtered = sortGames(
    games.filter(game => matchesSearch(game) && matchesTags(game))
  );

  countLabel.textContent = `${filtered.length} game${filtered.length === 1 ? '' : 's'} ready to play`;
  gameList.innerHTML = '';

  if (filtered.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'game-card empty';
    emptyState.innerHTML = '<p>No matches. Try a different search or clear filters.</p>';
    gameList.appendChild(emptyState);
    return;
  }

  filtered.forEach(game => {
    const card = document.createElement('article');
    card.className = 'game-card';
    card.setAttribute('role', 'listitem');
    card.dataset.title = game.title;
    card.dataset.bundled = game.bundled ? 'true' : 'false';

    const icon = document.createElement('div');
    icon.className = 'game-icon';
    icon.textContent = game.icon;

    const info = document.createElement('div');
    info.className = 'game-info';
    const heading = document.createElement('h3');
    heading.textContent = game.title;
    if (game.bundled) {
      const badge = document.createElement('span');
      badge.className = 'inline-badge';
      badge.textContent = 'Built-in';
      heading.appendChild(badge);
    }
    const blurb = document.createElement('p');
    blurb.textContent = game.description;
    info.append(heading, blurb);

    const tagRow = document.createElement('div');
    tagRow.className = 'tag-row';
    game.tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = tag;
      tagRow.appendChild(span);
    });
    info.appendChild(tagRow);

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const playBtn = document.createElement('button');
    playBtn.className = 'play-btn';
    playBtn.type = 'button';
    playBtn.textContent = game.bundled ? 'Play instantly' : 'Try in viewer';
    playBtn.title = game.bundled
      ? 'This copy is packaged with Arcadium and works offline.'
      : 'Loads the remote mirror inside the iframe (may block on some networks).';
    playBtn.addEventListener('click', () => selectGame(card, game));

    const openTab = document.createElement('a');
    openTab.className = 'open-tab';
    openTab.href = game.url;
    openTab.target = '_blank';
    openTab.rel = 'noopener';
    openTab.textContent = game.bundled ? 'Pop out ↗' : 'Open mirror ↗';

    actions.append(playBtn, openTab);

    card.append(icon, info, actions);
    gameList.appendChild(card);
  });
}

function selectGame(card, game) {
  frame.src = game.url;
  placeholder.style.display = 'none';
  document.querySelectorAll('.game-card').forEach(el => {
    el.dataset.active = 'false';
  });
  card.dataset.active = 'true';
}

renderTagFilters();
renderGames();

searchInput.addEventListener('input', event => {
  state.search = event.target.value;
  renderGames();
});

sortSelect.addEventListener('change', event => {
  state.sort = event.target.value;
  renderGames();
});

clearButton.addEventListener('click', clearFilters);
