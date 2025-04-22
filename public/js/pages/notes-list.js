document.addEventListener('DOMContentLoaded', () => {
  const deleteButtons = document.querySelectorAll('[data-delete-note]');

  deleteButtons.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const noteId = btn.dataset.deleteNote;

      if (!confirm('Are you sure you want to delete this note?')) return;

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
          alert('❌ Failed to delete note.');
        }
      } catch (err) {
        console.error('💥 Error deleting note:', err);
        alert('❌ Something went wrong.');
      }
    });
  });
});
