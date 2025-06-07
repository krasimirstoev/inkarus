// revision-panel.js — Handles revision history panel logic
document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('open-revisions');
  const modalEl = document.getElementById('revisionModal');
  const modal   = new bootstrap.Modal(modalEl);
  const listEl  = document.getElementById('revisions-list');

  const projectId = document.getElementById('editor-form').dataset.projectId;
  const draftId   = document.getElementById('editor-form').dataset.draftId;

  // Open revisions modal and load history
  openBtn.addEventListener('click', async () => {
    modal.show();
    listEl.innerHTML = '<div class="text-center text-muted">Loading...</div>';

    try {
      const res = await fetch(`/drafts/${projectId}/revisions/${draftId}`);
      if (!res.ok) throw new Error('Failed to load revisions');
      const json = await res.json();
      if (!json.success) throw new Error('Failed to load revisions');
      renderRevisions(json.revisions);
    } catch (err) {
      listEl.innerHTML = '<div class="text-danger text-center">Error loading revisions</div>';
      console.error(err);
    }
  });

  // Render revisions list with restore buttons
function renderRevisions(revisions) {
  if (!revisions.length) {
    listEl.innerHTML = '<div class="text-center text-muted">No revisions available.</div>';
    return;
  }

  let html = '<ul class="list-group">';
  console.log('Revisions from server:', revisions);
  revisions.forEach(rev => {
    const date = new Date(rev.created_at);
    const typeLabel = rev.type === 'manual' ? 'Manual ★' :
                      rev.type === 'autosave' ? 'Autosave' :
                      rev.type ? rev.type : 'Unknown';

    html += `
      <li class="list-group-item bg-dark text-light border-secondary d-flex justify-content-between align-items-center">
        <div>
          <strong>[${typeLabel}]</strong> ${date.toLocaleString()} – ${rev.word_count} words
        </div>
        <button class="btn btn-sm btn-outline-success btn-restore" data-id="${rev.id}">
          ♻️ Restore
        </button>
      </li>`;
  });
  html += '</ul>';
  listEl.innerHTML = html;

  // Restore buttons logic
  document.querySelectorAll('.btn-restore').forEach(btn => {
    btn.addEventListener('click', async () => {
      const revisionId = btn.dataset.id;
      if (!confirm('Are you sure you want to restore this revision?')) return;

      try {
        const res = await fetch(`/drafts/${projectId}/restore/${revisionId}`, {
          method: 'POST'
        });

        if (res.ok) {
          alert('✅ Revision restored.');
          window.location.reload();
        } else {
          alert('❌ Failed to restore revision.');
        }
      } catch (err) {
        alert('❌ An error occurred.');
        console.error(err);
      }
    });
  });
}

});