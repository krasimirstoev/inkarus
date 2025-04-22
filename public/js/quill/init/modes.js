export function initModes() {
  // Fullscreen Mode
  const toggleFS = document.getElementById('toggle-fullscreen');
  const exitFS = document.getElementById('exit-fullscreen');

  if (toggleFS && exitFS) {
    toggleFS.addEventListener('click', () => {
      document.body.classList.add('fullscreen-mode');
    });

    exitFS.addEventListener('click', () => {
      document.body.classList.remove('fullscreen-mode');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.body.classList.remove('fullscreen-mode');
      }
    });
  }

  // Reading Mode
  const toggleReading = document.getElementById('toggle-reading');
  const exitReading = document.getElementById('exit-reading');

  if (toggleReading && exitReading) {
    toggleReading.addEventListener('click', () => {
      document.body.classList.add('reading-mode');
    });

    exitReading.addEventListener('click', () => {
      document.body.classList.remove('reading-mode');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.body.classList.remove('reading-mode');
      }
    });
  }
}
