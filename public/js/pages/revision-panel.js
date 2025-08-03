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
    listEl.innerHTML = `<div class="text-center text-muted">${__('Drafts.Revisions.loading')}</div>`;

    try {
      const res  = await fetch(`/drafts/${projectId}/revisions/${draftId}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error('Failed to load revisions');
      renderRevisions(json.revisions, json.count);
    } catch (err) {
      listEl.innerHTML = `<div class="text-danger text-center">${__('Drafts.Revisions.error_loading')}</div>`;
      console.error(err);
    }
  });

  // Render revisions list with restore/delete/preview buttons
  function renderRevisions(revisions, count) {
    const header = document.getElementById('revision-count');
      if (header) {
        header.textContent = count === 1
          ? __('Drafts.Revisions.revision_count_singular')
          : __('Drafts.Revisions.revision_count_plural', { count });
      }
    if (!revisions.length) {
      listEl.innerHTML = `<div class="text-center text-muted">${__('Drafts.Revisions.none')}</div>`;
      return;
    }

    let html = '<ul class="list-group">';
    for (const rev of revisions) {
      const date = new Date(rev.created_at);
      const typeLabel =
        rev.type === 'manual'   ? __('Drafts.Revisions.type_manual') :
        rev.type === 'autosave' ? __('Drafts.Revisions.type_autosave') :
        __('Drafts.Revisions.type_unknown');

      html += `
        <li class="list-group-item bg-dark text-light border-secondary d-flex justify-content-between align-items-center">
          <div>
            <strong>[${typeLabel}]</strong> ${date.toLocaleString()} – ${rev.word_count} ${__('Drafts.Revisions.words')}
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-success btn-restore" data-id="${rev.id}">♻️ ${__('Drafts.Revisions.button_restore')}</button>
            <button class="btn btn-sm btn-outline-primary btn-preview" data-id="${rev.id}">👁️ ${__('Drafts.Revisions.button_preview')}</button>
            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${rev.id}">🗑 ${__('Drafts.Revisions.button_delete')}</button>
          </div>
        </li>`;
    }
    html += '</ul>';
    listEl.innerHTML = html;

    // Restore logic
    document.querySelectorAll('.btn-restore').forEach(btn => {
      btn.addEventListener('click', async () => {
        const revisionId = btn.dataset.id;
        if (!confirm(__('Drafts.Revisions.confirm_restore'))) return;
        try {
          const res = await fetch(`/drafts/${projectId}/restore/${revisionId}`, { method: 'POST' });
          if (res.ok) {
            alert(__('Drafts.Revisions.restored'));
            window.location.reload();
          } else {
            alert(__('Drafts.Revisions.restore_failed'));
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
        if (!confirm(__('Drafts.Revisions.confirm_delete'))) return;
        try {
          const res = await fetch(`/drafts/${projectId}/revision/${revisionId}`, { method: 'DELETE' });
          if (res.ok) {
            btn.closest('li').remove();
            // update badge
            const badge = document.getElementById('revision-count');
            const current = parseInt(badge.textContent) || 1;
            badge.textContent = `${Math.max(current - 1, 0)} revision${current - 1 !== 1 ? 's' : ''}`;
          } else {
            alert(__('Drafts.Revisions.delete_failed'));
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
        container.innerHTML = `<div class="text-muted text-center">${__('Drafts.Revisions.preview_loading')}</div>`;
        try {
          const res  = await fetch(`/drafts/revision/${revisionId}`);
          const data = await res.json();
          if (!data.success) throw new Error();
          container.innerHTML = `<div class="bg-dark text-light p-3 border rounded">${data.content}</div>`;
          previewModal.show();
        } catch (err) {
          console.error(err);
          container.innerHTML = `<div class="text-danger text-center">${__('Drafts.Revisions.preview_failed')}</div>`;
        }
      });
    });
  }

  // ————— Delete all AUTOSAVE revisions —————
  const deleteAllBtn = document.getElementById('delete-autosaves-btn');
  deleteAllBtn?.addEventListener('click', async () => {
    if (!confirm(__('Drafts.Revisions.confirm_delete_all_autosaves'))) return;
    try {
      const delRes = await fetch(`/drafts/${projectId}/revisions/delete-autosaves`, { method: 'DELETE' });
      if (!delRes.ok) {
        alert(__('Drafts.Revisions.autosave_delete_failed'));
        return;
      }
      alert(__('Drafts.Revisions.autosave_deleted'));
      // reload list
      listEl.innerHTML = `<div class="text-center text-muted">${__('Drafts.Revisions.loading')}</div>`;
      const res2  = await fetch(`/drafts/${projectId}/revisions/${draftId}`);
      const json2 = await res2.json();
      if (res2.ok && json2.success) {
        renderRevisions(json2.revisions, json2.count);
      } else {
        listEl.innerHTML = `<div class="text-danger text-center">${__('Drafts.Revisions.error_loading')}</div>`;
      }
    } catch (err) {
      console.error('❌ Error deleting all autosaves:', err);
      alert(__('Drafts.Revisions.request_failed'));
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
