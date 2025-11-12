const buttons = document.querySelectorAll('.play-btn');
const frame = document.getElementById('game-frame');

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const url = btn.dataset.url;
    frame.src = url;
  });
});

const searchInput = document.getElementById('search');
const cards = document.querySelectorAll('.game-card');

searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase();

  cards.forEach(card => {
    const title = card.dataset.title.toLowerCase();
    const tags = card.dataset.tags.toLowerCase();
    const match = title.includes(q) || tags.includes(q);
    card.style.display = match ? '' : 'none';
  });
});
