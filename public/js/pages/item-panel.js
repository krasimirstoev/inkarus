// public/js/pages/item-panel.js — Handles the “Items” side-panel + AJAX modals

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn   = document.getElementById('toggle-items');
  const closeBtn    = document.getElementById('close-items');
  const panel       = document.getElementById('items-panel');
  const listEl      = document.getElementById('item-list');
  const searchEl    = document.getElementById('item-search');
  const projectId   = document.getElementById('editor-form').dataset.projectId;

  let allItems = [];

  // Show / hide side-panel
  toggleBtn.addEventListener('click', () => {
    panel.classList.remove('d-none');
    loadItems(searchEl.value);
  });
  closeBtn.addEventListener('click', () => panel.classList.add('d-none'));

  // Live search
  searchEl.addEventListener('input', () => renderFiltered(searchEl.value));

  // Fetch all items
  async function loadItems(query = '') {
    listEl.innerHTML = '<li class="list-group-item text-center text-muted">Loading…</li>';
    try {
      const res  = await fetch(`/items/json/${projectId}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error('Failed to load items');
      allItems = json.items;
      renderFiltered(query);
    } catch (err) {
      console.error(err);
      listEl.innerHTML = '<li class="list-group-item text-danger">Error loading items.</li>';
    }
  }

  // Filter & render
  function renderFiltered(query) {
    const filtered = allItems.filter(i =>
      i.name.toLowerCase().includes(query.toLowerCase())
    );
    renderList(filtered);
  }

  function renderList(items) {
    if (!items.length) {
      listEl.innerHTML = '<li class="list-group-item text-muted">No items found.</li>';
      return;
    }
    listEl.innerHTML = items.map(i => `
      <li class="list-group-item d-flex align-items-center" data-id="${i.id}">
        <div>
          <strong>${i.name}</strong>
          <small class="text-secondary fst-italic ms-2">(${i.display_status})</small>
        </div>
      </li>
    `).join('');

    listEl.querySelectorAll('.list-group-item').forEach(li => {
      li.addEventListener('click', () => showItemProfile(li.dataset.id));
    });
  }

  // --- AJAX form for create & edit ---
  function openItemForm(id) {
    const url = id
      ? `/items/${projectId}/edit/${id}`
      : `/items/${projectId}/new`;

    fetch(url, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
      .then(res => res.text())
      .then(html => {
        const existing = document.getElementById('itemFormModal');
        if (existing) existing.outerHTML = html;
        else document.body.insertAdjacentHTML('beforeend', html);

        const modalEl = document.getElementById('itemFormModal');
        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();

        const form = modalEl.querySelector('#item-form');
        form.addEventListener('submit', async e => {
          e.preventDefault();
          const data = new URLSearchParams(new FormData(form));
          try {
            const res = await fetch(form.action, {
              method: 'POST',
              headers: { 'Content-Type':'application/x-www-form-urlencoded','X-Requested-With': 'XMLHttpRequest' },
              body: data.toString()
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error('Save failed');
            const saved = json.item;
            const idx = allItems.findIndex(i => i.id === saved.id);
            if (idx >= 0) allItems[idx] = saved;
            else allItems.unshift(saved);
            bsModal.hide();
            renderFiltered(searchEl.value);
            showItemProfile(saved.id);
          } catch (err) {
            console.error(err);
            alert('❌ Could not save item.');
          }
        });

        modalEl.addEventListener('hidden.bs.modal', () => loadItems(searchEl.value));
      })
      .catch(err => {
        console.error('Failed to load form:', err);
        alert('❌ Could not load form.');
      });
  }

  // --- Profile modal with inline Edit ---
  function showItemProfile(id) {
    const item = allItems.find(i => String(i.id) === String(id));
    if (!item) return;

    const modalHtml = `
      <div id="itemProfileModal" class="modal fade" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content bg-dark text-light">
            <div class="modal-header border-secondary">
              <h5 class="modal-title">
                ${item.name}
                <small class="text-secondary fst-italic ms-2">(${item.display_status})</small>
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>${item.description || '<em>No description available.</em>'}</p>
            </div>
            <div class="modal-footer">
              <button id="edit-item-btn" class="btn btn-sm btn-outline-warning">✎ Edit</button>
              <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const existing = document.getElementById('itemProfileModal');
    if (existing) existing.outerHTML = modalHtml;
    else document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modalEl = document.getElementById('itemProfileModal');
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();

    modalEl.addEventListener('shown.bs.modal', () => {
      const editBtn = document.getElementById('edit-item-btn');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          bsModal.hide();
          openItemForm(id);
        });
      }
    });
  }

  // expose for reuse (optional)
  window.openItemForm = openItemForm;
});
