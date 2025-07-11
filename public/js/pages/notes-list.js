// public/js/pages/notes-list.js - This file handles the notes list page functionality

// Ensure the DOM is fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {
  const deleteButtons = document.querySelectorAll('[data-delete-note]');

  deleteButtons.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const noteId = btn.dataset.deleteNote;

      if (!confirm(window.__('Notes.List.confirm_delete'))) return;

      try {
        const res = await fetch(`/notes/delete/${noteId}`, {
          method: 'DELETE',
          headers: { 'Accept': 'application/json' }
        });

        const data = await res.json();

        if (res.ok && data.success) {
          // Remove row visually
          const row = btn.closest('.note-row');
          if (row) row.remove();
        } else {
          alert(window.__('Notes.List.delete_failed'));
        }
      } catch (err) {
        console.error('💥 Error deleting note:', err);
        alert(window.__('Notes.List.delete_error'));
      }
    });
  });
});
