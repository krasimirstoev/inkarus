// public/js/pages/parts.js - Handling Parts Modal Functionality
// ---------------------------------------------------
// This script handles the Parts modal functionality, including loading the form and list of parts,
// submitting the form, and handling edit/delete actions for parts.
// It uses the Fetch API to dynamically load content and update the modal without a full page reload

document.addEventListener('DOMContentLoaded', () => {
  const modal     = document.getElementById('partsModal');
  const projectId = modal.dataset.projectId;
  const formWrap  = document.getElementById('partsFormContainer');
  const listWrap  = document.getElementById('partsList');

  // Helper: Initialize Bootstrap tooltips
  function initTooltips() {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
      new bootstrap.Tooltip(el, {
        trigger: 'click',
        customClass: 'persistent-tooltip'
      });
    });
  }

  // Load modal form
  async function loadForm(partId = '') {
    const url = partId
      ? `/parts/${projectId}/modal/form/${partId}`
      : `/parts/${projectId}/modal/form`;
    const res = await fetch(url);
    if (!res.ok) {
      formWrap.innerHTML = `<p class="text-danger">${__('Parts.Error.loadForm')} (${res.status})</p>`;
      return;
    }
    formWrap.innerHTML = await res.text();
    initTooltips(); // initialize tooltips after dynamic insert
  }

  // Load part list
  async function loadList() {
    const res  = await fetch(`/parts/${projectId}/json-list`);
    const data = await res.json();
    if (!data.success) return;
    listWrap.innerHTML = data.parts.map(p => `
      <li class="list-group-item
                 bg-dark border-secondary text-light
                 d-flex justify-content-between align-items-center"
          data-id="${p.id}">
        <span>${p.title}</span>
        <div>
          <button class="btn btn-outline-light btn-sm btn-edit-part me-1"
                  data-id="${p.id}">${__('Parts.Button.edit')}</button>
          <button class="btn btn-danger btn-sm btn-delete-part"
                  data-id="${p.id}">${__('Parts.Button.delete')}</button>
        </div>
      </li>
    `).join('');
  }

  // On modal open, load content
  modal.addEventListener('show.bs.modal', async () => {
    await loadForm();
    await loadList();
  });

// Submit form handler (URL-encoded version)
formWrap.addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;

  // Convert form data to URL-encoded string
  const formData = new FormData(form);
  const payload = new URLSearchParams(formData);

  const res = await fetch(form.action, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: payload
  });

  // Handle response: either JSON or HTML (redirect/render)
  if (res.headers.get('content-type')?.includes('application/json')) {
    const json = await res.json();
    if (json.success) {
      await loadForm();
      await loadList();
    } else {
      // Optional: show error message here (e.g. toast or alert)
      console.warn('⚠️ Server error:', json.error || 'Unknown error');
    }
  } else {
    await loadList();
  }
});

  // Edit/Delete button handling
  listWrap.addEventListener('click', async e => {
    if (e.target.matches('.btn-edit-part')) {
      await loadForm(e.target.dataset.id);
    }
    if (e.target.matches('.btn-delete-part')) {
      const id = e.target.dataset.id;
      if (!confirm(__('Parts.Confirm.delete'))) return;
      const res = await fetch(`/parts/${projectId}/${id}`, {
        method: 'DELETE',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const json = await res.json();
      if (json.success) {
        await loadForm();
        await loadList();
      }
    }
  });
});
