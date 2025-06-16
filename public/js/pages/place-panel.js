// public/js/pages/place-panel.js — Handles the “Places” side-panel + AJAX modals

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn   = document.getElementById('toggle-places');
  const closeBtn    = document.getElementById('close-places');
  const panel       = document.getElementById('places-panel');
  const listEl      = document.getElementById('place-list');
  const searchEl    = document.getElementById('place-search');
  const projectId   = document.getElementById('editor-form').dataset.projectId;

  let allPlaces = [];

  // Show / hide side-panel
  toggleBtn.addEventListener('click', () => {
    panel.classList.remove('d-none');
    loadPlaces(searchEl.value);
  });
  closeBtn.addEventListener('click', () => panel.classList.add('d-none'));

  // Live search
  searchEl.addEventListener('input', () => renderFiltered(searchEl.value));

  // Fetch all places
  async function loadPlaces(query = '') {
    listEl.innerHTML = '<li class="list-group-item text-center text-muted">Loading…</li>';
    try {
      const res  = await fetch(`/places/json/${projectId}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error('Failed to load places');
      allPlaces = json.places;
      renderFiltered(query);
    } catch (err) {
      console.error(err);
      listEl.innerHTML = '<li class="list-group-item text-danger">Error loading places.</li>';
    }
  }

  // Filter & render
  function renderFiltered(query) {
    const filtered = allPlaces.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    renderList(filtered);
  }

  function renderList(places) {
    if (!places.length) {
      listEl.innerHTML = '<li class="list-group-item text-muted">No places found.</li>';
      return;
    }
    listEl.innerHTML = places.map(p => `
      <li class="list-group-item d-flex align-items-center" data-id="${p.id}">
        <div>
          <strong>${p.name}</strong>
          <small class="text-secondary fst-italic ms-2">(${p.type})</small>
        </div>
        <span class="ms-auto text-muted">›</span>
      </li>
    `).join('');

    listEl.querySelectorAll('.list-group-item').forEach(li => {
      li.addEventListener('click', () => showPlaceProfile(li.dataset.id));
    });
  }

  // --- AJAX form for create & edit ---
  function openPlaceForm(id) {
    const url = id
      ? `/places/${projectId}/edit/${id}`
      : `/places/${projectId}/new`;

    fetch(url, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
      .then(res => res.text())
      .then(html => {
        // html must include <div id="placeFormModal" class="modal fade">…</div>
        const existing = document.getElementById('placeFormModal');
        if (existing) existing.outerHTML = html;
        else document.body.insertAdjacentHTML('beforeend', html);

        const modalEl = document.getElementById('placeFormModal');
        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();

        // INTERCEPT form submission
        const form = modalEl.querySelector('#place-form');
        form.addEventListener('submit', async e => {
          e.preventDefault();
          const data = new URLSearchParams(new FormData(form));
          try {
            const res = await fetch(form.action, {
              method: 'POST',
              headers: { 'Content-Type':'application/x-www-form-urlencoded','X-Requested-With': 'XMLHttpRequest' },
              body: data.toString()
            });
            // Expect JSON { success: true, place: {...} }
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error('Save failed');
            // Update local data & UI
            const saved = json.place;
            // replace or add in allPlaces
            const idx = allPlaces.findIndex(p => p.id === saved.id);
            if (idx >= 0) allPlaces[idx] = saved;
            else allPlaces.unshift(saved);
            bsModal.hide();
            renderFiltered(searchEl.value);
            // reopen profile for this place
            showPlaceProfile(saved.id);
          } catch (err) {
            console.error(err);
            alert('❌ Could not save place.');
          }
        });

        // After close, reload the list
        modalEl.addEventListener('hidden.bs.modal', () => loadPlaces(searchEl.value));
      })
      .catch(err => {
        console.error('Failed to load form:', err);
        alert('❌ Could not load form.');
      });
  }

  // --- Profile modal with inline Edit ---
  function showPlaceProfile(id) {
    const place = allPlaces.find(p => String(p.id) === String(id));
    if (!place) return;

    const modalHtml = `
      <div id="placeProfileModal" class="modal fade" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content bg-dark text-light">
            <div class="modal-header border-secondary">
              <h5 class="modal-title">
                ${place.name}
                <small class="text-secondary fst-italic ms-2">(${place.type})</small>
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>${place.description || '<em>No description available.</em>'}</p>
            </div>
            <div class="modal-footer">
              <button id="edit-place-btn" class="btn btn-sm btn-outline-warning">✎ Edit</button>
              <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const existing = document.getElementById('placeProfileModal');
    if (existing) existing.outerHTML = modalHtml;
    else document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modalEl = document.getElementById('placeProfileModal');
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();

    modalEl.addEventListener('shown.bs.modal', () => {
      const editBtn = document.getElementById('edit-place-btn');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          bsModal.hide();
          openPlaceForm(id);
        });
      }
    });
  }

  // expose openPlaceForm so profile’s Edit can call it
  window.openPlaceForm = openPlaceForm;
});
