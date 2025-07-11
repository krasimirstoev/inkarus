// public/js/quill/init/notes.js - This file initializes the notes functionality in the Quill editor

export function initNotes(projectId) {
  const notesToggle = document.getElementById('toggle-notes');
  const notesPanel = document.getElementById('notes-panel');
  const notesClose = document.getElementById('close-notes');
  const noteForm = document.getElementById('note-form');

  if (notesToggle && notesPanel && notesClose) {
    notesToggle.addEventListener('click', () => {
      notesPanel.classList.remove('d-none');
      loadNotes(projectId);
    });

    notesClose.addEventListener('click', () => {
      notesPanel.classList.add('d-none');
    });
  }

  if (noteForm) {
    noteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('note-title').value.trim();
      const content = document.getElementById('note-content').value.trim();
      const noteId = noteForm.dataset.editingId;

      if (!title || !content) return;

      try {
        const endpoint = noteId
          ? `/notes/${projectId}/${noteId}`
          : `/notes/${projectId}`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ title, content })
        });

        const data = await res.json();

        if (data.success) {
          document.getElementById('note-title').value = '';
          document.getElementById('note-content').value = '';
          delete noteForm.dataset.editingId;
          loadNotes(projectId);
        } else {
          alert(window.__('Notes.Editor.rejected'));
        }
      } catch (err) {
        console.error("💥 AJAX ERROR:", err);
        alert(window.__('Notes.Editor.generic_error'));
      }
    });
  }

  exposeNoteActions(projectId);
}

export function exposeNoteActions(projectId) {
  window.editNote = async function (id) {
    try {
      const res = await fetch(`/notes/${projectId}/edit/${id}`);
      const html = await res.text();

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const title = tempDiv.querySelector('#note-title').value;
      const content = tempDiv.querySelector('#note-content').value;

      document.getElementById('note-title').value = title;
      document.getElementById('note-content').value = content;

      const noteForm = document.getElementById('note-form');
      noteForm.dataset.editingId = id;
    } catch (err) {
      console.error(window.__('Notes.Editor.load_failed'), err);
    }
  };

  window.deleteNote = async function (id) {
    if (!confirm(window.__('Notes.Editor.confirm_delete'))) return;

    try {
      const res = await fetch(`/notes/delete/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: '_method=DELETE'
      });

      const data = await res.json();

      if (res.ok && data.success) {
        loadNotes(projectId);
      } else {
        alert(window.__('Notes.Editor.delete_failed'));
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert(window.__('Notes.Editor.delete_error'));
    }
  };
}

export async function loadNotes(projectId) {
  const noteList = document.getElementById('note-list');
  try {
    const res = await fetch(`/notes/${projectId}/json`);
    const data = await res.json();

    noteList.innerHTML = '';

    if (data.success && data.notes.length > 0) {
      data.notes
        .filter(note => note.title !== null && note.content !== null)
        .forEach(note => {
          const div = document.createElement('div');
          div.className = 'note-preview mb-3 p-2 border rounded';
          div.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
              <div class="me-3">
                <h6 class="text-light mb-1">${note.title || window.__('Notes.Editor.no_title')}</h6>
                <p class="text-secondary small mb-0">${note.content || window.__('Notes.Editor.no_content')}</p>
              </div>
              <div class="text-end">
                <button class="btn btn-sm btn-outline-warning me-1" onclick="editNote(${note.id})">📝</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteNote(${note.id})">🗑</button>
              </div>
            </div>
          `;
          noteList.appendChild(div);
        });
    } else {
      noteList.innerHTML = `<p class="text-secondary small">${window.__('Notes.Editor.empty')}</p>`;
    }
  } catch (err) {
    console.error("Failed to load notes", err);
  }
}
