// public/js/pages/drafts.js
import Sortable from 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/modular/sortable.esm.js';

document.addEventListener('DOMContentLoaded', () => {
  const addForm   = document.getElementById('add-chapter-form');
  const container = document.getElementById('partsContainer');
  const projectId = container.dataset.projectId;

  // AJAX: add a new chapter
  addForm.addEventListener('submit', async e => {
    e.preventDefault();
    const params = new URLSearchParams(new FormData(addForm));
    await fetch(addForm.action, {
      method: 'POST',
      headers: { 'Content-Type':'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    addForm.reset();
    await reloadGroups();
  });

  // AJAX: delete a chapter
  document.body.addEventListener('click', async e => {
    if (!e.target.matches('.btn-delete-chapter')) return;
    e.preventDefault();
    const id = e.target.dataset.id;
    if (!confirm('Are you sure you want to delete this chapter?')) return;
    await fetch(`/drafts/${projectId}/delete/${id}`, { method: 'DELETE' });
    await reloadGroups();
  });

  // Initialize Sortable on each chapter list
  function initSorting() {
    container.querySelectorAll('ul[data-part-id]').forEach(list => {
      if (list.dataset.sortable) return;
      list.dataset.sortable = 'true';

      Sortable.create(list, {
        group: 'chapters',
        animation: 150,
        handle: '.chapter-item',
        onEnd: async evt => {
          const { item, from, to, newIndex } = evt;
          const chapId = item.dataset.id;
          const fromPid = from.dataset.partId;
          const toPid   = to.dataset.partId;
          const isMove  = fromPid !== toPid;
          const endpoint = isMove
            ? `/drafts/${projectId}/move/${chapId}`
            : `/drafts/${projectId}/reorder/${chapId}`;

          await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ part_id: toPid, order: newIndex })
          });
          await reloadGroups();
        }
      });
    });
  }

  // Reload via AJAX and re-render
  async function reloadGroups() {
    try {
      const res  = await fetch(`/drafts/${projectId}/json-groups`);
      const data = await res.json();
      if (!data.success) throw new Error();
      renderGroups(data.groups);
      initSorting();
    } catch {
      window.location.reload();
    }
  }

  // Render cards with header styling and divider
  function renderGroups(groups) {
    container.innerHTML = '';
    groups.forEach(g => {
      const title = g.id === null ? 'Ungrouped (Without Part)' : g.title;

      // build list items or placeholder
      const itemsHtml = g.chapters.length
        ? g.chapters.map(ch => `
            <li class="list-group-item chapter-item
                   bg-dark border-secondary text-light
                   d-flex justify-content-between align-items-center"
                data-id="${ch.id}">
              <a href="/drafts/${projectId}/edit/${ch.id}"
                 class="text-white text-decoration-none flex-grow-1">
                ${ch.title}
              </a>
              <button data-id="${ch.id}"
                      class="btn btn-sm btn-danger btn-delete-chapter">
                Delete
              </button>
            </li>`).join('')
        : `<li class="list-group-item empty text-center text-muted"
               style="min-height:1.5rem;cursor:move;">
             Drop here
           </li>`;

      container.insertAdjacentHTML('beforeend', `
        <div class="card mb-4 bg-dark border-secondary border-2 rounded shadow-sm text-light">
          <!-- Part title: bold and larger -->
          <div class="card-header fw-bold fs-4">
            ${title}
          </div>
          <!-- Divider under the header -->
          <hr class="border-light m-0">
          <div class="card-body p-0">
            <ul class="list-group list-group-flush" data-part-id="${g.id}">
              ${itemsHtml}
            </ul>
          </div>
        </div>`);
    });
  }

  // initial kick-off
  renderGroups([]);  // optional: clear first
  initSorting();
  reloadGroups();
});
