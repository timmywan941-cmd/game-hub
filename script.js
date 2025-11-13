const frame = document.getElementById('game-frame');

document.querySelectorAll('.play-btn').forEach(button => {
  button.addEventListener('click', () => {
    const url = button.getAttribute('data-url');
    frame.src = url;
  });
});
