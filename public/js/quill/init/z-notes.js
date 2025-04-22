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
          alert('⚠ Server rejected the note.');
        }
      } catch (err) {
        console.error("💥 AJAX ERROR:", err);
        alert('Something went wrong. Check console.');
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
      console.error("Failed to load note for editing", err);
    }
  };

  window.deleteNote = async function (id) {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const res = await fetch(`/notes/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        loadNotes(projectId);
      } else {
        alert("❌ Failed to delete note");
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("❌ Error occurred while deleting");
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
        .filter(note => note.title && note.content)
        .forEach(note => {
          const div = document.createElement('div');
          div.className = 'note-preview mb-3 p-2 border rounded d-flex justify-content-between align-items-start';

          const noteInfo = document.createElement('div');
          noteInfo.innerHTML = `
            <h6 class="text-light mb-1">${note.title}</h6>
            <p class="text-secondary small mb-0">${note.content}</p>
          `;

          const actions = document.createElement('div');
          actions.className = 'ms-3 text-end';
          actions.innerHTML = `
            <button class="btn btn-sm btn-outline-warning me-1" onclick="editNote(${note.id})">📝</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteNote(${note.id})">🗑</button>
          `;

          div.appendChild(noteInfo);
          div.appendChild(actions);
          noteList.appendChild(div);
        });
    } else {
      noteList.innerHTML = '<p class="text-secondary small">No notes yet.</p>';
    }
  } catch (err) {
    console.error("Failed to load notes", err);
  }
}
