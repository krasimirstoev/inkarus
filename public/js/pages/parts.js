document.addEventListener('DOMContentLoaded', () => {
  const modal     = document.getElementById('partsModal');
  const projectId = modal.dataset.projectId;
  const formWrap  = document.getElementById('partsFormContainer');
  const listWrap  = document.getElementById('partsList');

  // load only the modalForm partial
  async function loadForm(partId = '') {
    const url = partId
      ? `/parts/${projectId}/modal/form/${partId}`
      : `/parts/${projectId}/modal/form`;
    const res = await fetch(url);
    if (!res.ok) {
      formWrap.innerHTML = `<p class="text-danger">Error ${res.status} loading form</p>`;
      return;
    }
    formWrap.innerHTML = await res.text();
  }

  // rest stays the same...
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
                  data-id="${p.id}">Edit</button>
          <button class="btn btn-danger btn-sm btn-delete-part"
                  data-id="${p.id}">Delete</button>
        </div>
      </li>
    `).join('');
  }

  modal.addEventListener('show.bs.modal', async () => {
    await loadForm();
    await loadList();
  });

  formWrap.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const res  = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form)
    });
    if (res.headers.get('content-type')?.includes('application/json')) {
      const json = await res.json();
      if (json.success) {
        await loadForm();
        await loadList();
      }
    } else {
      await loadList();
    }
  });

  listWrap.addEventListener('click', async e => {
    if (e.target.matches('.btn-edit-part')) {
      await loadForm(e.target.dataset.id);
    }
    if (e.target.matches('.btn-delete-part')) {
      const id = e.target.dataset.id;
      if (!confirm('Delete this part?')) return;
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