document.querySelectorAll('.play-btn').forEach(button => {
  button.addEventListener('click', () => {
    const url = button.getAttribute('data-url');
    const iframe = document.getElementById('game-frame');
    iframe.src = url;
  });
});
