// revision-panel.js — Handles revision history panel logic

document.addEventListener('DOMContentLoaded', () => {
  const openBtn    = document.getElementById('open-revisions');
  const modalEl    = document.getElementById('revisionModal');
  const modal      = new bootstrap.Modal(modalEl);
  const listEl     = document.getElementById('revisions-list');
  const projectId  = document.getElementById('editor-form').dataset.projectId;
  const draftId    = document.getElementById('editor-form').dataset.draftId;

  // Fix for aria-hidden warning in Chrome
  modalEl.addEventListener('hidden.bs.modal', () => {
    if (document.activeElement && modalEl.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  });

  // Open revisions modal and load history
  openBtn.addEventListener('click', async () => {
    modal.show();
    listEl.innerHTML = '<div class="text-center text-muted">Loading...</div>';

    try {
      const res  = await fetch(`/drafts/${projectId}/revisions/${draftId}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error('Failed to load revisions');
      renderRevisions(json.revisions, json.count);
    } catch (err) {
      listEl.innerHTML = '<div class="text-danger text-center">Error loading revisions</div>';
      console.error(err);
    }
  });

  // Render revisions list with restore/delete/preview buttons
  function renderRevisions(revisions, count) {
    const header = document.getElementById('revision-count');
    header && (header.textContent = `${count} revision${count !== 1 ? 's' : ''}`);

    if (!revisions.length) {
      listEl.innerHTML = '<div class="text-center text-muted">No revisions available.</div>';
      return;
    }

    let html = '<ul class="list-group">';
    for (const rev of revisions) {
      const date = new Date(rev.created_at);
      const typeLabel =
        rev.type === 'manual'   ? 'Manual ★' :
        rev.type === 'autosave' ? 'Autosave' :
        rev.type || 'Unknown';

      html += `
        <li class="list-group-item bg-dark text-light border-secondary d-flex justify-content-between align-items-center">
          <div>
            <strong>[${typeLabel}]</strong> ${date.toLocaleString()} – ${rev.word_count} words
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-success btn-restore" data-id="${rev.id}">♻️ Restore</button>
            <button class="btn btn-sm btn-outline-primary btn-preview" data-id="${rev.id}">👁️ Preview</button>
            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${rev.id}">🗑 Delete</button>
          </div>
        </li>`;
    }
    html += '</ul>';
    listEl.innerHTML = html;

    // Restore logic
    document.querySelectorAll('.btn-restore').forEach(btn => {
      btn.addEventListener('click', async () => {
        const revisionId = btn.dataset.id;
        if (!confirm('Are you sure you want to restore this revision?')) return;
        try {
          const res = await fetch(`/drafts/${projectId}/restore/${revisionId}`, { method: 'POST' });
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

    // Individual delete logic
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const revisionId = btn.dataset.id;
        if (!confirm('Are you sure you want to delete this revision? This action cannot be undone.')) return;
        try {
          const res = await fetch(`/drafts/${projectId}/revision/${revisionId}`, { method: 'DELETE' });
          if (res.ok) {
            btn.closest('li').remove();
            // update badge
            const badge = document.getElementById('revision-count');
            const current = parseInt(badge.textContent) || 1;
            badge.textContent = `${Math.max(current - 1, 0)} revision${current - 1 !== 1 ? 's' : ''}`;
          } else {
            alert('❌ Failed to delete revision.');
          }
        } catch (err) {
          alert('❌ An error occurred.');
          console.error(err);
        }
      });
    });

    // Preview logic
    document.querySelectorAll('.btn-preview').forEach(btn => {
      btn.addEventListener('click', async () => {
        const revisionId = btn.dataset.id;
        const previewModal = new bootstrap.Modal(document.getElementById('revisionPreviewModal'));
        const container = document.getElementById('revisionPreviewContent');
        container.innerHTML = '<div class="text-muted text-center">Loading...</div>';
        try {
          const res  = await fetch(`/drafts/revision/${revisionId}`);
          const data = await res.json();
          if (!data.success) throw new Error();
          container.innerHTML = `<div class="bg-dark text-light p-3 border rounded">${data.content}</div>`;
          previewModal.show();
        } catch (err) {
          console.error(err);
          container.innerHTML = '<div class="text-danger text-center">Error loading preview.</div>';
        }
      });
    });
  }

  // ————— Delete all AUTOSAVE revisions —————
  const deleteAllBtn = document.getElementById('delete-autosaves-btn');
  deleteAllBtn?.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete all autosave revisions?')) return;
    try {
      const delRes = await fetch(`/drafts/${projectId}/revisions/delete-autosaves`, { method: 'DELETE' });
      if (!delRes.ok) {
        alert('❌ Failed to delete autosave revisions.');
        return;
      }
      alert('🧹 All autosave revisions deleted.');
      // reload list
      listEl.innerHTML = '<div class="text-center text-muted">Loading...</div>';
      const res2  = await fetch(`/drafts/${projectId}/revisions/${draftId}`);
      const json2 = await res2.json();
      if (res2.ok && json2.success) {
        renderRevisions(json2.revisions, json2.count);
      } else {
        listEl.innerHTML = '<div class="text-danger text-center">Error loading revisions</div>';
      }
    } catch (err) {
      console.error('❌ Error deleting all autosaves:', err);
      alert('⚠️ Request failed.');
    }
  });

  // Close modal when clicking outside
  modalEl.addEventListener('click', e => {
    if (e.target === modalEl) {
      if (document.activeElement && modalEl.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      modal.hide();
    }
  });
});
