// drafts.js - Handles chapter management in the draft editor 
import Sortable from 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/modular/sortable.esm.js';

document.addEventListener('DOMContentLoaded', () => {
  const addForm        = document.getElementById('add-chapter-form');
  const container      = document.getElementById('partsContainer');
  const projectId      = container?.dataset.projectId;

  // Rename modal elements
  const renameModalEl  = document.getElementById('renameChapterModal');
  const renameModal    = renameModalEl ? new bootstrap.Modal(renameModalEl) : null;
  const renameForm     = document.getElementById('rename-chapter-form');
  const renameInput    = document.getElementById('rename-chapter-title');
  let   renameChapId   = null;

  // 1) AJAX: add a new chapter
  addForm?.addEventListener('submit', async e => {
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

  // 2) Delegate Open, Rename, Delete, and History clicks
  document.body.addEventListener('click', async e => {
    // Open
    if (e.target.matches('.btn-open-chapter')) {
      e.preventDefault();
      const id = e.target.dataset.id;
      window.location.href = `/drafts/${projectId}/edit/${id}`;
      return;
    }
    // Rename
    if (e.target.matches('.btn-rename-chapter')) {
      e.preventDefault();
      renameChapId = e.target.dataset.id;
      renameInput.value = e.target.dataset.title;
      renameModal?.show();
      return;
    }
    // Delete
    if (e.target.matches('.btn-delete-chapter')) {
      e.preventDefault();
      const id = e.target.dataset.id;
      if (!confirm('Are you sure you want to delete this chapter?')) return;
      await fetch(`/drafts/${projectId}/delete/${id}`, { method: 'DELETE' });
      await reloadGroups();
      return;
    }
    // Revisions (History)
    if (e.target.matches('.btn-revisions')) {
      e.preventDefault();
      const id = e.target.dataset.id;
      const title = e.target.dataset.title;
      openRevisionModal(id, title);
    }
  });

  // 3) Handle Rename form submit
  renameForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const newTitle = renameInput.value.trim();
    if (!newTitle) return;
    const res = await fetch(`/drafts/${projectId}/rename/${renameChapId}`, {
      method: 'POST',
      headers: { 'Content-Type':'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ title: newTitle }).toString()
    });
    if (res.ok) {
      renameModal?.hide();
      await reloadGroups();
    } else {
      console.error('Rename failed', res.status);
    }
  });

  // 4) Initialize Sortable on each chapter list
  function initSorting() {
    container?.querySelectorAll('ul[data-part-id]').forEach(list => {
      if (list.dataset.sortable) return;
      list.dataset.sortable = 'true';

      Sortable.create(list, {
        group: 'chapters',
        animation: 150,
        handle: '.chapter-item',
        onEnd: async evt => {
          const chapId  = evt.item.dataset.id;
          const fromPid = evt.from.dataset.partId;
          const toPid   = evt.to.dataset.partId;
          const endpoint = (fromPid === toPid)
            ? `/drafts/${projectId}/reorder/${chapId}`
            : `/drafts/${projectId}/move/${chapId}`;
          await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type':'application/json' },
            body: JSON.stringify({ part_id: toPid, order: evt.newIndex })
          });
          await reloadGroups();
        }
      });
    });
  }

  // 5) Reload via AJAX and re-render
  async function reloadGroups() {
    try {
      const res  = await fetch(`/drafts/${projectId}/json-groups`);
      const data = await res.json();
      if (!data.success) throw new Error('json-groups failed');
      renderGroups(data.groups);
      initSorting();
    } catch {
      window.location.reload();
    }
  }

  // 6) Render cards with header styling, divider, and buttons
  function renderGroups(groups) {
    container.innerHTML = '';
    groups.forEach(g => {
      const title = g.id === null
        ? 'Ungrouped (Without Part)'
        : g.title;

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
              <div class="d-flex align-items-center">
                <button class="btn btn-sm btn-primary btn-open-chapter me-2"
                        data-id="${ch.id}">Open</button>
                <button class="btn btn-sm btn-warning btn-rename-chapter me-2"
                        data-id="${ch.id}"
                        data-title="${ch.title}">Rename</button>
                <button class="btn btn-sm btn-secondary btn-revisions me-2"
                        data-id="${ch.id}" data-title="${ch.title}">
                  🕘 History
                </button> 
                <button class="btn btn-sm btn-danger btn-delete-chapter"
                        data-id="${ch.id}">Delete</button>
              </div>
            </li>`).join('')
        : `<li class="list-group-item empty text-center text-muted"
               style="min-height:1.5rem;cursor:move;">
             Drop here
           </li>`;

      container.insertAdjacentHTML('beforeend', `
        <div class="card mb-4 bg-dark border-secondary border-2 rounded shadow-sm text-light">
          <div class="card-header fw-bold fs-4">${title}</div>
          <hr class="border-light m-0">
          <div class="card-body p-0">
            <ul class="list-group list-group-flush" data-part-id="${g.id}">
              ${itemsHtml}
            </ul>
          </div>
        </div>`);
    });
  }

  // 7) Open revision modal and fetch data
function openRevisionModal(draftId, title) {
  // Wait one event loop cycle to ensure DOM is ready
  setTimeout(() => {
    const modalEl     = document.getElementById('revisionModal');
    const container   = document.getElementById('revisions-list');
    const modalTitle  = document.getElementById('revisionsModalTitle');
    const titleText   = document.getElementById('revisionsModalText');
    const countBadge  = document.getElementById('revision-count');
    const deleteBtn   = document.getElementById('delete-autosaves-btn');

    // Check if all elements exist in DOM
    if (!modalEl || !container || !modalTitle || !titleText || !countBadge || !deleteBtn) {
      console.warn('❌ Some elements of the revision modal are missing in the DOM');
      console.log('modalEl:', modalEl);
      console.log('container:', container);
      console.log('modalTitle:', modalTitle);
      console.log('titleText:', titleText);
      console.log('countBadge:', countBadge);
      console.log('deleteBtn:', deleteBtn);
      return;
    }

    modalEl.dataset.draftId = draftId;

    fetch(`/drafts/${projectId}/revisions/${draftId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success || !Array.isArray(data.revisions)) {
          container.innerHTML = '<p class="text-muted">No revisions found for this chapter.</p>';
          titleText.textContent = `Revisions for "${title}"`;
          countBadge.textContent = '0';
          return;
        }

        const revisions = data.revisions;

        titleText.textContent = `Revisions for "${title}"`;
        countBadge.textContent = `${revisions.length} revision${revisions.length !== 1 ? 's' : ''}`;

        container.innerHTML = `
          <ul class="list-group">
            ${revisions.map(r => `
              <li class="list-group-item bg-dark text-light d-flex justify-content-between align-items-center">
                <span>${r.created_at} – ${r.word_count || 0} words (${r.type})</span>
                <button class="btn btn-sm btn-outline-primary" disabled>👁️ Preview</button>
              </li>
            `).join('')}
          </ul>
        `;

        // Attach fresh click handler to 🧹 button
        deleteBtn.onclick = async () => {
          console.log('🧹 Delete button clicked');
          if (!confirm('Are you sure you want to delete all autosave revisions?')) return;

          try {
            const res = await fetch(`/drafts/${draftId}/revisions/delete-autosaves`, {
              method: 'DELETE'
            });

            if (res.ok) {
              alert('Autosave revisions deleted.');
              openRevisionModal(draftId, title); // reload the modal
            } else {
              alert('Error deleting autosaves.');
            }
          } catch (err) {
            console.error('❌ Failed to delete autosaves:', err);
            alert('Request failed.');
          }
        };
      });

    // Show the modal
    const modalInstance = new bootstrap.Modal(modalEl);
    modalInstance.show();
    console.log('🟢 Showing modal now');
  }, 0); // Let the DOM breathe
}

  // 8) Initial setup
  renderGroups([]);
  initSorting();
  reloadGroups();
});
