// public/js/pages/place-panel.js — Handles the “Places” side‐panel in the editor

document.addEventListener('DOMContentLoaded', () => {
  const openBtn   = document.getElementById('toggle-places');
  const closeBtn  = document.getElementById('close-places');
  const panel     = document.getElementById('places-panel');
  const listEl    = document.getElementById('place-list');
  const searchEl  = document.getElementById('place-search');
  const projectId = document.getElementById('editor-form').dataset.projectId;

  // Show / hide helpers
  const showPanel = () => panel.classList.remove('d-none');
  const hidePanel = () => panel.classList.add('d-none');

  // Open and load
  openBtn.addEventListener('click', () => {
    showPanel();
    loadPlaces(searchEl.value);
  });

  // Close
  closeBtn.addEventListener('click', hidePanel);

  // Live search
  searchEl.addEventListener('input', () => loadPlaces(searchEl.value));

  // Fetch & render places
  async function loadPlaces(query = '') {
    listEl.innerHTML = '<li class="list-group-item text-center text-muted">Loading...</li>';
    try {
      const res  = await fetch(`/places/json/${projectId}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error('Failed to load');
      }
      const filtered = json.places.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase())
      );
      renderList(filtered);
    } catch (err) {
      console.error(err);
      listEl.innerHTML = '<li class="list-group-item text-danger">Error loading places.</li>';
    }
  }

  // Render the list items (read‐only)
  function renderList(places) {
    if (!places.length) {
      listEl.innerHTML = '<li class="list-group-item text-muted">No places found.</li>';
      return;
    }

    listEl.innerHTML = places.map(p => `
      <li class="list-group-item">
        <strong>${p.name}</strong>
        <small class="text-secondary fst-italic">(${p.type})</small>
      </li>
    `).join('');
  }
});
