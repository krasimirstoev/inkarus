import Sortable from 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/modular/sortable.esm.js';

document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('parts-list');
  const formEl = document.getElementById('new-part-form');
  if (!listEl || !formEl) return;

  const projectId = listEl.dataset.projectId;

  // Load parts via AJAX and render them
  async function loadParts() {
    try {
      const res  = await fetch(`/parts/${projectId}/json-list`);
      const data = await res.json();
      if (data.success && Array.isArray(data.parts)) {
        renderParts(data.parts);
      }
    } catch (err) {
      console.error('Error loading parts:', err);
    }
  }

  // Render the list of parts and wire up delete buttons
  function renderParts(parts) {
    listEl.innerHTML = '';
    parts.forEach(part => {
      const item = document.createElement('div');
      item.className = 'list-group-item d-flex justify-content-between align-items-center';
      item.dataset.id = part.id;
      item.innerHTML = `
        <div>
          <strong>${part.title}</strong>
          <small class="text-muted"> (Order: ${part.order})</small>
        </div>
        <div>
          <a href="/parts/${projectId}/edit/${part.id}" class="btn btn-sm btn-outline-light me-2">Edit</a>
          <button class="btn btn-sm btn-danger delete-part-btn" data-id="${part.id}">Delete</button>
        </div>
      `;
      listEl.appendChild(item);
    });
  }

  // Handle new-part form submission via AJAX as URL-encoded
  formEl.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(formEl);
    const params   = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      params.append(key, value);
    }

    try {
      const res = await fetch(formEl.action, {
        method: formEl.method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: params.toString()
      });
      if (res.ok) {
        formEl.reset();
        await loadParts();
      } else {
        console.error('Failed to add part, status:', res.status);
      }
    } catch (err) {
      console.error('Error adding part:', err);
    }
  });

  // Delegate delete button clicks to AJAX delete.
  listEl.addEventListener('click', async e => {
    if (!e.target.matches('.delete-part-btn')) return;
    const partId = e.target.dataset.id;
    if (!confirm('Are you sure you want to delete this part?')) return;
    try {
      // DELETE /parts/:id matches our Express route
      const res = await fetch(`/parts/${partId}`, { method: 'DELETE' });
      if (res.ok) {
        await loadParts();
      } else {
        console.error('Failed to delete part, status:', res.status);
      }
    } catch (err) {
      console.error('Error deleting part:', err);
    }
  });

  // Drag-and-drop reordering
  const sortable = new Sortable(listEl, {
    animation: 150,
    onEnd: async () => {
      const items = Array.from(listEl.children);
      for (let index = 0; index < items.length; index++) {
        const id    = items[index].dataset.id;
        const order = index;
        try {
          // reuse save endpoint to update only the order
          await fetch(`/parts/${projectId}/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ order }).toString()
          });
        } catch (err) {
          console.error(`Error updating order for part ${id}:`, err);
        }
      }
      await loadParts();
    }
  });

  // Initial load
  loadParts();
});
